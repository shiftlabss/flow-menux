"use client";

import {
  DollarSign,
  Target,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { Goal } from "@/types";

// ---------------------------------------------------------------------------
// Mock Data — top goals for the widget
// ---------------------------------------------------------------------------

const widgetGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Receita Mensal",
    type: "revenue",
    target: 300000,
    current: 215000,
    period: "monthly",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
  },
  {
    id: "goal-2",
    title: "Oportunidades",
    type: "opportunities",
    target: 60,
    current: 47,
    period: "monthly",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
  },
  {
    id: "goal-3",
    title: "Conversao",
    type: "conversion",
    target: 35,
    current: 32,
    period: "quarterly",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const goalIcons = {
  revenue: <DollarSign className="h-3.5 w-3.5" />,
  opportunities: <Target className="h-3.5 w-3.5" />,
  conversion: <TrendingUp className="h-3.5 w-3.5" />,
  activities: <Activity className="h-3.5 w-3.5" />,
};

// ---------------------------------------------------------------------------
// GoalsWidget
// ---------------------------------------------------------------------------

export function GoalsWidget() {
  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base font-semibold text-black">
            Metas
          </CardTitle>
          <Link
            href="/goals"
            className="flex items-center gap-1 font-body text-xs font-medium text-brand transition-colors hover:text-brand/80"
          >
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {widgetGoals.map((goal) => {
          const percentage = Math.min(
            Math.round((goal.current / goal.target) * 100),
            100
          );

          return (
            <div key={goal.id} className="space-y-1.5">
              {/* Row: icon + name + percentage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-brand">{goalIcons[goal.type]}</span>
                  <span className="font-body text-sm text-zinc-700">
                    {goal.title}
                  </span>
                </div>
                <span
                  className={`font-heading text-xs font-bold ${
                    percentage >= 70
                      ? "text-status-success"
                      : percentage >= 40
                        ? "text-status-warning"
                        : "text-status-danger"
                  }`}
                >
                  {percentage}%
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
