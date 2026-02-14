import * as React from "react";
import { cn } from "@/lib/utils";
import { SkeletonBlock } from "./skeleton-block";
import { InlineFeedback } from "./inline-feedback";

export interface BentoListCardProps<T = unknown> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: {
    icon: React.ReactNode;
    message: string;
    action?: { label: string; onClick: () => void };
  };
  grouped?: boolean;
  state?: "default" | "loading" | "error";
  className?: string;
  elevated?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

function BentoListCardInner<T = unknown>(
  {
    title,
    items,
    renderItem,
    emptyState,
    grouped = false,
    state = "default",
    className,
    elevated = false,
    errorMessage,
    onRetry,
    actions,
    ...props
  }: BentoListCardProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  // Estado de loading
  if (state === "loading") {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-bento-card)]",
          "border border-[var(--border-bento-default)]",
          "bg-white",
          elevated
            ? "shadow-[var(--shadow-bento-md)]"
            : "shadow-[var(--shadow-bento-sm)]",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="border-b border-[var(--border-bento-subtle)] px-6 py-4">
          <div className="h-6 w-40 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
        </div>

        {/* Content */}
        <div className="p-6">
          <SkeletonBlock type="list" lines={5} />
        </div>
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
          "bg-white",
          elevated
            ? "shadow-[var(--shadow-bento-md)]"
            : "shadow-[var(--shadow-bento-sm)]",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="border-b border-[var(--border-bento-subtle)] px-6 py-4">
          <h3 className="font-heading text-lg font-semibold text-black">
            {title}
          </h3>
        </div>

        {/* Error */}
        <div className="p-6">
          <InlineFeedback
            type="error"
            message={errorMessage || "Erro ao carregar lista"}
            actionLabel={onRetry ? "Tentar novamente" : undefined}
            onAction={onRetry}
          />
        </div>
      </div>
    );
  }

  // Estado empty
  if (items.length === 0 && emptyState) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-bento-card)]",
          "border border-[var(--border-bento-default)]",
          "bg-white",
          elevated
            ? "shadow-[var(--shadow-bento-md)]"
            : "shadow-[var(--shadow-bento-sm)]",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="border-b border-[var(--border-bento-subtle)] px-6 py-4">
          <h3 className="font-heading text-lg font-semibold text-black">
            {title}
          </h3>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-400">
          {emptyState.icon}
          <p className="font-body text-sm">{emptyState.message}</p>
          {emptyState.action && (
            <button
              onClick={emptyState.action.onClick}
              className={cn(
                "mt-2 rounded-full bg-brand px-4 py-2",
                "font-heading text-sm font-medium text-white",
                "transition-all duration-[var(--transition-bento)]",
                "hover:bg-brand/90 active:scale-[var(--scale-bento-active)]",
                "focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2"
              )}
            >
              {emptyState.action.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Estado default com itens
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--radius-bento-card)]",
        "border border-[var(--border-bento-default)]",
        "bg-white",
        elevated
          ? "shadow-[var(--shadow-bento-md)]"
          : "shadow-[var(--shadow-bento-sm)]",
        elevated && "hover:shadow-[var(--shadow-bento-md-hover)]",
        "transition-shadow duration-[var(--transition-bento)]",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-bento-subtle)] px-6 py-4">
        <h3 className="font-heading text-lg font-semibold text-black">
          {title}
        </h3>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className={cn(grouped ? "space-y-4" : "space-y-2")}>
          {items.map((item, index) => (
            <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// Usar React.forwardRef com genérico
const BentoListCard = React.forwardRef(BentoListCardInner) as <T = unknown>(
  props: BentoListCardProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof BentoListCardInner>;

export { BentoListCard };
