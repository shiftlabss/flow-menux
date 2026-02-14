import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { SkeletonBlock } from "./skeleton-block";
import { InlineFeedback } from "./inline-feedback";

// ---------------------------------------------------------------------------
// Animated Counter Hook — rolls from 0 to target value
// ---------------------------------------------------------------------------

function useAnimatedCounter(target: number, duration = 1.2) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  React.useEffect(() => {
    const controls = animate(motionValue, target, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    });
    return controls.stop;
  }, [motionValue, target, duration]);

  return display;
}

// Extract numeric value from a string like "R$ 125.000" or "42%" or "15"
function extractNumericValue(value: string | number): {
  numeric: number;
  prefix: string;
  suffix: string;
  hasDecimal: boolean;
} {
  if (typeof value === "number") {
    return { numeric: value, prefix: "", suffix: "", hasDecimal: !Number.isInteger(value) };
  }

  // Match patterns like "R$ 125.000", "42%", "15", "$1,234.56"
  const match = value.match(/^([^0-9]*?)([\d.,]+)(.*)$/);
  if (!match) {
    return { numeric: 0, prefix: value, suffix: "", hasDecimal: false };
  }

  const prefix = match[1].trim();
  const rawNum = match[2];
  const suffix = match[3].trim();

  // Detect Brazilian format (dots as thousands, comma as decimal) vs US format
  const hasBrazilianFormat = rawNum.includes(".") && (rawNum.indexOf(",") > rawNum.lastIndexOf(".") || !rawNum.includes(","));
  let cleanNum: string;
  let hasDecimal: boolean;

  if (rawNum.includes(",") && !rawNum.includes(".")) {
    // Pure comma decimal: "1234,56"
    cleanNum = rawNum.replace(",", ".");
    hasDecimal = true;
  } else if (hasBrazilianFormat && rawNum.includes(",")) {
    // Brazilian: "1.234,56"
    cleanNum = rawNum.replace(/\./g, "").replace(",", ".");
    hasDecimal = true;
  } else {
    // US or integer with dots as thousands: "1,234" or "125.000"
    cleanNum = rawNum.replace(/,/g, "");
    hasDecimal = cleanNum.includes(".") && !Number.isInteger(parseFloat(cleanNum));
  }

  const numeric = parseFloat(cleanNum) || 0;
  return { numeric, prefix: prefix ? prefix + " " : "", suffix, hasDecimal };
}

function AnimatedValue({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  const { numeric, prefix, suffix } = extractNumericValue(value);
  const animated = useAnimatedCounter(numeric);

  // Format the number back with locale
  const formatted = React.useMemo(() => {
    if (typeof value === "number") return animated.toLocaleString("pt-BR");

    // Preserve original formatting style
    const original = String(value);
    if (original.includes("R$") || original.includes("$")) {
      return animated.toLocaleString("pt-BR");
    }
    return animated.toLocaleString("pt-BR");
  }, [animated, value]);

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export interface BentoStatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    direction?: "up" | "down";
  };
  helper?: string;
  icon?: React.ReactNode;
  state?: "default" | "loading" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

const BentoStatCard = React.forwardRef<HTMLDivElement, BentoStatCardProps>(
  (
    {
      label,
      value,
      delta,
      helper,
      icon,
      state = "default",
      size = "md",
      className,
      errorMessage,
      onRetry,
      ...props
    },
    ref
  ) => {
    // Estado de loading
    if (state === "loading") {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-[var(--radius-bento-card)]",
            "border border-[var(--border-bento-default)]",
            "bg-white p-5",
            "shadow-[var(--shadow-bento-sm)]",
            className
          )}
          {...props}
        >
          <SkeletonBlock type="stat" />
        </div>
      );
    }

    // Estado de erro
    if (state === "error") {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-[var(--radius-bento-card)]",
            "border border-[var(--border-bento-error)]",
            "bg-white p-5",
            "shadow-[var(--shadow-bento-sm)]",
            className
          )}
          {...props}
        >
          <InlineFeedback
            type="error"
            message={errorMessage || "Erro ao carregar métrica"}
            actionLabel={onRetry ? "Tentar novamente" : undefined}
            onAction={onRetry}
            compact
          />
        </div>
      );
    }

    // Auto-detect delta direction se não fornecido
    const deltaDirection = delta?.direction || (delta && delta.value > 0 ? "up" : "down");
    const isPositive = deltaDirection === "up";

    return (
      <div
        ref={ref}
        className={cn(
          // Base
          "group rounded-[var(--radius-bento-card)]",
          "border border-[var(--border-bento-default)]",
          
          // Glass vs Solid
          className?.includes("backdrop-blur") 
            ? "bg-white/80 backdrop-blur-md" 
            : "bg-white",

          "shadow-[var(--shadow-bento-sm)]",
          "transition-all duration-[var(--transition-bento)]", // Changed to transition-all for smoother hover
          "hover:shadow-[var(--shadow-bento-sm-hover)] hover:-translate-y-1", // Added lift effect

          // Padding variável por size
          size === "sm" && "p-4",
          size === "md" && "p-5",
          size === "lg" && "p-6",

          className
        )}
        {...props}
      >
        {/* Header: Icon + Delta */}
        <div className="flex items-center justify-between">
          {/* Icon */}
          {icon && (
            <div
              className={cn(
                "flex items-center justify-center rounded-[var(--radius-bento-inner)]",
                "bg-brand-light text-brand",
                size === "sm" && "h-8 w-8",
                size === "md" && "h-10 w-10",
                size === "lg" && "h-12 w-12"
              )}
            >
              {icon}
            </div>
          )}

          {/* Delta Badge */}
          {delta && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className={cn(
                "flex items-center gap-1 rounded-[var(--radius-bento-inner)]",
                "px-2 py-0.5 font-body font-medium",
                isPositive
                  ? "bg-status-success-light text-status-success"
                  : "bg-status-danger-light text-status-danger",
                size === "sm" && "text-[10px]",
                size === "md" && "text-xs",
                size === "lg" && "text-sm"
              )}
            >
              {isPositive ? (
                <TrendingUp
                  className={cn(
                    size === "sm" && "h-2.5 w-2.5",
                    size === "md" && "h-3 w-3",
                    size === "lg" && "h-3.5 w-3.5"
                  )}
                />
              ) : (
                <TrendingDown
                  className={cn(
                    size === "sm" && "h-2.5 w-2.5",
                    size === "md" && "h-3 w-3",
                    size === "lg" && "h-3.5 w-3.5"
                  )}
                />
              )}
              {Math.abs(delta.value)}%
            </motion.div>
          )}
        </div>

        {/* Value + Label + Helper */}
        <div
          className={cn(
            size === "sm" && "mt-2",
            size === "md" && "mt-3",
            size === "lg" && "mt-4"
          )}
        >
          {/* Value — Animated Counter */}
          <p
            className={cn(
              "font-heading font-bold text-black",
              size === "sm" && "text-xl",
              size === "md" && "text-2xl",
              size === "lg" && "text-3xl"
            )}
          >
            <AnimatedValue value={value} />
          </p>

          {/* Label */}
          <p
            className={cn(
              "mt-0.5 font-body text-zinc-500",
              size === "sm" && "text-[11px]",
              size === "md" && "text-xs",
              size === "lg" && "text-sm"
            )}
          >
            {label}
          </p>

          {/* Helper text */}
          {helper && (
            <p
              className={cn(
                "mt-1 font-body text-zinc-400",
                size === "sm" && "text-[10px]",
                size === "md" && "text-[11px]",
                size === "lg" && "text-xs"
              )}
            >
              {helper}
            </p>
          )}
        </div>
      </div>
    );
  }
);

BentoStatCard.displayName = "BentoStatCard";

export { BentoStatCard };
