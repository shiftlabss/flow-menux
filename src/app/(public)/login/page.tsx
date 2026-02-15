"use client";

/**
 * Login Page - Flow CRM (Premium Redesign)
 *
 * Session rules (implemented server-side / middleware):
 * - "Lembrar-me" checked: session lasts 30 days
 * - "Lembrar-me" unchecked: session lasts 8 hours
 * - 2 hours of inactivity: automatic logout regardless of "Lembrar-me"
 *
 * Progressive lockout tiers (client-side enforcement):
 * - 3 errors:  show mock CAPTCHA ("Nao sou um robo"), button disabled until resolved
 * - 5 errors:  15-minute lockout with countdown timer
 * - 10 errors: 1-hour lockout with countdown timer
 * - 15 errors: indefinite block, must contact admin
 */

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Bot,
  ShieldAlert,
  Lock,
  Timer,
  Zap,
  Brain,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useAuthStore } from "@/stores/auth-store";

// ---------------------------------------------------------------------------
// Lockout tier thresholds
// ---------------------------------------------------------------------------
const CAPTCHA_THRESHOLD = 3;
const LOCKOUT_15MIN_THRESHOLD = 5;
const LOCKOUT_1H_THRESHOLD = 10;
const PERMANENT_BLOCK_THRESHOLD = 15;

const LOCKOUT_15MIN_MS = 15 * 60 * 1000;
const LOCKOUT_1H_MS = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type LockoutTier = "none" | "captcha" | "lockout15" | "lockout1h" | "blocked";

function getLockoutTier(errors: number): LockoutTier {
  if (errors >= PERMANENT_BLOCK_THRESHOLD) return "blocked";
  if (errors >= LOCKOUT_1H_THRESHOLD) return "lockout1h";
  if (errors >= LOCKOUT_15MIN_THRESHOLD) return "lockout15";
  if (errors >= CAPTCHA_THRESHOLD) return "captcha";
  return "none";
}

// ---------------------------------------------------------------------------
// Branding bullets
// ---------------------------------------------------------------------------
const brandingBullets = [
  { icon: Zap, text: "Raio X do funil em tempo real" },
  { icon: Brain, text: "Jarvis Comercial com Intelligence" },
  { icon: Target, text: "Atividades e SLAs com foco no que importa" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [captchaResolved, setCaptchaResolved] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  const router = useRouter();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");
  const hasValues = !!emailValue && !!passwordValue;

  const tier = getLockoutTier(errorCount);

  const isTimerActive = lockoutEnd !== null && remainingMs > 0;
  const isFieldsDisabled =
    tier === "blocked" || tier === "lockout15" || tier === "lockout1h";
  const isDisabledByLockout =
    isFieldsDisabled && (isTimerActive || tier === "blocked");

  const isButtonDisabled =
    isSubmitting ||
    isDisabledByLockout ||
    (tier === "captcha" && !captchaResolved) ||
    !hasValues;

  // ---------------------------------------------------------------------------
  // Countdown timer effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (lockoutEnd === null) {
      setRemainingMs(0);
      return;
    }

    function tick() {
      const now = Date.now();
      const diff = (lockoutEnd as number) - now;
      if (diff <= 0) {
        setRemainingMs(0);
        setLockoutEnd(null);
        setErrorCount(0);
        setCaptchaResolved(false);
        setLoginError(null);
      } else {
        setRemainingMs(diff);
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  const startLockout = useCallback((durationMs: number) => {
    setLockoutEnd(Date.now() + durationMs);
  }, []);

  // ---------------------------------------------------------------------------
  // Handle login failure
  // ---------------------------------------------------------------------------
  function handleLoginFailure() {
    const newCount = errorCount + 1;
    setErrorCount(newCount);
    setCaptchaResolved(false);

    const newTier = getLockoutTier(newCount);

    switch (newTier) {
      case "blocked":
        setLoginError(
          "Conta bloqueada. Entre em contato com o administrador."
        );
        break;
      case "lockout1h":
        setLoginError(
          "Conta temporariamente bloqueada. Tente novamente em"
        );
        startLockout(LOCKOUT_1H_MS);
        break;
      case "lockout15":
        setLoginError("Muitas tentativas. Tente novamente em 15 minutos.");
        startLockout(LOCKOUT_15MIN_MS);
        break;
      case "captcha":
        setLoginError(
          "Credenciais inválidas. Resolva o CAPTCHA para continuar."
        );
        break;
      default:
        setLoginError(
          "E-mail ou senha incorretos. Verifique e tente novamente."
        );
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Form submit
  // ---------------------------------------------------------------------------
  async function onSubmit(data: LoginFormData) {
    if (isButtonDisabled) return;

    setIsSubmitting(true);
    setLoginError(null);

    try {
      if (data.email === "fail@test.com") {
        handleLoginFailure();
        return;
      }

      setUser(
        {
          id: "1",
          name: "Usuário Demo",
          email: data.email,
          role: "admin",
          unitId: "1",
          unitName: "Matriz",
          isActive: true,
        },
        "mock-token"
      );
      router.push("/dashboard");
    } catch {
      handleLoginFailure();
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Alert / Error rendering
  // ---------------------------------------------------------------------------
  function renderAlert() {
    if (!loginError) return null;

    if (tier === "blocked") {
      return (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col gap-2 rounded-[10px] bg-status-danger-light px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-status-danger" />
            <p className="font-body text-sm font-medium text-status-danger">
              {loginError}
            </p>
          </div>
          <Link
            href="/support"
            className="font-body text-sm font-semibold text-status-danger underline"
          >
            Fale com o suporte
          </Link>
        </motion.div>
      );
    }

    if (tier === "lockout1h" && isTimerActive) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col gap-1 rounded-[10px] bg-status-danger-light px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-status-danger" />
            <p className="font-body text-sm font-medium text-status-danger">
              Conta temporariamente bloqueada. Tente novamente em{" "}
              <span className="font-semibold">
                {formatCountdown(remainingMs)}
              </span>
              .
            </p>
          </div>
        </motion.div>
      );
    }

    if (tier === "lockout15" && isTimerActive) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col gap-1 rounded-[10px] bg-status-warning-light px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 shrink-0 text-status-warning" />
            <p className="font-body text-sm font-medium text-status-warning">
              Muitas tentativas. Tente novamente em{" "}
              <span className="font-semibold">
                {formatCountdown(remainingMs)}
              </span>
              .
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12 }}
        className="flex flex-col gap-1.5 rounded-[10px] bg-status-danger-light px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-status-danger" />
          <p className="font-body text-sm text-status-danger">{loginError}</p>
        </div>
        <Link
          href="/forgot-password"
          className="font-body text-xs font-medium text-status-danger hover:underline"
        >
          Esqueci minha senha
        </Link>
      </motion.div>
    );
  }

  function renderCaptcha() {
    if (tier !== "captcha") return null;

    return (
      <div className="flex items-center gap-3 rounded-[10px] border border-zinc-200 bg-zinc-50 px-4 py-3">
        <Checkbox
          id="captcha"
          checked={captchaResolved}
          onCheckedChange={(checked) => setCaptchaResolved(checked === true)}
        />
        <label
          htmlFor="captcha"
          className="flex cursor-pointer items-center gap-2 font-body text-sm text-zinc-700"
        >
          <Bot className="h-4 w-4 text-zinc-400" />
          Não sou um robô
        </label>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex min-h-screen"
    >
      {/* ================================================================= */}
      {/* LEFT COLUMN — Branding & Context (desktop only, 55%)              */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden"
      >
        {/* Premium mesh background */}
        <div className="absolute inset-0 premium-mesh" />

        {/* Content container — pushed right with ml-auto */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 py-16 w-full max-w-[600px] ml-auto">
          {/* Logo */}
          <div className="mb-12">
            <Image
              src="/flow-logo.svg"
              alt="Flow by Menux"
              width={120}
              height={33}
              priority
              className="drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]"
            />
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="font-heading text-3xl font-bold text-brand-ink leading-tight mb-3">
              Bem-vindo ao Flow
            </h2>
            <p className="font-body text-base text-zinc-500 leading-relaxed max-w-[440px]">
              Gestão premium de pipeline e execução comercial
            </p>
          </div>

          {/* Bullets */}
          <div className="space-y-5 mb-16">
            {brandingBullets.map((bullet, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.18,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.06 * (index + 1),
                }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-light">
                  <bullet.icon className="h-[18px] w-[18px] text-brand opacity-80" />
                </div>
                <span className="font-body text-[15px] text-zinc-600">
                  {bullet.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="mt-auto">
            <p className="font-body text-xs text-zinc-400">
              Use seu e-mail corporativo para acessar
            </p>
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* RIGHT COLUMN — Login Card (45% desktop, full mobile)              */}
      {/* ================================================================= */}
      <div className="flex w-full lg:w-[45%] items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.18,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.06,
          }}
          className="w-full max-w-[480px]"
        >
          {/* Card */}
          <div className="rounded-[20px] border border-zinc-200/80 bg-white p-7 sm:p-8 shadow-premium-soft">
            {/* Card Header */}
            <div className="mb-7">
              {/* Mobile-only logo */}
              <div className="mb-4 lg:hidden">
                <Image
                  src="/flow-logo.svg"
                  alt="Flow by Menux"
                  width={100}
                  height={27}
                  priority
                />
              </div>
              <h2 className="font-heading text-2xl font-bold text-brand-ink">
                Entrar
              </h2>
              <p className="mt-1 font-body text-sm text-zinc-500">
                Acesse sua conta para continuar
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3.5"
              noValidate
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="font-body text-[13px] font-medium text-zinc-600"
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={isDisabledByLockout}
                  className="h-[46px] rounded-[15px] font-body text-sm transition-[border-color,box-shadow] duration-[140ms] ease-out focus:border-brand/40 focus:shadow-[0_0_0_3px_rgba(29,78,216,0.08)]"
                  {...register("email")}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    className="font-body text-xs text-status-danger"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="font-body text-[13px] font-medium text-zinc-600"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isDisabledByLockout}
                    className="h-[46px] rounded-[15px] pr-12 font-body text-sm transition-[border-color,box-shadow] duration-[140ms] ease-out focus:border-brand/40 focus:shadow-[0_0_0_3px_rgba(29,78,216,0.08)]"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 opacity-70 transition-opacity duration-[140ms] hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    className="font-body text-xs text-status-danger"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Remember me + Forgot password on same line */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  <label
                    htmlFor="rememberMe"
                    className="cursor-pointer font-body text-sm text-zinc-600"
                  >
                    Lembrar-me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="font-body text-sm text-brand hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Alert / Error */}
              {renderAlert()}

              {/* CAPTCHA */}
              {renderCaptcha()}

              {/* Submit Button */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isButtonDisabled}
                  className="h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white transition-[transform,box-shadow] duration-[140ms] ease-out hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:scale-[0.98] active:duration-[90ms] disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Entrando…</span>
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="font-body text-xs text-zinc-400">
                Precisa de ajuda?{" "}
                <Link
                  href="/support"
                  className="font-medium text-zinc-500 hover:text-brand hover:underline"
                >
                  Falar com suporte
                </Link>
              </p>
            </div>
          </div>

          {/* Powered by */}
          <p className="mt-6 text-center font-body text-xs text-zinc-400">
            Desenvolvido por{" "}
            <span className="font-medium text-zinc-500">@menux</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
