"use client";

import { useState, useMemo } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useActivityStore } from "@/stores/activity-store";
import type { ActivityType, ActivityStatus } from "@/types";
import { allActivityTypes } from "./components/config";
import { ActivityHeader, type ViewMode } from "./components/activity-header";
import { ActivityFiltersBar } from "./components/activity-filters";
import { ActivityListView } from "./components/activity-list-view";
import { ActivityTimelineView } from "./components/activity-timeline-view";
import { ActivityWeekView } from "./components/activity-week-view";
import { ActivityMonthView } from "./components/activity-month-view";
import { motion, AnimatePresence } from "framer-motion";
import { ActivitySideMetrics } from "./components/activity-side-metrics";
import { screenContainer, sectionEnter, listItemReveal } from "@/lib/motion";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ActivitiesPage() {
  const { openDrawer } = useUIStore();
  const { activities } = useActivityStore();

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // ── Filters ──────────────────────────────────────────────────────
  const [filterTypes, setFilterTypes] = useState<Set<ActivityType>>(
    new Set(allActivityTypes)
  );
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  // ── Derived data ─────────────────────────────────────────────────

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (!filterTypes.has(a.type)) return false;
      if (filterResponsible !== "all" && a.responsibleId !== filterResponsible)
        return false;
      if (filterDateStart && a.dueDate < filterDateStart) return false;
      if (filterDateEnd && a.dueDate > filterDateEnd) return false;
      return true;
    });
  }, [activities, filterTypes, filterResponsible, filterDateStart, filterDateEnd]);

  const counts = useMemo(() => {
    const byStatus: Record<ActivityStatus, number> = {
      pending: 0,
      overdue: 0,
      completed: 0,
      cancelled: 0,
    };
    const byType: Record<ActivityType, number> = {
      call: 0,
      email: 0,
      meeting: 0,
      visit: 0,
      task: 0,
      "follow-up": 0,
      whatsapp: 0,
    };
    for (const a of filteredActivities) {
      byStatus[a.status]++;
      byType[a.type]++;
    }
    return { byStatus, byType, total: filteredActivities.length };
  }, [filteredActivities]);

  const weeklyCompletionRate = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`;

    let dueThisWeek = 0;
    let completedThisWeek = 0;
    for (const a of filteredActivities) {
      if (a.dueDate >= weekAgoStr) {
        dueThisWeek++;
        if (a.status === "completed") completedThisWeek++;
      }
    }
    return dueThisWeek > 0
      ? Math.round((completedThisWeek / dueThisWeek) * 100)
      : 0;
  }, [filteredActivities]);

  const responsibles = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of activities) {
      map.set(a.responsibleId, a.responsibleName);
    }
    return Array.from(map.entries());
  }, [activities]);

  // ── Filter handlers ──────────────────────────────────────────────

  function toggleFilterType(type: ActivityType) {
    setFilterTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function clearAllFilters() {
    setFilterTypes(new Set(allActivityTypes));
    setFilterResponsible("all");
    setFilterDateStart("");
    setFilterDateEnd("");
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={screenContainer}
      className="bento-container premium-ambient mx-auto"
    >
      <div className="premium-grain flex gap-6 rounded-[20px] border border-zinc-200/70 bg-white/65 p-4 shadow-[var(--shadow-premium-soft)] backdrop-blur-sm md:p-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          <motion.div variants={sectionEnter}>
          <ActivityHeader
            overdueCount={counts.byStatus.overdue}
            pendingCount={counts.byStatus.pending}
            completedCount={counts.byStatus.completed}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNewActivity={() => openDrawer("new-activity")}
          />
          </motion.div>

          <motion.div variants={sectionEnter}>
          <ActivityFiltersBar
            filterTypes={filterTypes}
            filterResponsible={filterResponsible}
            filterDateStart={filterDateStart}
            filterDateEnd={filterDateEnd}
            responsibles={responsibles}
            onToggleType={toggleFilterType}
            onChangeResponsible={setFilterResponsible}
            onChangeDateStart={setFilterDateStart}
            onChangeDateEnd={setFilterDateEnd}
            onClearAll={clearAllFilters}
          />
          </motion.div>

          <motion.div variants={sectionEnter}>
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {viewMode === "list" && (
                  <ActivityListView activities={filteredActivities} />
                )}
                {viewMode === "timeline" && (
                  <ActivityTimelineView activities={filteredActivities} />
                )}
                {viewMode === "week" && (
                  <ActivityWeekView activities={filteredActivities} />
                )}
                {viewMode === "month" && (
                  <ActivityMonthView activities={filteredActivities} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Side Metrics (desktop only) */}
        <motion.div custom={2} variants={listItemReveal}>
        <ActivitySideMetrics
          counts={counts}
          weeklyCompletionRate={weeklyCompletionRate}
        />
        </motion.div>
      </div>
    </motion.div>
  );
}
