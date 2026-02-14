"use client";

import { useState, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Camera,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/masked-inputs";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { RequirementsList } from "@/components/ui/password-requirements";
import {
  activateAccountSchema,
  type ActivateAccountFormData,
} from "@/lib/schemas";
import { getPasswordStrength } from "@/lib/password-utils";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function AvatarUpload({
  preview,
  onFileSelect,
  onError,
  error,
}: {
  preview: string | null;
  onFileSelect: (file: File) => void;
  onError: (message: string | null) => void;
  error: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onError("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError("Arquivo muito grande. Máximo de 5MB.");
      return;
    }

    onError(null);
    onFileSelect(file);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <Camera className="h-6 w-6 text-zinc-400" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleChange}
      />
      <span className="font-body text-xs text-zinc-400">
        Foto de perfil (opcional)
      </span>
      {error && (
        <p className="text-xs text-status-danger">{error}</p>
      )}
    </div>
  );
}

function ActivateAccountContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ActivateAccountFormData>({
    resolver: zodResolver(activateAccountSchema),
  });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  function handleAvatarSelect(file: File) {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data: ActivateAccountFormData) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      // Mock: em produção, substituir por chamada à API POST /api/auth/activate
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSuccess(true);
    } catch {
      setFormError("Erro ao ativar conta. Tente novamente.");
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
              Convite inválido
            </h1>
            <p className="mt-2 font-body text-sm text-zinc-500">
              Este convite expirou ou já foi utilizado.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="mt-6 h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white hover:bg-zinc-800"
            >
              Solicitar novo convite
            </Button>
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
              Conta ativada!
            </h1>
            <p className="mt-2 font-body text-sm text-zinc-500">
              Sua conta foi ativada com sucesso. Você já pode acessar o Flow.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="mt-6 h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white hover:bg-zinc-800"
            >
              Ir para o login
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold text-black">
                Ativar conta
              </h1>
              <p className="mt-1 font-body text-sm text-zinc-500">
                Complete seu cadastro para acessar o Flow.
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="mb-6 flex justify-center">
              <AvatarUpload
                preview={avatarPreview}
                onFileSelect={handleAvatarSelect}
                onError={setAvatarError}
                error={avatarError}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="font-body text-sm text-zinc-600"
                >
                  Nome completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  className="h-12 rounded-[15px] font-body text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-status-danger">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="font-body text-sm text-zinc-600"
                >
                  Telefone{" "}
                  <span className="text-zinc-400">(opcional)</span>
                </Label>
                <PhoneInput
                  id="phone"
                  className="h-12 rounded-[15px] font-body text-sm"
                  onValueChange={(raw) => setValue("phone", raw)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-body text-sm text-zinc-600"
                >
                  Senha
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

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer font-body text-sm text-zinc-600"
                >
                  Li e aceito os{" "}
                  <a className="text-brand underline" href="/terms">
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a className="text-brand underline" href="/privacy">
                    Política de Privacidade
                  </a>
                </label>
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
                disabled={isSubmitting || !acceptedTerms}
                className="h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white hover:bg-zinc-800"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Ativar conta"
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

export default function ActivateAccountPage() {
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
      <ActivateAccountContent />
    </Suspense>
  );
}
