"use client";

import { Plus, List, GitCommitVertical, CalendarDays, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "list" | "timeline" | "week" | "month";

interface ActivityHeaderProps {
  overdueCount: number;
  pendingCount: number;
  completedCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNewActivity: () => void;
}

const viewModes: { key: ViewMode; label: string; icon: typeof List }[] = [
  { key: "list", label: "Lista", icon: List },
  { key: "timeline", label: "Timeline", icon: GitCommitVertical },
  { key: "week", label: "Semana", icon: CalendarDays },
  { key: "month", label: "Mes", icon: CalendarRange },
];

export function ActivityHeader({
  overdueCount,
  pendingCount,
  completedCount,
  viewMode,
  onViewModeChange,
  onNewActivity,
}: ActivityHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Row: Title + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
            Atividades
          </h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Gerencie compromissos e priorize execucao
          </p>

          {/* Metric Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MetricBadge
              count={overdueCount}
              label="atrasadas"
              dotColor="bg-status-danger"
              bgColor="bg-status-danger-light"
              textColor="text-status-danger"
            />
            <MetricBadge
              count={pendingCount}
              label="pendentes"
              dotColor="bg-status-warning"
              bgColor="bg-status-warning-light"
              textColor="text-status-warning"
            />
            <MetricBadge
              count={completedCount}
              label="concluidas"
              dotColor="bg-status-success"
              bgColor="bg-status-success-light"
              textColor="text-status-success"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div
            className="flex items-center rounded-full border border-zinc-200 bg-zinc-50/80 p-0.5 shadow-sm"
            role="tablist"
            aria-label="Modo de visualizacao"
          >
            {viewModes.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={viewMode === key}
                onClick={() => onViewModeChange(key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-heading text-xs font-medium transition-colors ${
                  viewMode === key
                    ? "bg-brand text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden sr-only">{label}</span>
              </button>
            ))}
          </div>

          {/* New Activity */}
          <Button
            className="rounded-full bg-brand font-heading text-sm text-white shadow-sm hover:bg-brand-strong"
            onClick={onNewActivity}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricBadge({
  count,
  label,
  dotColor,
  bgColor,
  textColor,
}: {
  count: number;
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full ${bgColor} px-3 py-1`}
    >
      <div className={`h-2 w-2 rounded-full ${dotColor}`} />
      <span className={`font-heading text-xs font-semibold ${textColor}`}>
        {count}
      </span>
      <span className={`font-body text-xs ${textColor} opacity-80`}>
        {label}
      </span>
    </div>
  );
}
