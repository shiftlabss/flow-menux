"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InlineFeedback } from "@/components/ui/inline-feedback";
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
import { usePipelineStore, type Pipeline, type PipelineStageConfig } from "@/stores/pipeline-store";

interface StageManagerProps {
  pipeline: Pipeline;
}

export function StageManager({ pipeline }: StageManagerProps) {
  const { addStage, updateStage, deleteStage, reorderStages } = usePipelineStore();
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingStage, setDeletingStage] = useState<PipelineStageConfig | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canAddStage = pipeline.stages.length < 10;

  // Auto-clear success message after 2 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Handle reorder
  const handleReorder = (newOrder: PipelineStageConfig[]) => {
    reorderStages(pipeline.id, newOrder);
  };

  // Handle edit
  const handleStartEdit = (stage: PipelineStageConfig) => {
    setEditingStageId(stage.id);
    setEditingName(stage.name);
    setEditError(null);
  };

  const handleSaveEdit = () => {
    if (!editingStageId || !editingName.trim()) {
      setEditError("Nome da etapa é obrigatório.");
      return;
    }

    if (editingName.length > 30) {
      setEditError("O nome da etapa deve ter no máximo 30 caracteres.");
      return;
    }

    updateStage(pipeline.id, editingStageId, { name: editingName.trim() });
    setSuccessMessage("Etapa atualizada");
    setEditingStageId(null);
    setEditingName("");
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingStageId(null);
    setEditingName("");
    setEditError(null);
  };

  // Handle add
  const handleAddStage = () => {
    if (!newStageName.trim()) {
      setAddError("Digite um nome para a etapa.");
      return;
    }

    if (newStageName.length > 30) {
      setAddError("O nome da etapa deve ter no máximo 30 caracteres.");
      return;
    }

    addStage(pipeline.id, {
      id: `stage-${Date.now()}`,
      name: newStageName.trim(),
      slaHours: 48,
    });
    setNewStageName("");
    setIsAdding(false);
    setAddError(null);
  };

  // Handle delete
  const handleDelete = () => {
    if (!deletingStage) return;

    deleteStage(pipeline.id, deletingStage.id);
    setDeletingStage(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-black">
          Etapas ({pipeline.stages.length}/10)
        </h3>
        <Button
          size="sm"
          onClick={() => { setIsAdding(true); setAddError(null); }}
          disabled={!canAddStage || isAdding}
          className="rounded-full font-body text-xs"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Adicionar Etapa
        </Button>
      </div>

      {/* Success feedback */}
      {successMessage && (
        <InlineFeedback
          type="success"
          message={successMessage}
          compact
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Stages List */}
      {pipeline.stages.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={pipeline.stages}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {pipeline.stages.map((stage) => (
            <Reorder.Item key={stage.id} value={stage}>
              <div className="flex items-center gap-3 rounded-[15px] border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-zinc-400 active:cursor-grabbing" />

                <div className="flex-1">
                  {editingStageId === stage.id ? (
                    <div>
                      <Input
                        value={editingName}
                        onChange={(e) => { setEditingName(e.target.value); setEditError(null); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        placeholder="Nome da etapa"
                        className="h-8 rounded-[10px] font-body text-sm"
                        maxLength={30}
                        autoFocus
                      />
                      {editError && (
                        <p className="mt-1 font-body text-xs text-status-danger">{editError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm font-medium text-black">
                        {stage.name}
                      </span>
                      <Badge variant="secondary" className="rounded-[10px] font-body text-[10px]">
                        {stage.slaHours}h SLA
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {editingStageId === stage.id ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSaveEdit}
                        className="h-7 w-7 text-status-success hover:bg-status-success/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-7 w-7 text-zinc-500 hover:bg-zinc-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleStartEdit(stage)}
                        className="h-7 w-7 text-zinc-500 hover:bg-zinc-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingStage(stage)}
                        className="h-7 w-7 text-status-danger hover:bg-status-danger/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="rounded-[15px] border-2 border-dashed border-zinc-200 p-8 text-center">
          <p className="font-body text-sm text-zinc-500">
            Nenhuma etapa criada. Adicione a primeira etapa para este funil.
          </p>
        </div>
      )}

      {/* Add New Stage Form */}
      {isAdding && (
        <div className="space-y-1">
          <div className="flex items-center gap-3 rounded-[15px] border-2 border-brand bg-brand/5 p-3">
            <Input
              value={newStageName}
              onChange={(e) => { setNewStageName(e.target.value); setAddError(null); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddStage();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewStageName("");
                  setAddError(null);
                }
              }}
              placeholder="Nome da nova etapa (máx. 30 caracteres)"
              className="h-8 rounded-[10px] font-body text-sm"
              maxLength={30}
              autoFocus
            />
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleAddStage}
                className="h-7 w-7 text-status-success hover:bg-status-success/10"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewStageName("");
                  setAddError(null);
                }}
                className="h-7 w-7 text-zinc-500 hover:bg-zinc-100"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {addError && (
            <p className="px-3 font-body text-xs text-status-danger">{addError}</p>
          )}
        </div>
      )}

      {/* Limit Warning */}
      {!canAddStage && (
        <p className="font-body text-xs text-zinc-500">
          Limite máximo de 10 etapas atingido.
        </p>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deletingStage !== null} onOpenChange={() => setDeletingStage(null)}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl">
              Excluir etapa &quot;{deletingStage?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-zinc-600">
              Esta ação não pode ser desfeita. Todos os cards nesta etapa precisam ser movidos antes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-status-danger text-white hover:bg-status-danger/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
