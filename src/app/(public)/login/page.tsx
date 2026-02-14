"use client";

/**
 * Login Page - Flow CRM
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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

const LOCKOUT_15MIN_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_1H_MS = 60 * 60 * 1000; // 1 hour

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a human-readable countdown string from remaining milliseconds. */
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

// ---------------------------------------------------------------------------
// Lockout tier type
// ---------------------------------------------------------------------------
type LockoutTier = "none" | "captcha" | "lockout15" | "lockout1h" | "blocked";

function getLockoutTier(errors: number): LockoutTier {
  if (errors >= PERMANENT_BLOCK_THRESHOLD) return "blocked";
  if (errors >= LOCKOUT_1H_THRESHOLD) return "lockout1h";
  if (errors >= LOCKOUT_15MIN_THRESHOLD) return "lockout15";
  if (errors >= CAPTCHA_THRESHOLD) return "captcha";
  return "none";
}

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

  // Lockout timer state
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  const router = useRouter();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Derived lockout tier based on current error count
  const tier = getLockoutTier(errorCount);

  // Whether fields + button should be fully disabled (lockout or permanent block)
  const isTimerActive = lockoutEnd !== null && remainingMs > 0;
  const isFieldsDisabled =
    tier === "blocked" || tier === "lockout15" || tier === "lockout1h";
  const isDisabledByLockout = isFieldsDisabled && (isTimerActive || tier === "blocked");

  // Button should be disabled when:
  //  - submitting
  //  - any active lockout / permanent block
  //  - captcha tier active but not resolved
  const isButtonDisabled =
    isSubmitting ||
    isDisabledByLockout ||
    (tier === "captcha" && !captchaResolved);

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
        // Reset error count when timer expires so the user can try again
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

  // ---------------------------------------------------------------------------
  // Start a lockout timer when the tier changes to a timed lockout
  // ---------------------------------------------------------------------------
  const startLockout = useCallback((durationMs: number) => {
    setLockoutEnd(Date.now() + durationMs);
  }, []);

  // ---------------------------------------------------------------------------
  // Handle login failure – increment error count and apply tier logic
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
        setLoginError(
          "Muitas tentativas. Tente novamente em 15 minutos."
        );
        startLockout(LOCKOUT_15MIN_MS);
        break;
      case "captcha":
        setLoginError("Credenciais inválidas. Resolva o CAPTCHA para continuar.");
        break;
      default:
        setLoginError("E-mail ou senha incorretos.");
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
      // Simulate failed login for testing
      if (data.email === "fail@test.com") {
        handleLoginFailure();
        return;
      }

      // Mock: em produção, substituir por chamada à API POST /api/auth/login
      // On real API failure, call handleLoginFailure() instead of the mock below

      // Mock successful login
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
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Warning/error banner depending on current tier */
  function renderAlert() {
    if (!loginError) return null;

    // Permanent block – status-danger style
    if (tier === "blocked") {
      return (
        <div className="flex flex-col gap-2 rounded-[10px] bg-status-danger-light px-4 py-3">
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
        </div>
      );
    }

    // 1-hour lockout – status-danger style with countdown
    if (tier === "lockout1h" && isTimerActive) {
      return (
        <div className="flex flex-col gap-1 rounded-[10px] bg-status-danger-light px-4 py-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-status-danger" />
            <p className="font-body text-sm font-medium text-status-danger">
              Conta temporariamente bloqueada. Tente novamente em{" "}
              <span className="font-semibold">{formatCountdown(remainingMs)}</span>.
            </p>
          </div>
        </div>
      );
    }

    // 15-min lockout – status-warning style with countdown
    if (tier === "lockout15" && isTimerActive) {
      return (
        <div className="flex flex-col gap-1 rounded-[10px] bg-status-warning-light px-4 py-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 shrink-0 text-status-warning" />
            <p className="font-body text-sm font-medium text-status-warning">
              Muitas tentativas. Tente novamente em{" "}
              <span className="font-semibold">{formatCountdown(remainingMs)}</span>.
            </p>
          </div>
        </div>
      );
    }

    // Generic error / captcha tier
    return (
      <div className="flex items-center gap-2 rounded-[10px] bg-status-warning-light px-4 py-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-status-warning" />
        <p className="font-body text-sm text-status-warning">{loginError}</p>
      </div>
    );
  }

  /** Mock CAPTCHA checkbox – shown at tier >= captcha and below lockout tiers */
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
    <Card className="w-full max-w-[440px] rounded-[20px] border-zinc-200 shadow-xl">
      <CardContent className="p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-black">Flow</h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Entre na sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-sm text-zinc-600">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              disabled={isDisabledByLockout}
              className="h-12 rounded-[15px] font-body text-sm"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-status-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password – Enter key submits the form (default <form> behaviour) */}
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
                disabled={isDisabledByLockout}
                className="h-12 rounded-[15px] pr-12 font-body text-sm"
                {...register("password")}
              />
              {/* Toggle password visibility */}
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
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label
              htmlFor="rememberMe"
              className="cursor-pointer font-body text-sm text-zinc-600"
            >
              Lembrar-me
            </label>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="font-body text-sm text-brand hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Alert / Error Banner */}
          {renderAlert()}

          {/* Mock CAPTCHA (tier >= 3 errors, below timed lockout) */}
          {renderCaptcha()}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isButtonDisabled}
            className="h-12 w-full rounded-full bg-black font-heading text-base font-semibold text-white hover:bg-zinc-800"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  );
}
