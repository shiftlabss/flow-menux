"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Activity } from "@/types";
import { today, dateOnly, isSameDay, getDaysInMonth, parseDate } from "./helpers";
import { typeDotColors, typeLabels } from "./config";

interface MonthViewProps {
  activities: Activity[];
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function ActivityMonthView({ activities }: MonthViewProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = today();
  const viewYear = now.getFullYear();
  const viewMonth = now.getMonth() + monthOffset;
  const adjustedDate = new Date(viewYear, viewMonth, 1);
  const year = adjustedDate.getFullYear();
  const month = adjustedDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = adjustedDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const activityDates = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of activities) {
      const d = parseDate(a.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = a.dueDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(a);
      }
    }
    return map;
    // Use monthOffset as dep since year/month are derived from it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, monthOffset]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setMonthOffset((p) => p - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-heading text-sm font-medium capitalize text-zinc-700">
          {monthName}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setMonthOffset((p) => p + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded-[var(--radius-bento-card)] border border-zinc-200 shadow-[var(--shadow-bento-sm)]">
        {/* Weekday header */}
        <div className="hidden grid-cols-7 border-b border-zinc-200 bg-zinc-50 sm:grid">
          {dayNames.map((dn) => (
            <div
              key={dn}
              className="py-2 text-center font-heading text-xs font-medium text-zinc-500"
            >
              {dn}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[80px] border-b border-r border-zinc-100 bg-zinc-50/50"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayActivities = activityDates.get(dateStr) || [];
            const isCurrentDay = isSameDay(
              new Date(year, month, day),
              dateOnly(now)
            );

            return (
              <div
                key={dateStr}
                className={`min-h-[80px] border-b border-r border-zinc-100 p-2 ${
                  isCurrentDay ? "bg-brand/5" : "bg-white"
                }`}
              >
                <p
                  className={`font-heading text-xs font-medium ${
                    isCurrentDay ? "text-brand" : "text-zinc-600"
                  }`}
                >
                  {day}
                </p>
                {dayActivities.length > 0 && (
                  <TooltipProvider>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dayActivities.slice(0, 3).map((a) => (
                        <Tooltip key={a.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-2 w-2 cursor-pointer rounded-full ${typeDotColors[a.type]} transition-transform hover:scale-150`}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="font-body text-xs">
                              <span className="font-semibold">
                                {typeLabels[a.type]}:
                              </span>{" "}
                              {a.title}
                            </p>
                            {a.dueTime && (
                              <p className="font-body text-[10px] text-zinc-400">
                                {a.dueTime}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      {dayActivities.length > 3 && (
                        <span className="font-body text-[10px] text-zinc-400">
                          +{dayActivities.length - 3}
                        </span>
                      )}
                    </div>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
