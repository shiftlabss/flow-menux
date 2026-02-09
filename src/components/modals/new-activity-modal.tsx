"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/stores/ui-store";
import { useActivityStore } from "@/stores/activity-store";
import {
  newActivitySchema,
  type NewActivityFormData,
} from "@/lib/schemas";

const responsibleNames: Record<string, string> = {
  "1": "Maria Silva",
  "2": "João Santos",
};

export function NewActivityModal() {
  const { drawerType, drawerData, closeDrawer } = useUIStore();
  const { addActivity, updateActivity, getById } = useActivityStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOpen = drawerType === "new-activity";

  // Check if we're in edit mode
  const isEditMode = drawerData?.mode === "edit";
  const activityId = drawerData?.activityId as string | undefined;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NewActivityFormData>({
    resolver: zodResolver(newActivitySchema),
  });

  // Load activity data when in edit mode
  useEffect(() => {
    if (isEditMode && activityId && isOpen) {
      const activity = getById(activityId);
      if (activity) {
        setValue("title", activity.title);
        setValue("type", activity.type);
        setValue("dueDate", activity.dueDate);
        if (activity.dueTime) setValue("dueTime", activity.dueTime);
        setValue("responsibleId", activity.responsibleId);
        if (activity.description) setValue("description", activity.description);
      }
    } else if (!isOpen) {
      reset();
    }
  }, [isEditMode, activityId, isOpen, setValue, reset, getById]);

  async function onSubmit(data: NewActivityFormData) {
    setIsSubmitting(true);
    try {
      if (isEditMode && activityId) {
        updateActivity(activityId, {
          title: data.title,
          type: data.type,
          dueDate: data.dueDate,
          dueTime: data.dueTime || undefined,
          responsibleId: data.responsibleId,
          responsibleName: responsibleNames[data.responsibleId] || "Não atribuído",
          description: data.description || undefined,
        });

        toast.success("Atividade atualizada!", {
          description: `"${data.title}" foi atualizada com sucesso.`,
        });
      } else {
        const clientId = drawerData?.clientId as string | undefined;
        const clientName = drawerData?.clientName as string | undefined;
        const opportunityId = drawerData?.opportunityId as string | undefined;
        const opportunityTitle = drawerData?.opportunityTitle as string | undefined;

        addActivity({
          title: data.title,
          type: data.type,
          status: "pending",
          dueDate: data.dueDate,
          dueTime: data.dueTime || undefined,
          responsibleId: data.responsibleId,
          responsibleName: responsibleNames[data.responsibleId] || "Não atribuído",
          description: data.description || undefined,
          clientId,
          clientName,
          opportunityId,
          opportunityTitle,
        });

        toast.success("Atividade criada!", {
          description: `"${data.title}" foi agendada com sucesso.`,
        });
      }

      reset();
      closeDrawer();
    } catch (error) {
      toast.error(isEditMode ? "Erro ao atualizar atividade" : "Erro ao criar atividade", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        reset();
        closeDrawer();
      }}
    >
      <DialogContent className="max-w-[480px] rounded-[20px] p-8">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-semibold text-black">
            {isEditMode ? "Editar Atividade" : "Nova Atividade"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">Título</Label>
            <Input
              placeholder="Ex: Ligação com João"
              className="h-10 rounded-[15px] font-body text-sm"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-status-danger">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">Tipo</Label>
            <Select onValueChange={(v) => setValue("type", v as NewActivityFormData["type"])}>
              <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="call">Ligação</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="visit">Visita</SelectItem>
                <SelectItem value="task">Tarefa</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-status-danger">
                {errors.type.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">Data</Label>
              <Input
                type="date"
                className="h-10 rounded-[15px] font-body text-sm"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-xs text-status-danger">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Horário <span className="text-zinc-400">(opcional)</span>
              </Label>
              <Input
                type="time"
                className="h-10 rounded-[15px] font-body text-sm"
                {...register("dueTime")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Responsável
            </Label>
            <Select onValueChange={(v) => setValue("responsibleId", v)}>
              <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="1">Maria Silva</SelectItem>
                <SelectItem value="2">João Santos</SelectItem>
              </SelectContent>
            </Select>
            {errors.responsibleId && (
              <p className="text-xs text-status-danger">
                {errors.responsibleId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Descrição <span className="text-zinc-400">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Detalhes da atividade..."
              className="rounded-[15px] font-body text-sm"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                closeDrawer();
              }}
              className="rounded-full font-heading text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEditMode ? "Salvar alterações" : "Criar atividade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
