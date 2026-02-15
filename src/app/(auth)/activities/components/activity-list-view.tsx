"use client";

import { useState, useCallback, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Activity } from "@/types";
import { useUIStore } from "@/stores/ui-store";
import { groupActivities } from "./helpers";
import { ActivityGroup } from "./activity-group";

interface ActivityListViewProps {
  activities: Activity[];
}

export function ActivityListView({ activities }: ActivityListViewProps) {
  const { openDrawer } = useUIStore();
  const [justCompletedIds, setJustCompletedIds] = useState<Set<string>>(
    new Set()
  );

  const groups = useMemo(
    () => groupActivities(activities),
    [activities]
  );

  const completedActivities = useMemo(
    () =>
      activities
        .filter((a) => a.status === "completed")
        .sort((a, b) => {
          const aDate = a.completedAt || a.dueDate;
          const bDate = b.completedAt || b.dueDate;
          return bDate.localeCompare(aDate);
        }),
    [activities]
  );

  const cancelledActivities = useMemo(
    () => activities.filter((a) => a.status === "cancelled"),
    [activities]
  );

  const handleCompleted = useCallback((id: string) => {
    setJustCompletedIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setJustCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1200);
  }, []);

  const handlePostponed = useCallback(() => {
    // Activity moves to correct group automatically via store update
  }, []);

  const handleOpenDetails = useCallback(
    (id: string) => {
      openDrawer("new-activity", { activityId: id, mode: "edit" });
    },
    [openDrawer]
  );

  const isEmpty =
    groups.overdue.length === 0 &&
    groups.today.length === 0 &&
    groups.next7.length === 0 &&
    groups.future.length === 0 &&
    completedActivities.length === 0 &&
    cancelledActivities.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[18px] border border-zinc-200/80 bg-white/80 py-16 shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-brand/35" />
        <p className="mt-3 font-body text-sm text-zinc-500">
          Nenhuma atividade encontrada
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.overdue.length > 0 && (
        <ActivityGroup
          title="Atrasadas"
          count={groups.overdue.length}
          variant="overdue"
          activities={groups.overdue}
          justCompletedIds={justCompletedIds}
          onCompleted={handleCompleted}
          onPostponed={handlePostponed}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {groups.today.length > 0 && (
        <ActivityGroup
          title="Hoje"
          count={groups.today.length}
          variant="today"
          activities={groups.today}
          justCompletedIds={justCompletedIds}
          onCompleted={handleCompleted}
          onPostponed={handlePostponed}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {groups.next7.length > 0 && (
        <ActivityGroup
          title="Proximos 7 dias"
          count={groups.next7.length}
          variant="upcoming"
          activities={groups.next7}
          justCompletedIds={justCompletedIds}
          onCompleted={handleCompleted}
          onPostponed={handlePostponed}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {groups.future.length > 0 && (
        <ActivityGroup
          title="Futuras"
          count={groups.future.length}
          variant="upcoming"
          activities={groups.future}
          justCompletedIds={justCompletedIds}
          onCompleted={handleCompleted}
          onPostponed={handlePostponed}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {completedActivities.length > 0 && (
        <ActivityGroup
          title="Concluidas"
          count={completedActivities.length}
          variant="completed"
          activities={completedActivities}
          defaultCollapsed
          justCompletedIds={justCompletedIds}
          onCompleted={handleCompleted}
          onPostponed={handlePostponed}
          onOpenDetails={handleOpenDetails}
        />
      )}

      {cancelledActivities.length > 0 && (
        <ActivityGroup
          title="Canceladas"
          count={cancelledActivities.length}
          variant="cancelled"
          activities={cancelledActivities}
          defaultCollapsed
          justCompletedIds={justCompletedIds}
          onCompleted={handleCompleted}
          onPostponed={handlePostponed}
          onOpenDetails={handleOpenDetails}
        />
      )}
    </div>
  );
}
