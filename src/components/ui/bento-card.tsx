import * as React from "react";
import { cn } from "@/lib/utils";

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
      ...props
    },
    ref
  ) => {
    const hasHeader = title || description || actions;

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative overflow-hidden bg-white",
          "rounded-[var(--radius-bento-card)]",
          "border border-[var(--border-bento-default)]",

          // Shadow elevation
          elevated
            ? "shadow-[var(--shadow-bento-md)]"
            : "shadow-[var(--shadow-bento-sm)]",

          // Hover state
          hoverable && elevated && "hover:shadow-[var(--shadow-bento-md-hover)]",
          hoverable && !elevated && "hover:shadow-[var(--shadow-bento-sm-hover)]",
          hoverable && "transition-shadow duration-[var(--transition-bento)]",

          // State-specific styles
          state === "error" && "border-[var(--border-bento-error)]",

          className
        )}
        {...props}
      >
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
      </div>
    );
  }
);

BentoCard.displayName = "BentoCard";

export { BentoCard };
