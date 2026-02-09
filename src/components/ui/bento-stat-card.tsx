import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SkeletonBlock } from "./skeleton-block";
import { InlineFeedback } from "./inline-feedback";

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
          "bg-white",
          "shadow-[var(--shadow-bento-sm)]",
          "transition-shadow duration-[var(--transition-bento)]",
          "hover:shadow-[var(--shadow-bento-sm-hover)]",

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
            <div
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
            </div>
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
          {/* Value */}
          <p
            className={cn(
              "font-heading font-bold text-black",
              size === "sm" && "text-xl",
              size === "md" && "text-2xl",
              size === "lg" && "text-3xl"
            )}
          >
            {value}
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
