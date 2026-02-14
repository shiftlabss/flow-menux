"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput, IntegerInput } from "@/components/ui/masked-inputs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useClientStore } from "@/stores/client-store";
import { useNotificationStore } from "@/stores/notification-store";
import {
  winOpportunitySchema,
  type WinOpportunityFormData,
} from "@/lib/schemas";
import {
  calculateProjectedCommission,
  formatCurrencyBRL,
} from "@/lib/business-rules";

export function WinOpportunityModal() {
  const { modalType, modalData, closeModal } = useUIStore();
  const { winOpportunity, getById } = useOpportunityStore();
  const { addClient } = useClientStore();
  const { addNotification } = useNotificationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type: "success" | "error", message: string} | null>(null);
  const isOpen = modalType === "win-opportunity";
  const opportunityId = modalData?.opportunityId as string | undefined;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WinOpportunityFormData>({
    resolver: zodResolver(winOpportunitySchema),
  });

  async function onSubmit(data: WinOpportunityFormData) {
    setIsSubmitting(true);
    try {
      const commission = calculateProjectedCommission(data.contractValue);
      const opp = opportunityId ? getById(opportunityId) : null;

      // 1. Mark opportunity as won
      if (opportunityId) {
        winOpportunity(opportunityId);
      }

      // 2. Create client in CS pipeline (Win → Client transition)
      if (opp) {
        addClient({
          companyName: opp.clientName,
          cnpj: "",
          contactName: opp.clientName,
          contactEmail: "",
          contactPhone: "",
          stage: "onboarding",
          healthScore: "good",
          monthlyRevenue: data.monthlyValue,
          contractStart: data.contractStart,
          contractEnd: undefined,
          responsibleId: opp.responsibleId,
          responsibleName: opp.responsibleName,
          tags: opp.tags || [],
          lastInteraction: new Date().toISOString().split("T")[0],
        });
      }

      // 3. Add notification
      addNotification({
        type: "opportunity-won",
        title: "Oportunidade ganha!",
        message: `"${opp?.title || "Oportunidade"}" foi marcada como ganha! Contrato: ${formatCurrencyBRL(data.contractValue)}. Cliente criado no pipeline de CS.`,
        link: "/clients",
      });

      // 4. Show inline feedback then auto-close
      setFeedback({ type: "success", message: "Oportunidade marcada como Ganha!" });
      setTimeout(() => {
        setFeedback(null);
        reset();
        closeModal();
      }, 1500);
    } catch {
      setFeedback({ type: "error", message: "Erro ao registrar ganho. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setFeedback(null);
        reset();
        closeModal();
      }}
    >
      <DialogContent className="max-w-[480px] rounded-[20px] p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-success-light">
              <Trophy className="h-5 w-5 text-status-success" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold text-black">
              Marcar como Ganho
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Valor do Contrato (R$)
              </Label>
              <CurrencyInput
                className="h-10 rounded-[15px] font-body text-sm"
                onValueChange={(v) => setValue("contractValue", v)}
              />
              {errors.contractValue && (
                <p className="text-xs text-status-danger">
                  {errors.contractValue.message}
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
              {errors.monthlyValue && (
                <p className="text-xs text-status-danger">
                  {errors.monthlyValue.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Início do Contrato
              </Label>
              <Input
                type="date"
                className="h-10 rounded-[15px] font-body text-sm"
                {...register("contractStart")}
              />
              {errors.contractStart && (
                <p className="text-xs text-status-danger">
                  {errors.contractStart.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Prazo (meses)
              </Label>
              <IntegerInput
                className="h-10 rounded-[15px] font-body text-sm"
                placeholder="12"
                onValueChange={(v) => setValue("contractMonths", v)}
              />
              {errors.contractMonths && (
                <p className="text-xs text-status-danger">
                  {errors.contractMonths.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Observações <span className="text-zinc-400">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Detalhes do fechamento..."
              className="rounded-[15px] font-body text-sm"
              rows={3}
              {...register("notes")}
            />
          </div>

          {feedback && (
            <InlineFeedback
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          )}

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
              className="rounded-full bg-status-success font-heading text-sm text-white hover:bg-status-success/90"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar Ganho
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
