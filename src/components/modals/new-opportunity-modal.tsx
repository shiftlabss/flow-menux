"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/masked-inputs";
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
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useNotificationStore } from "@/stores/notification-store";
import {
  newOpportunitySchema,
  type NewOpportunityFormData,
} from "@/lib/schemas";
import { formatCurrencyBRL } from "@/lib/business-rules";

const responsibleNames: Record<string, string> = {
  "1": "Maria Silva",
  "2": "João Santos",
};

export function NewOpportunityModal() {
  const { drawerType, closeDrawer } = useUIStore();
  const { addOpportunity } = useOpportunityStore();
  const { addNotification } = useNotificationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOpen = drawerType === "new-opportunity";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NewOpportunityFormData>({
    resolver: zodResolver(newOpportunitySchema),
    defaultValues: {
      temperature: "warm",
      tags: [],
    },
  });

  async function onSubmit(data: NewOpportunityFormData) {
    setIsSubmitting(true);
    try {
      const newOpp = addOpportunity({
        title: data.title,
        clientName: data.clientName,
        value: data.value,
        monthlyValue: data.monthlyValue || 0,
        stage: "lead-in",
        temperature: data.temperature || "warm",
        responsibleId: data.responsibleId,
        responsibleName: responsibleNames[data.responsibleId] || "Não atribuído",
        tags: data.tags || [],
        source: data.source,
        notes: data.notes,
      });

      addNotification({
        type: "system",
        title: "Nova oportunidade criada",
        message: `"${data.title}" (${formatCurrencyBRL(data.value)}) foi adicionada ao pipeline.`,
        link: "/pipes",
      });

      toast.success("Oportunidade criada!", {
        description: `"${data.title}" (${formatCurrencyBRL(data.value)}) foi adicionada ao estágio Lead-In.`,
      });

      reset();
      closeDrawer();
    } catch (error) {
      toast.error("Erro ao criar oportunidade", {
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
            Nova Oportunidade
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">Título</Label>
            <Input
              placeholder="Nome da oportunidade"
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
            <Label className="font-body text-sm text-zinc-600">Cliente</Label>
            <Input
              placeholder="Nome do cliente"
              className="h-10 rounded-[15px] font-body text-sm"
              {...register("clientName")}
            />
            {errors.clientName && (
              <p className="text-xs text-status-danger">
                {errors.clientName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Valor Total (R$)
              </Label>
              <CurrencyInput
                className="h-10 rounded-[15px] font-body text-sm"
                onValueChange={(v) => setValue("value", v)}
              />
              {errors.value && (
                <p className="text-xs text-status-danger">
                  {errors.value.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Valor Mensal (R$)
              </Label>
              <CurrencyInput
                className="h-10 rounded-[15px] font-body text-sm"
                onValueChange={(v) => setValue("monthlyValue", v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Temperatura
              </Label>
              <Select
                defaultValue="warm"
                onValueChange={(v) =>
                  setValue("temperature", v as "hot" | "warm" | "cold")
                }
              >
                <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[15px]">
                  <SelectItem value="hot">Quente</SelectItem>
                  <SelectItem value="warm">Morna</SelectItem>
                  <SelectItem value="cold">Fria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">Origem</Label>
              <Select onValueChange={(v) => setValue("source", v)}>
                <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="rounded-[15px]">
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="rede-social">Rede Social</SelectItem>
                  <SelectItem value="cold-call">Cold Call</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Responsável
            </Label>
            <Select onValueChange={(v) => setValue("responsibleId", v)}>
              <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                <SelectValue placeholder="Selecione um responsável" />
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
              Observações
            </Label>
            <Textarea
              placeholder="Notas sobre a oportunidade..."
              className="rounded-[15px] font-body text-sm"
              rows={3}
              {...register("notes")}
            />
          </div>

          {/* Actions */}
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
              Criar oportunidade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
