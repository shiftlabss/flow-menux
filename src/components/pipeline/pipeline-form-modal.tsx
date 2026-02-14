"use client";

import { useEffect, useState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePipelineStore, type Pipeline } from "@/stores/pipeline-store";

// ===== Validation Schema =====

const pipelineSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  description: z.string().max(200, "Descrição deve ter no máximo 200 caracteres").optional(),
});

type PipelineFormData = z.infer<typeof pipelineSchema>;

// ===== Component =====

interface PipelineFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline?: Pipeline | null;
}

export function PipelineFormModal({ open, onOpenChange, pipeline }: PipelineFormModalProps) {
  const { pipelines, addPipeline, updatePipeline } = usePipelineStore();
  const isEdit = Boolean(pipeline);
  const [nameError, setNameError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      name: pipeline?.name || "",
      description: pipeline?.description || "",
    },
  });

  // Reset form when pipeline changes
  useEffect(() => {
    startTransition(() => {
      setNameError(null);
      setFeedback(null);
    });
    if (pipeline) {
      reset({
        name: pipeline.name,
        description: pipeline.description || "",
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [pipeline, reset]);

  const onSubmit = (data: PipelineFormData) => {
    setNameError(null);
    setFeedback(null);

    // Validate unique name (except for current pipeline when editing)
    const nameExists = pipelines.some(
      (p) => p.name.toLowerCase() === data.name.toLowerCase() && p.id !== pipeline?.id
    );

    if (nameExists) {
      setNameError("Já existe um funil com este nome. Escolha outro nome.");
      return;
    }

    // Validate name for default pipeline
    if (pipeline?.isDefault && data.name !== pipeline.name) {
      setNameError('O funil padrão "Leads" não pode ter seu nome alterado.');
      return;
    }

    if (isEdit && pipeline) {
      updatePipeline(pipeline.id, {
        name: data.name,
        description: data.description || "",
      });
      setFeedback({ type: "success", message: `O funil "${data.name}" foi atualizado com sucesso.` });
      setTimeout(() => onOpenChange(false), 1200);
    } else {
      addPipeline({
        name: data.name,
        description: data.description || "",
        isDefault: false,
        cardCount: 0,
        stages: [],
      });
      setFeedback({ type: "success", message: `O funil "${data.name}" foi criado. Agora adicione etapas a ele.` });
      setTimeout(() => onOpenChange(false), 1200);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setNameError(null);
      setFeedback(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-[20px] sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {isEdit ? "Editar Funil" : "Novo Funil"}
            </DialogTitle>
            <DialogDescription className="font-body text-sm">
              {isEdit
                ? "Altere o nome e descrição do funil."
                : "Crie um novo funil para organizar seu pipeline de vendas."}
            </DialogDescription>
          </DialogHeader>

          {/* Inline Feedback */}
          {feedback && (
            <div className="pt-4 pb-0">
              <InlineFeedback
                type={feedback.type}
                message={feedback.message}
                compact
                onClose={() => setFeedback(null)}
              />
            </div>
          )}

          <div className="space-y-4 py-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-body text-sm font-medium">
                Nome do Funil <span className="text-status-danger">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { onChange: () => setNameError(null) })}
                placeholder="Ex: Leads, Indicação, Parcerias..."
                disabled={pipeline?.isDefault}
                className="rounded-[15px]"
                maxLength={50}
              />
              {errors.name && (
                <p className="font-body text-xs text-status-danger">{errors.name.message}</p>
              )}
              {nameError && (
                <p className="font-body text-xs text-status-danger">{nameError}</p>
              )}
              {pipeline?.isDefault && (
                <p className="font-body text-xs text-zinc-500">
                  O funil padrão &quot;Leads&quot; não pode ter seu nome alterado.
                </p>
              )}
              <p className="font-body text-xs text-zinc-400">
                Máximo de 50 caracteres
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-body text-sm font-medium">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descreva o propósito deste funil..."
                className="rounded-[15px] resize-none"
                rows={3}
                maxLength={200}
              />
              {errors.description && (
                <p className="font-body text-xs text-status-danger">
                  {errors.description.message}
                </p>
              )}
              <p className="font-body text-xs text-zinc-400">
                Máximo de 200 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-black text-white hover:bg-zinc-800"
            >
              {isSubmitting ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Funil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
