"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ActivityType, ActivityStatus } from "@/types";
import { typeIconComponents, typeColors, typeLabelsPt, allActivityTypes } from "./config";

interface SideMetricsProps {
  counts: {
    total: number;
    byStatus: Record<ActivityStatus, number>;
    byType: Record<ActivityType, number>;
  };
  weeklyCompletionRate: number;
}

const statusRows: {
  key: ActivityStatus;
  label: string;
  dotColor: string;
}[] = [
  { key: "pending", label: "Pendentes", dotColor: "bg-status-info" },
  { key: "overdue", label: "Atrasadas", dotColor: "bg-status-danger" },
  { key: "completed", label: "Concluidas", dotColor: "bg-status-success" },
  { key: "cancelled", label: "Canceladas", dotColor: "bg-zinc-400" },
];

export function ActivitySideMetrics({
  counts,
  weeklyCompletionRate,
}: SideMetricsProps) {
  return (
    <div className="sticky top-6 hidden w-[280px] shrink-0 space-y-4 lg:block">
      {/* Total */}
      <Card className="premium-panel rounded-[var(--radius-bento-card)] border-zinc-200/70 shadow-[var(--shadow-bento-sm)]">
        <CardContent className="p-5">
          <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
            Total de Atividades
          </p>
          <p className="mt-1 font-heading text-3xl font-bold text-black">
            {counts.total}
          </p>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card className="premium-panel rounded-[var(--radius-bento-card)] border-zinc-200/70 shadow-[var(--shadow-bento-sm)]">
        <CardContent className="p-5">
          <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Por Status
          </p>
          <div className="space-y-2.5">
            {statusRows.map(({ key, label, dotColor }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                  <span className="font-body text-sm text-zinc-600">
                    {label}
                  </span>
                </div>
                <span className="font-heading text-sm font-semibold text-black">
                  {counts.byStatus[key]}
                </span>
              </div>
            ))}
          </div>

          {/* Mini progress bar */}
          {counts.total > 0 && (
            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              {counts.byStatus.overdue > 0 && (
                <div
                  className="bg-status-danger transition-all duration-300"
                  style={{
                    width: `${(counts.byStatus.overdue / counts.total) * 100}%`,
                  }}
                />
              )}
              {counts.byStatus.pending > 0 && (
                <div
                  className="bg-status-info transition-all duration-300"
                  style={{
                    width: `${(counts.byStatus.pending / counts.total) * 100}%`,
                  }}
                />
              )}
              {counts.byStatus.completed > 0 && (
                <div
                  className="bg-status-success transition-all duration-300"
                  style={{
                    width: `${(counts.byStatus.completed / counts.total) * 100}%`,
                  }}
                />
              )}
              {counts.byStatus.cancelled > 0 && (
                <div
                  className="bg-zinc-400 transition-all duration-300"
                  style={{
                    width: `${(counts.byStatus.cancelled / counts.total) * 100}%`,
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Completion Rate */}
      <Card className="premium-panel rounded-[var(--radius-bento-card)] border-zinc-200/70 shadow-[var(--shadow-bento-sm)]">
        <CardContent className="p-5">
          <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
            Conclusao Semanal
          </p>
          <div className="mt-2 flex items-end gap-2">
            <p className="font-heading text-3xl font-bold text-black">
              {weeklyCompletionRate}%
            </p>
            <p className="mb-1 font-body text-xs text-zinc-400">esta semana</p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                weeklyCompletionRate >= 70
                  ? "bg-status-success"
                  : weeklyCompletionRate >= 40
                    ? "bg-status-warning"
                    : "bg-status-danger"
              }`}
              style={{ width: `${Math.min(weeklyCompletionRate, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* By Type */}
      <Card className="premium-panel rounded-[var(--radius-bento-card)] border-zinc-200/70 shadow-[var(--shadow-bento-sm)]">
        <CardContent className="p-5">
          <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Por Tipo
          </p>
          <div className="space-y-2.5">
            {allActivityTypes.map((type) => {
              const Icon = typeIconComponents[type];
              const tc = typeColors[type];
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${tc.bg}`}
                    >
                      <span className={tc.text}>
                        <Icon className="h-3 w-3" />
                      </span>
                    </div>
                    <span className="font-body text-sm text-zinc-600">
                      {typeLabelsPt[type]}
                    </span>
                  </div>
                  <span className="font-heading text-sm font-semibold text-black">
                    {counts.byType[type]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
