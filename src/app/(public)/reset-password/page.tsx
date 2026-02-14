"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { RequirementsList } from "@/components/ui/password-requirements";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/schemas";
import { getPasswordStrength } from "@/lib/password-utils";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  async function onSubmit(data: ResetPasswordFormData) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      // Mock: em produção, substituir por chamada à API POST /api/auth/reset-password
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSuccess(true);
    } catch {
      setFormError("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const strengthColor =
    strength.score <= 25
      ? "bg-status-danger"
      : strength.score <= 50
        ? "bg-status-warning"
        : strength.score <= 75
          ? "bg-status-info"
          : "bg-status-success";

  // Token expired / invalid state
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      >
      <Card className="w-full max-w-[440px] rounded-[20px] border-zinc-200 shadow-xl">
        <CardContent className="p-10">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-6 w-6 text-status-danger" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-black">
              Link inválido
            </h1>
            <p className="mt-2 font-body text-sm text-zinc-500">
              Este link expirou ou é inválido.
            </p>
            <Link href="/forgot-password">
              <Button className="mt-6 h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white hover:bg-zinc-800">
                Solicitar novo link
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
    <Card className="w-full max-w-[440px] rounded-[20px] border-zinc-200 shadow-xl">
      <CardContent className="p-10">
        {isSuccess ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-success-light">
              <CheckCircle className="h-6 w-6 text-status-success" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-black">
              Senha redefinida
            </h1>
            <p className="mt-2 font-body text-sm text-zinc-500">
              Sua senha foi atualizada com sucesso.
            </p>
            <Link href="/login">
              <Button className="mt-6 h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white hover:bg-zinc-800">
                Ir para o login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-black">
                Redefinir senha
              </h1>
              <p className="mt-1 font-body text-sm text-zinc-500">
                Crie uma nova senha segura para sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-body text-sm text-zinc-600"
                >
                  Nova senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 rounded-[15px] pr-12 font-body text-sm"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-status-danger">
                    {errors.password.message}
                  </p>
                )}

                {/* Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">
                      Força: {strength.label}
                    </p>
                    <RequirementsList password={password} />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="font-body text-sm text-zinc-600"
                >
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 rounded-[15px] pr-12 font-body text-sm"
                    {...register("confirmPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-status-danger">
                    {errors.confirmPassword.message}
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
                  "Redefinir senha"
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-[440px] rounded-[20px] border-zinc-200 shadow-xl">
          <CardContent className="flex items-center justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
