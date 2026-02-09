"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, XCircle } from "lucide-react";
import { useState } from "react";
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
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useNotificationStore } from "@/stores/notification-store";
import {
  loseOpportunitySchema,
  type LoseOpportunityFormData,
} from "@/lib/schemas";

const reasonLabels: Record<string, string> = {
  preco: "Preço",
  concorrente: "Concorrente",
  timing: "Timing",
  "sem-budget": "Sem budget",
  "sem-necessidade": "Sem necessidade",
  "sem-resposta": "Sem resposta",
  outro: "Outro",
};

export function LoseOpportunityModal() {
  const { modalType, modalData, closeModal } = useUIStore();
  const { loseOpportunity, getById } = useOpportunityStore();
  const { addNotification } = useNotificationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOpen = modalType === "lose-opportunity";
  const opportunityId = modalData?.opportunityId as string | undefined;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoseOpportunityFormData>({
    resolver: zodResolver(loseOpportunitySchema),
  });

  async function onSubmit(data: LoseOpportunityFormData) {
    setIsSubmitting(true);
    try {
      if (opportunityId) {
        const opp = getById(opportunityId);
        loseOpportunity(opportunityId, data.reason, data.competitor, data.notes);

        addNotification({
          type: "opportunity-lost",
          title: "Oportunidade perdida",
          message: `A oportunidade "${opp?.title || "Sem título"}" foi marcada como perdida. Motivo: ${reasonLabels[data.reason] || data.reason}.`,
          link: "/pipes",
        });

        toast.error("Oportunidade marcada como Perdida", {
          description: [
            `Motivo: ${reasonLabels[data.reason] || data.reason}`,
            data.competitor ? `Concorrente: ${data.competitor}` : null,
            data.notes ? `Obs: ${data.notes}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          duration: 6000,
        });
      } else {
        toast.error("Oportunidade marcada como Perdida", {
          description: `Motivo: ${reasonLabels[data.reason] || data.reason}`,
          duration: 6000,
        });
      }

      reset();
      closeModal();
    } catch {
      toast.error("Erro ao registrar perda. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        reset();
        closeModal();
      }}
    >
      <DialogContent className="max-w-[440px] rounded-[20px] p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-danger-light">
              <XCircle className="h-5 w-5 text-status-danger" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold text-black">
              Marcar como Perdido
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Motivo da perda
            </Label>
            <Select onValueChange={(v) => setValue("reason", v)}>
              <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="preco">Preço</SelectItem>
                <SelectItem value="concorrente">Concorrente</SelectItem>
                <SelectItem value="timing">Timing</SelectItem>
                <SelectItem value="sem-budget">Sem budget</SelectItem>
                <SelectItem value="sem-necessidade">Sem necessidade</SelectItem>
                <SelectItem value="sem-resposta">Sem resposta</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-xs text-status-danger">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Concorrente <span className="text-zinc-400">(opcional)</span>
            </Label>
            <Input
              placeholder="Nome do concorrente"
              className="h-10 rounded-[15px] font-body text-sm"
              {...register("competitor")}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Observações <span className="text-zinc-400">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Detalhes sobre a perda..."
              className="rounded-[15px] font-body text-sm"
              rows={3}
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                closeModal();
              }}
              className="rounded-full font-heading text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="destructive"
              className="rounded-full font-heading text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar Perda
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
