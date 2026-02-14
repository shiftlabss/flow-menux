"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      // Mock: em produção, substituir por chamada à API POST /api/auth/forgot-password
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSent(true);
    } catch {
      setFormError("Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
    <Card className="w-full max-w-[440px] rounded-[20px] border-zinc-200 shadow-xl">
      <CardContent className="p-8">
        {/* Back to login */}
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 font-body text-sm text-zinc-500 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>

        {isSent ? (
          /* Success State */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-success-light">
              <Mail className="h-6 w-6 text-status-success" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-black">
              E-mail enviado
            </h1>
            <p className="mt-2 font-body text-sm text-zinc-500">
              Verifique sua caixa de entrada para redefinir sua senha.
            </p>
            <Link href="/login">
              <Button
                variant="outline"
                className="mt-6 h-12 w-full rounded-full font-heading text-sm font-medium"
              >
                Voltar ao login
              </Button>
            </Link>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-black">
                Esqueci minha senha
              </h1>
              <p className="mt-1 font-body text-sm text-zinc-500">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-body text-sm text-zinc-600"
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-12 rounded-[15px] font-body text-sm"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-status-danger">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {formError && (
                <InlineFeedback
                  type="error"
                  message={formError}
                  onClose={() => setFormError(null)}
                />
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white hover:bg-zinc-800"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Enviar link"
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}
