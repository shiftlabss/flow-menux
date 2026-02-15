import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { premiumPressMotion } from "@/lib/motion";

export interface BentoCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "tall" | "wide";
  state?: "default" | "loading" | "error" | "empty";
  className?: string;
  noPadding?: boolean;
  elevated?: boolean;
  hoverable?: boolean;
  shine?: boolean;
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      title,
      description,
      actions,
      children,
      size = "md",
      state = "default",
      className,
      noPadding = false,
      elevated = false,
      hoverable = false,
      shine = true,
      ...props
    },
    ref
  ) => {
    const hasHeader = title || description || actions;
    const sizeClass =
      size === "sm"
        ? "min-h-[140px]"
        : size === "lg"
          ? "min-h-[260px]"
          : size === "tall"
            ? "min-h-[340px]"
            : size === "wide"
              ? "min-h-[200px]"
              : "min-h-[180px]";

    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? premiumPressMotion.whileHover : undefined}
        whileTap={hoverable ? premiumPressMotion.whileTap : undefined}
        transition={
          hoverable
            ? { duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }
            : undefined
        }
        className={cn(
          // Base styles
          "group/card relative overflow-hidden",
          "bento-card-base premium-panel",
          "rounded-[var(--radius-bento-card)]",
          "border border-[var(--border-bento-default)]",
          "focus-within:ring-2 focus-within:ring-brand/20",

          // Shadow elevation
          elevated && "bento-card-elevated",
          !elevated && "shadow-[var(--shadow-bento-sm)]",

          // Hover state
          hoverable && elevated && "bento-card-elevated-hover",
          hoverable && !elevated && "bento-card-hover",
          hoverable && "premium-lift",
          hoverable && shine && "premium-shine",

          // Size
          sizeClass,

          // State-specific styles
          state === "error" && "border-[var(--border-bento-error)]",
          state === "loading" && "pointer-events-none opacity-80",

          className
        )}
        {...props}
      >
        {shine && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100"
            >
              <div className="absolute -top-16 right-[-12%] h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
              <div className="absolute -bottom-16 left-[-10%] h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent opacity-70"
            />
          </>
        )}

        {/* Header */}
        {hasHeader && (
          <div
            className={cn(
              "flex items-start justify-between gap-4",
              noPadding ? "px-6 pt-6" : "px-6 pt-6 pb-4"
            )}
          >
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="font-heading text-lg font-semibold text-black">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 font-body text-sm text-zinc-500">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
          </div>
        )}

        {/* Content */}
        <div className={cn(!noPadding && (hasHeader ? "px-6 pb-6" : "p-6"))}>
          {children}
        </div>
      </motion.div>
    );
  }
);

BentoCard.displayName = "BentoCard";

export { BentoCard };
