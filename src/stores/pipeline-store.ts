import { create } from "zustand";
import { devtools } from "zustand/middleware";

// ===== Types =====

export interface PipelineStageConfig {
  id: string;
  name: string;
  order: number;
  slaHours?: number;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStageConfig[];
  isDefault: boolean;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PipelineState {
  // State
  pipelines: Pipeline[];
  isLoading: boolean;

  // Actions
  setPipelines: (pipelines: Pipeline[]) => void;
  addPipeline: (pipeline: Omit<Pipeline, "id" | "createdAt" | "updatedAt">) => void;
  updatePipeline: (id: string, data: Partial<Pipeline>) => void;
  deletePipeline: (id: string) => void;
  addStage: (pipelineId: string, stage: Omit<PipelineStageConfig, "order">) => void;
  updateStage: (pipelineId: string, stageId: string, data: Partial<PipelineStageConfig>) => void;
  deleteStage: (pipelineId: string, stageId: string) => void;
  reorderStages: (pipelineId: string, stages: PipelineStageConfig[]) => void;
}

// ===== Initial Data (mock) =====

const initialPipelines: Pipeline[] = [
  {
    id: "pipeline-leads",
    name: "Leads",
    description: "Funil padrão de vendas",
    isDefault: true,
    cardCount: 42,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    stages: [
      { id: "lead-in", name: "Lead-In", order: 0, slaHours: 48 },
      { id: "contato-feito", name: "Contato Feito", order: 1, slaHours: 72 },
      { id: "reuniao-agendada", name: "Reuniao Agendada", order: 2, slaHours: 120 },
      { id: "proposta-enviada", name: "Proposta Enviada", order: 3, slaHours: 96 },
      { id: "negociacao", name: "Negociacao", order: 4, slaHours: 168 },
      { id: "fechamento", name: "Fechamento", order: 5, slaHours: 48 },
    ],
  },
  {
    id: "pipeline-indicacao",
    name: "Indicação",
    description: "Funil para leads vindos de indicação",
    isDefault: false,
    cardCount: 8,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    stages: [
      { id: "lead-in-ind", name: "Lead-In", order: 0, slaHours: 24 },
      { id: "contato-feito-ind", name: "Contato Feito", order: 1, slaHours: 48 },
      { id: "proposta-enviada-ind", name: "Proposta Enviada", order: 2, slaHours: 72 },
      { id: "fechamento-ind", name: "Fechamento", order: 3, slaHours: 48 },
    ],
  },
];

// ===== Store =====

export const usePipelineStore = create<PipelineState>()(
  devtools(
    (set) => ({
      // Initial state
      pipelines: initialPipelines,
      isLoading: false,

      // Actions
      setPipelines: (pipelines) => set({ pipelines }),

      addPipeline: (pipelineData) =>
        set((state) => {
          const newPipeline: Pipeline = {
            ...pipelineData,
            id: `pipeline-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            pipelines: [...state.pipelines, newPipeline],
          };
        }),

      updatePipeline: (id, data) =>
        set((state) => ({
          pipelines: state.pipelines.map((pipeline) =>
            pipeline.id === id
              ? { ...pipeline, ...data, updatedAt: new Date().toISOString() }
              : pipeline
          ),
        })),

      deletePipeline: (id) =>
        set((state) => ({
          pipelines: state.pipelines.filter((p) => p.id !== id),
        })),

      addStage: (pipelineId, stageData) =>
        set((state) => ({
          pipelines: state.pipelines.map((pipeline) => {
            if (pipeline.id !== pipelineId) return pipeline;

            const newStage: PipelineStageConfig = {
              ...stageData,
              order: pipeline.stages.length,
            };

            return {
              ...pipeline,
              stages: [...pipeline.stages, newStage],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      updateStage: (pipelineId, stageId, data) =>
        set((state) => ({
          pipelines: state.pipelines.map((pipeline) => {
            if (pipeline.id !== pipelineId) return pipeline;

            return {
              ...pipeline,
              stages: pipeline.stages.map((stage) =>
                stage.id === stageId ? { ...stage, ...data } : stage
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      deleteStage: (pipelineId, stageId) =>
        set((state) => ({
          pipelines: state.pipelines.map((pipeline) => {
            if (pipeline.id !== pipelineId) return pipeline;

            const filteredStages = pipeline.stages.filter((s) => s.id !== stageId);
            const reorderedStages = filteredStages.map((stage, index) => ({
              ...stage,
              order: index,
            }));

            return {
              ...pipeline,
              stages: reorderedStages,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      reorderStages: (pipelineId, stages) =>
        set((state) => ({
          pipelines: state.pipelines.map((pipeline) => {
            if (pipeline.id !== pipelineId) return pipeline;

            const reorderedStages = stages.map((stage, index) => ({
              ...stage,
              order: index,
            }));

            return {
              ...pipeline,
              stages: reorderedStages,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
    }),
    { name: "pipeline-store" }
  )
);
