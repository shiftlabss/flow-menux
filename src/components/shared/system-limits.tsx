"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────
interface LimitItem {
  label: string;
  current: number;
  max: number;
  /** Optional custom display format for current/max (e.g. "1.2 GB / 5 GB") */
  display?: string;
}

// ── Mock data ──────────────────────────────────────────────────────
const mockLimits: LimitItem[] = [
  { label: "Usuários", current: 5, max: 20 },
  { label: "Unidades", current: 3, max: 10 },
  { label: "Oportunidades ativas", current: 47, max: 500 },
  { label: "Clientes ativos", current: 23, max: 200 },
  {
    label: "Armazenamento",
    current: 1.2,
    max: 5,
    display: "1.2 GB / 5 GB",
  },
];

// ── Helpers ────────────────────────────────────────────────────────
function getUsagePercent(current: number, max: number) {
  if (max === 0) return 0;
  return Math.round((current / max) * 100);
}

function getUsageColor(percent: number) {
  if (percent > 90) return "text-status-danger";
  if (percent >= 70) return "text-status-warning";
  return "text-status-success";
}

function getProgressColor(percent: number) {
  if (percent > 90) return "[&>[data-slot=progress-indicator]]:bg-status-danger";
  if (percent >= 70) return "[&>[data-slot=progress-indicator]]:bg-status-warning";
  return "[&>[data-slot=progress-indicator]]:bg-status-success";
}

// ── LimitRow ───────────────────────────────────────────────────────
function LimitRow({ item }: { item: LimitItem }) {
  const percent = getUsagePercent(item.current, item.max);
  const displayText = item.display ?? `${item.current} / ${item.max}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm text-zinc-700">{item.label}</span>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-zinc-500">{displayText}</span>
          <span
            className={cn(
              "font-heading text-xs font-semibold",
              getUsageColor(percent)
            )}
          >
            {percent}%
          </span>
        </div>
      </div>
      <Progress
        value={percent}
        className={cn("h-2", getProgressColor(percent))}
      />
    </div>
  );
}

// ── Warning Banner ─────────────────────────────────────────────────
function WarningBanner({ resources }: { resources: string[] }) {
  if (resources.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-[15px] bg-status-warning-light border border-status-warning/30 p-4">
      <AlertTriangle className="size-5 text-status-warning shrink-0 mt-0.5" />
      <div className="space-y-1">
        {resources.map((resource) => (
          <p key={resource} className="font-body text-sm text-zinc-700">
            Atenção: Você está próximo do limite de{" "}
            <span className="font-semibold">{resource}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
interface SystemLimitsProps {
  /** Override mock data with real limits */
  limits?: LimitItem[];
}

export function SystemLimits({ limits }: SystemLimitsProps) {
  const data = limits ?? mockLimits;

  const warningResources = useMemo(() => {
    return data
      .filter((item) => getUsagePercent(item.current, item.max) > 80)
      .map((item) => item.label);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <WarningBanner resources={warningResources} />

      {/* Limits card */}
      <Card className="rounded-[15px]">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Limites do sistema
          </CardTitle>
          <CardDescription className="font-body">
            Uso atual dos recursos do seu plano
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {data.map((item) => (
            <LimitRow key={item.label} item={item} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
