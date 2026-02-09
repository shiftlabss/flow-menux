"use client";

import { useState } from "react";
import { X, Plus, MoreVertical, GripVertical, Trash2, Edit, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface PipelineManagerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PipelineManagerDrawer({ open, onOpenChange }: PipelineManagerDrawerProps) {
  const { pipelines, deletePipeline } = usePipelineStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [deletingPipeline, setDeletingPipeline] = useState<Pipeline | null>(null);
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deletingPipeline) return;

    if (deletingPipeline.cardCount > 0) {
      toast.error("Não é possível excluir", {
        description: `Existem ${deletingPipeline.cardCount} cards neste funil.`,
      });
      setDeletingPipeline(null);
      return;
    }

    deletePipeline(deletingPipeline.id);
    toast.success("Funil excluído", {
      description: `O funil "${deletingPipeline.name}" foi removido.`,
    });
    setDeletingPipeline(null);
  };

  const canAddPipeline = pipelines.length < 5;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full p-0 sm:w-[720px] sm:max-w-[720px]">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Header */}
              <SheetHeader className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="font-heading text-2xl">
                      Gerenciar Funis
                    </SheetTitle>
                    <SheetDescription className="mt-1 font-body text-sm">
                      Configure os funis e etapas do seu pipeline
                    </SheetDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!canAddPipeline}
                    size="sm"
                    className="rounded-full bg-black font-heading text-xs text-white hover:bg-zinc-800"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Novo Funil
                  </Button>
                </div>
              </SheetHeader>

              {/* Limit Warning */}
              {!canAddPipeline && (
                <Card className="mb-4 border-status-warning bg-status-warning/5">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-status-warning" />
                    <p className="font-body text-sm text-zinc-700">
                      Limite de <strong>5 funis</strong> atingido. Exclua um funil para criar novo.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pipelines List */}
              <div className="space-y-4">
                {pipelines.map((pipeline) => (
                  <Card key={pipeline.id} className="rounded-[15px]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="font-heading text-lg">
                              {pipeline.name}
                            </CardTitle>
                            {pipeline.isDefault && (
                              <Badge variant="secondary" className="rounded-[10px] font-body text-xs">
                                Padrão
                              </Badge>
                            )}
                            <Badge variant="outline" className="rounded-[10px] font-body text-xs">
                              {pipeline.stages.length} etapas
                            </Badge>
                            <Badge variant="outline" className="rounded-[10px] font-body text-xs">
                              {pipeline.cardCount} cards
                            </Badge>
                          </div>
                          {pipeline.description && (
                            <CardDescription className="mt-1 font-body text-sm">
                              {pipeline.description}
                            </CardDescription>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[15px]">
                            <DropdownMenuItem onClick={() => setEditingPipeline(pipeline)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setExpandedPipeline(
                                  expandedPipeline === pipeline.id ? null : pipeline.id
                                )
                              }
                            >
                              <GripVertical className="mr-2 h-4 w-4" />
                              Gerenciar Etapas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingPipeline(pipeline)}
                              disabled={pipeline.isDefault}
                              className="text-status-danger focus:text-status-danger"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {pipeline.isDefault ? "Não pode excluir padrão" : "Excluir"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    {/* Stage Manager (expanded) */}
                    {expandedPipeline === pipeline.id && (
                      <CardContent className="border-t border-zinc-100 pt-6">
                        <StageManager pipeline={pipeline} />
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {pipelines.length === 0 && (
                <Card className="rounded-[15px]">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="font-body text-sm text-zinc-500">
                      Nenhum funil configurado. Crie o primeiro funil para começar.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Create/Edit Modal */}
      <PipelineFormModal
        open={isCreateModalOpen || editingPipeline !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingPipeline(null);
          }
        }}
        pipeline={editingPipeline}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deletingPipeline !== null} onOpenChange={() => setDeletingPipeline(null)}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl">
              Excluir funil "{deletingPipeline?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-zinc-600">
              {deletingPipeline && deletingPipeline.cardCount > 0 ? (
                <>
                  Não é possível excluir este funil porque existem{" "}
                  <strong>{deletingPipeline.cardCount} cards</strong> associados a ele.
                  <br />
                  <br />
                  Mova ou exclua todos os cards antes de continuar.
                </>
              ) : (
                <>
                  Esta ação não pode ser desfeita. Todas as etapas deste funil serão removidas
                  permanentemente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
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
