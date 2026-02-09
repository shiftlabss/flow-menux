"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useUserStore } from "@/stores/user-store";
import { inviteUserSchema, type InviteUserFormData } from "@/lib/schemas";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  comercial: "Comercial",
  cs: "CS (Customer Success)",
  leitura: "Somente Leitura",
};

const unitLabels: Record<string, string> = {
  "1": "Matriz",
  "2": "Filial SP",
};

export function InviteUserModal() {
  const { modalType, closeModal } = useUIStore();
  const { addUser } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOpen = modalType === "invite-user";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
  });

  async function onSubmit(data: InviteUserFormData) {
    setIsSubmitting(true);
    try {
      // Add user to the store
      addUser({
        name: data.email.split("@")[0],
        email: data.email,
        role: data.role as "admin" | "comercial" | "cs" | "leitura",
        isActive: true,
        unitId: `unit-${data.unitId}`,
        unitName: unitLabels[data.unitId] || "Matriz",
      });

      toast.success("Convite enviado com sucesso!", {
        description: `${data.email} foi convidado como ${roleLabels[data.role] || data.role} na unidade ${unitLabels[data.unitId] || data.unitId}.`,
        duration: 5000,
      });

      reset();
      closeModal();
    } catch {
      toast.error("Erro ao enviar convite. Tente novamente.");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light">
              <UserPlus className="h-5 w-5 text-brand" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold text-black">
              Convidar Usuário
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">E-mail</Label>
            <Input
              type="email"
              placeholder="email@empresa.com"
              className="h-10 rounded-[15px] font-body text-sm"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-status-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">Papel</Label>
            <Select onValueChange={(v) => setValue("role", v as InviteUserFormData["role"])}>
              <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="cs">CS (Customer Success)</SelectItem>
                <SelectItem value="leitura">Somente Leitura</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-status-danger">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">Unidade</Label>
            <Select onValueChange={(v) => setValue("unitId", v)}>
              <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="1">Matriz</SelectItem>
                <SelectItem value="2">Filial SP</SelectItem>
              </SelectContent>
            </Select>
            {errors.unitId && (
              <p className="text-xs text-status-danger">
                {errors.unitId.message}
              </p>
            )}
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
              className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Enviar convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
