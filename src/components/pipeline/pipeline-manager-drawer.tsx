"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Plus,
  MoreVertical,
  GripVertical,
  Trash2,
  Edit,
  AlertTriangle,
  Copy,
  Star,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  Layers,
  Settings2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePipelineStore, type Pipeline } from "@/stores/pipeline-store";
import { PipelineFormModal } from "./pipeline-form-modal";
import { StageManager } from "./stage-manager";

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

const MAX_PIPELINES = 5;
const PIPE_ORDER_KEY = "flow-pipe-order";

// ═══════════════════════════════════════════════════════════════════
// InlineStatusBanner — Feedback visual premium
// ═══════════════════════════════════════════════════════════════════

type BannerVariant = "success" | "error" | "info";

interface StatusBanner {
  message: string;
  variant: BannerVariant;
}

function InlineStatusBanner({
  banner,
  onDismiss,
}: {
  banner: StatusBanner;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [banner, onDismiss]);

  const variantStyles: Record<BannerVariant, string> = {
    success:
      "bg-status-success/10 text-status-success border-status-success/20",
    error: "bg-status-danger/10 text-status-danger border-status-danger/20",
    info: "bg-brand/10 text-brand border-brand/20",
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-[12px] border px-3 py-2 font-body text-xs font-medium transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${variantStyles[banner.variant]}`}
      role="status"
      aria-live="polite"
    >
      {banner.variant === "success" && <Check className="h-3.5 w-3.5" />}
      {banner.variant === "error" && (
        <AlertTriangle className="h-3.5 w-3.5" />
      )}
      <span className="flex-1">{banner.message}</span>
      <button
        onClick={onDismiss}
        className="rounded p-0.5 transition-colors hover:bg-black/10"
        aria-label="Fechar"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PipeRowCard — Sortable item for each pipeline
// ═══════════════════════════════════════════════════════════════════

interface PipeRowCardProps {
  pipeline: Pipeline;
  isSelected: boolean;
  onSelect: () => void;
  isDragOverlay?: boolean;
}

function SortablePipeRowCard({
  pipeline,
  isSelected,
  onSelect,
}: PipeRowCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pipeline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-[14px] border p-3 transition-all cursor-pointer ${
        isSelected
          ? "border-brand bg-brand/5 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
      } ${isDragging ? "z-50 shadow-lg" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Drag handle */}
      <button
        className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        {...attributes}
        {...listeners}
        aria-label={`Arrastar ${pipeline.name}`}
        aria-roledescription="sortable"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-heading text-sm font-semibold text-black">
            {pipeline.name}
          </span>
          {pipeline.isDefault && (
            <Badge
              variant="secondary"
              className="shrink-0 rounded-[8px] bg-brand/10 px-1.5 py-0.5 font-body text-[10px] text-brand"
            >
              <Star className="mr-0.5 h-2.5 w-2.5" />
              Padrão
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 font-body text-xs text-zinc-400">
          <span>{pipeline.stages.length} etapas</span>
          <span className="text-zinc-200">•</span>
          <span>{pipeline.cardCount} cards</span>
        </div>
      </div>

      {/* Selected indicator */}
      <ChevronRight
        className={`h-4 w-4 shrink-0 transition-all ${
          isSelected
            ? "text-brand opacity-100"
            : "text-zinc-300 opacity-0 group-hover:opacity-100"
        }`}
      />
    </div>
  );
}

function PipeRowCardOverlay({ pipeline }: { pipeline: Pipeline }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-brand bg-white p-3 shadow-xl ring-2 ring-brand/20">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-300">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-heading text-sm font-semibold text-black">
            {pipeline.name}
          </span>
          {pipeline.isDefault && (
            <Badge
              variant="secondary"
              className="shrink-0 rounded-[8px] bg-brand/10 px-1.5 py-0.5 font-body text-[10px] text-brand"
            >
              <Star className="mr-0.5 h-2.5 w-2.5" />
              Padrão
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 font-body text-xs text-zinc-400">
          <span>{pipeline.stages.length} etapas</span>
          <span className="text-zinc-200">•</span>
          <span>{pipeline.cardCount} cards</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PipeDetailsPanel — Right panel with pipeline details & actions
// ═══════════════════════════════════════════════════════════════════

function PipeDetailsPanel({
  pipeline,
  onEdit,
  onDuplicate,
  onDelete,
  onSetDefault,
  onToggleVisibility,
  isVisible,
}: {
  pipeline: Pipeline;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onToggleVisibility: () => void;
  isVisible: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Panel Header */}
      <div className="border-b border-zinc-100 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-heading text-lg font-semibold text-black">
                {pipeline.name}
              </h3>
              {pipeline.isDefault && (
                <Badge className="shrink-0 gap-1 rounded-[8px] bg-brand/10 font-body text-[10px] text-brand">
                  <Star className="h-3 w-3" />
                  Padrão
                </Badge>
              )}
            </div>
            {pipeline.description && (
              <p className="mt-1 font-body text-sm text-zinc-500">
                {pipeline.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-zinc-400 hover:text-zinc-600"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-[12px]">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar nome e descrição
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar funil
              </DropdownMenuItem>
              {!pipeline.isDefault && (
                <DropdownMenuItem onClick={onSetDefault}>
                  <Star className="mr-2 h-4 w-4" />
                  Tornar padrão
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onToggleVisibility}>
                {isVisible ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Ocultar funil
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Mostrar funil
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                disabled={pipeline.isDefault}
                className="text-status-danger focus:text-status-danger"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {pipeline.isDefault
                  ? "Não pode excluir padrão"
                  : "Excluir funil"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-[8px] bg-zinc-50 px-2.5 py-1.5">
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-body text-xs font-medium text-zinc-600">
              {pipeline.stages.length} etapas
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-[8px] bg-zinc-50 px-2.5 py-1.5">
            <Settings2 className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-body text-xs font-medium text-zinc-600">
              {pipeline.cardCount} cards
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-[8px] bg-zinc-50 px-2.5 py-1.5">
            <span className="font-body text-xs text-zinc-400">
              Criado em{" "}
              {new Date(pipeline.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      {/* Stage Manager */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <StageManager pipeline={pipeline} />
        </div>
      </ScrollArea>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Empty Detail State
// ═══════════════════════════════════════════════════════════════════

function EmptyDetailState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-50">
        <Layers className="h-7 w-7 text-zinc-300" />
      </div>
      <p className="mt-4 font-heading text-base font-semibold text-zinc-400">
        Selecione um funil
      </p>
      <p className="mt-1 font-body text-sm text-zinc-300">
        Escolha um funil à esquerda para ver detalhes e gerenciar etapas
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Component — PipelineManagerDrawer (Premium Modal)
// ═══════════════════════════════════════════════════════════════════

interface PipelineManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PipelineManagerDrawer({
  open,
  onOpenChange,
}: PipelineManagerDrawerProps) {
  const { pipelines, deletePipeline, addPipeline, updatePipeline, reorderPipelines } =
    usePipelineStore();

  // Local state
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [deletingPipeline, setDeletingPipeline] = useState<Pipeline | null>(
    null
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<StatusBanner | null>(null);
  const [hiddenPipelines, setHiddenPipelines] = useState<Set<string>>(
    new Set()
  );
  const [liveMessage, setLiveMessage] = useState("");
  const announcerRef = useRef<HTMLDivElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Selected pipeline
  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  // Auto-select first pipeline on open
  useEffect(() => {
    if (open && pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [open, pipelines, selectedPipelineId]);

  // Load persisted order from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PIPE_ORDER_KEY);
      if (stored) {
        const order = JSON.parse(stored) as string[];
        const sorted = [...pipelines].sort((a, b) => {
          const aIdx = order.indexOf(a.id);
          const bIdx = order.indexOf(b.id);
          if (aIdx === -1 && bIdx === -1) return 0;
          if (aIdx === -1) return 1;
          if (bIdx === -1) return -1;
          return aIdx - bIdx;
        });
        // Only reorder if actually different
        const currentIds = pipelines.map((p) => p.id).join(",");
        const sortedIds = sorted.map((p) => p.id).join(",");
        if (currentIds !== sortedIds) {
          reorderPipelines(sorted);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Persist order to localStorage
  const persistOrder = useCallback(
    (pipes: Pipeline[]) => {
      try {
        localStorage.setItem(
          PIPE_ORDER_KEY,
          JSON.stringify(pipes.map((p) => p.id))
        );
      } catch {
        // Ignore localStorage errors
      }
    },
    []
  );

  // Show banner helper
  const showBanner = useCallback(
    (message: string, variant: BannerVariant = "success") => {
      setStatusBanner({ message, variant });
    },
    []
  );

  // Announce for screen readers
  const announce = useCallback((msg: string) => {
    setLiveMessage(msg);
  }, []);

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
    const pipe = pipelines.find((p) => p.id === event.active.id);
    if (pipe) {
      announce(`Arrastando funil ${pipe.name}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = pipelines.findIndex((p) => p.id === active.id);
    const newIndex = pipelines.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(pipelines, oldIndex, newIndex);
    reorderPipelines(newOrder);
    persistOrder(newOrder);

    const movedPipe = pipelines.find((p) => p.id === active.id);
    if (movedPipe) {
      showBanner(
        `"${movedPipe.name}" movido para posição ${newIndex + 1}`,
        "success"
      );
      announce(`Funil ${movedPipe.name} movido para posição ${newIndex + 1}`);
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    announce("Reordenação cancelada");
  };

  // Actions
  const canAddPipeline = pipelines.length < MAX_PIPELINES;

  const handleDelete = () => {
    if (!deletingPipeline) return;

    if (deletingPipeline.cardCount > 0) {
      showBanner(
        `Não é possível excluir: ${deletingPipeline.cardCount} cards ativos`,
        "error"
      );
      setDeletingPipeline(null);
      return;
    }

    const name = deletingPipeline.name;
    deletePipeline(deletingPipeline.id);
    showBanner(`Funil "${name}" excluído com sucesso`, "success");

    // Clear selection if deleted the selected one
    if (selectedPipelineId === deletingPipeline.id) {
      setSelectedPipelineId(
        pipelines.find((p) => p.id !== deletingPipeline.id)?.id ?? null
      );
    }

    setDeletingPipeline(null);
    persistOrder(pipelines.filter((p) => p.id !== deletingPipeline.id));
  };

  const handleDuplicate = (pipeline: Pipeline) => {
    if (!canAddPipeline) {
      showBanner(`Limite de ${MAX_PIPELINES} funis atingido`, "error");
      return;
    }

    addPipeline({
      name: `${pipeline.name} (cópia)`,
      description: pipeline.description,
      isDefault: false,
      cardCount: 0,
      stages: pipeline.stages.map((s) => ({
        ...s,
        id: `${s.id}-copy-${Date.now()}`,
      })),
    });
    showBanner(`"${pipeline.name}" duplicado com sucesso`, "success");
  };

  const handleSetDefault = (pipeline: Pipeline) => {
    // Remove default from current default
    pipelines.forEach((p) => {
      if (p.isDefault && p.id !== pipeline.id) {
        updatePipeline(p.id, { isDefault: false });
      }
    });
    updatePipeline(pipeline.id, { isDefault: true });
    showBanner(`"${pipeline.name}" agora é o funil padrão`, "success");
  };

  const handleToggleVisibility = (pipelineId: string) => {
    const newHidden = new Set(hiddenPipelines);
    if (newHidden.has(pipelineId)) {
      newHidden.delete(pipelineId);
      showBanner("Funil visível novamente", "info");
    } else {
      newHidden.add(pipelineId);
      showBanner("Funil oculto da visualização", "info");
    }
    setHiddenPipelines(newHidden);
  };

  // Drag overlay pipeline
  const activeDragPipeline = activeDragId
    ? pipelines.find((p) => p.id === activeDragId)
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex !max-h-[88vh] h-[88vh] !max-w-[1040px] w-[95vw] flex-col overflow-hidden rounded-[var(--radius-bento-card)] !gap-0 !p-0"
          showCloseButton={false}
        >
          {/* ── Modal Header ──────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <div>
              <DialogTitle className="font-heading text-xl font-semibold text-black">
                Gerenciar Funis
              </DialogTitle>
              <p className="mt-0.5 font-body text-sm text-zinc-400">
                Configure os funis do seu pipeline de vendas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!canAddPipeline}
                size="sm"
                className="rounded-full bg-black font-heading text-xs text-white hover:bg-zinc-800"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Novo Funil
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Status Banner ─────────────────────────────────── */}
          {statusBanner && (
            <div className="px-6 pt-3">
              <InlineStatusBanner
                banner={statusBanner}
                onDismiss={() => setStatusBanner(null)}
              />
            </div>
          )}

          {/* ── Limit Warning ─────────────────────────────────── */}
          {!canAddPipeline && (
            <div className="mx-6 mt-3 flex items-center gap-2 rounded-[10px] border border-status-warning/20 bg-status-warning/5 px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-status-warning" />
              <p className="font-body text-xs text-zinc-600">
                Limite de <strong>{MAX_PIPELINES} funis</strong> atingido.
                Exclua um funil para criar novo.
              </p>
            </div>
          )}

          {/* ── Split View Body ───────────────────────────────── */}
          <div className="flex min-h-0 flex-1">
            {/* Left Panel — Pipeline List */}
            <div className="flex w-[380px] shrink-0 flex-col border-r border-zinc-100 max-[1024px]:w-[320px] max-[768px]:w-full max-[768px]:border-r-0">
              <ScrollArea className="flex-1">
                <div className="space-y-2 p-4">
                  {pipelines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50">
                        <Layers className="h-6 w-6 text-zinc-300" />
                      </div>
                      <p className="mt-3 font-body text-sm text-zinc-400">
                        Nenhum funil configurado
                      </p>
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                        className="mt-3 rounded-full bg-black font-heading text-xs text-white hover:bg-zinc-800"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Criar primeiro funil
                      </Button>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragCancel={handleDragCancel}
                    >
                      <SortableContext
                        items={pipelines.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {pipelines.map((pipeline) => (
                          <SortablePipeRowCard
                            key={pipeline.id}
                            pipeline={pipeline}
                            isSelected={selectedPipelineId === pipeline.id}
                            onSelect={() =>
                              setSelectedPipelineId(pipeline.id)
                            }
                          />
                        ))}
                      </SortableContext>

                      <DragOverlay dropAnimation={null}>
                        {activeDragPipeline ? (
                          <PipeRowCardOverlay pipeline={activeDragPipeline} />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </div>
              </ScrollArea>

              {/* Keyboard DnD hint */}
              {pipelines.length > 1 && (
                <div className="border-t border-zinc-50 px-4 py-2">
                  <p className="font-body text-[10px] text-zinc-300">
                    Arraste para reordenar • Teclado: Space → ↑↓ → Enter
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel — Pipeline Details */}
            <div className="min-h-0 flex-1 max-[768px]:hidden">
              {selectedPipeline ? (
                <PipeDetailsPanel
                  pipeline={selectedPipeline}
                  onEdit={() => setEditingPipeline(selectedPipeline)}
                  onDuplicate={() => handleDuplicate(selectedPipeline)}
                  onDelete={() => setDeletingPipeline(selectedPipeline)}
                  onSetDefault={() => handleSetDefault(selectedPipeline)}
                  onToggleVisibility={() =>
                    handleToggleVisibility(selectedPipeline.id)
                  }
                  isVisible={!hiddenPipelines.has(selectedPipeline.id)}
                />
              ) : (
                <EmptyDetailState />
              )}
            </div>
          </div>

          {/* Screen reader announcer */}
          <div
            ref={announcerRef}
            aria-live="assertive"
            aria-atomic="true"
            className="sr-only"
          >
            {liveMessage}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <PipelineFormModal
        open={isCreateModalOpen || editingPipeline !== null}
        onOpenChange={(openVal) => {
          if (!openVal) {
            setIsCreateModalOpen(false);
            setEditingPipeline(null);
          }
        }}
        pipeline={editingPipeline}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingPipeline !== null}
        onOpenChange={() => setDeletingPipeline(null)}
      >
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl">
              Excluir funil &quot;{deletingPipeline?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-zinc-600">
              {deletingPipeline && deletingPipeline.cardCount > 0 ? (
                <>
                  Não é possível excluir este funil porque existem{" "}
                  <strong>{deletingPipeline.cardCount} cards</strong> associados
                  a ele.
                  <br />
                  <br />
                  Mova ou exclua todos os cards antes de continuar.
                </>
              ) : (
                <>
                  Esta ação não pode ser desfeita. Todas as etapas deste funil
                  serão removidas permanentemente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancelar
            </AlertDialogCancel>
            {deletingPipeline && deletingPipeline.cardCount === 0 && (
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-full bg-status-danger text-white hover:bg-status-danger/90"
              >
                Sim, excluir
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
