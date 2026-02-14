import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Opportunity, PipelineStage, OpportunityStatus } from "@/types";
import { mockOpportunities } from "@/lib/mock-data";
import { calculateSlaDeadline } from "@/lib/business-rules";

interface OpportunityState {
  opportunities: Opportunity[];
  isLoading: boolean;

  // CRUD
  addOpportunity: (data: Omit<Opportunity, "id" | "createdAt" | "updatedAt" | "status">) => Opportunity;
  updateOpportunity: (id: string, data: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;

  // Stage management
  moveToStage: (id: string, stage: PipelineStage, slaHours?: number) => void;

  // Status management
  winOpportunity: (id: string) => void;
  loseOpportunity: (id: string, reason: string, competitor?: string, notes?: string) => void;

  // Computed
  getByStage: (stage: PipelineStage) => Opportunity[];
  getOpen: () => Opportunity[];
  getById: (id: string) => Opportunity | undefined;
}

export const useOpportunityStore = create<OpportunityState>()(
  devtools(
    (set, get) => ({
      opportunities: mockOpportunities,
      isLoading: false,

      addOpportunity: (data) => {
        const newOpp: Opportunity = {
          ...data,
          id: `opp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "open",
        };
        set((state) => ({
          opportunities: [...state.opportunities, newOpp],
        }));
        return newOpp;
      },

      updateOpportunity: (id, data) =>
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id
              ? { ...opp, ...data, updatedAt: new Date().toISOString() }
              : opp
          ),
        })),

      deleteOpportunity: (id) =>
        set((state) => ({
          opportunities: state.opportunities.filter((opp) => opp.id !== id),
        })),

      moveToStage: (id, stage, slaHours) =>
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id
              ? {
                  ...opp,
                  stage,
                  updatedAt: new Date().toISOString(),
                  slaDeadline: slaHours ? calculateSlaDeadline(slaHours) : opp.slaDeadline,
                }
              : opp
          ),
        })),

      winOpportunity: (id) =>
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id
              ? { ...opp, status: "won" as OpportunityStatus, updatedAt: new Date().toISOString() }
              : opp
          ),
        })),

      loseOpportunity: (id, reason, competitor, notes) =>
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id
              ? {
                  ...opp,
                  status: "lost" as OpportunityStatus,
                  lossReason: reason,
                  notes: notes || opp.notes,
                  updatedAt: new Date().toISOString(),
                }
              : opp
          ),
        })),

      getByStage: (stage) => get().opportunities.filter((o) => o.stage === stage && o.status === "open"),
      getOpen: () => get().opportunities.filter((o) => o.status === "open"),
      getById: (id) => get().opportunities.find((o) => o.id === id),
    }),
    { name: "opportunity-store" }
  )
);
