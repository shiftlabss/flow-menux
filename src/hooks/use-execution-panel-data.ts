"use client";

// ============================================================================
// Hook que computa dados em tempo real para o Execution Panel
// ============================================================================

import { useMemo } from "react";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useActivityStore } from "@/stores/activity-store";
import { useClientStore } from "@/stores/client-store";
import { useGoalStore } from "@/stores/goal-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  computeTodaysPriorities,
  computeSmartInsights,
  computeQuickWins,
  computeRiskAlerts,
} from "@/lib/proactive-engine";
import type {
  ProactiveEngineInput,
  ExecutionPanelData,
} from "@/lib/proactive-engine";

export function useExecutionPanelData(): ExecutionPanelData {
  const opportunities = useOpportunityStore((s) => s.opportunities);
  const activities = useActivityStore((s) => s.activities);
  const clients = useClientStore((s) => s.clients);
  const goals = useGoalStore((s) => s.goals);
  const pipelines = usePipelineStore((s) => s.pipelines);
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const empty: ExecutionPanelData = { priorities: [], insights: [], quickWins: [], riskAlerts: [] };
    if (!user) return empty;

    try {
      const input: ProactiveEngineInput = {
        opportunities,
        activities,
        clients,
        goals,
        pipelines,
        userId: user.id,
        userRole: user.role,
      };

      return {
        priorities: computeTodaysPriorities(input),
        insights: computeSmartInsights(input),
        quickWins: computeQuickWins(input),
        riskAlerts: computeRiskAlerts(input),
      };
    } catch (err) {
      console.error("[ExecutionPanelData] Erro ao computar dados:", err);
      return empty;
    }
  }, [opportunities, activities, clients, goals, pipelines, user]);
}
