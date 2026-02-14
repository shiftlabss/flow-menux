import * as React from "react";
import { cn } from "@/lib/utils";
import { SkeletonBlock } from "./skeleton-block";
import { InlineFeedback } from "./inline-feedback";

export interface BentoTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface BentoTableCardProps {
  title: string;
  columns: BentoTableColumn[];
  rows: Record<string, unknown>[];
  state?: "default" | "loading" | "error" | "empty";
  className?: string;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

const BentoTableCard = React.forwardRef<HTMLDivElement, BentoTableCardProps>(
  (
    {
      title,
      columns,
      rows,
      state = "default",
      className,
      errorMessage,
      emptyMessage = "Nenhum dado disponível",
      onRetry,
      actions,
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
            "bg-white shadow-[var(--shadow-bento-sm)]",
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="border-b border-[var(--border-bento-subtle)] px-6 py-4">
            <div className="h-6 w-48 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
          </div>

          {/* Content */}
          <div className="p-6">
            <SkeletonBlock type="table" lines={4} />
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
            "bg-white shadow-[var(--shadow-bento-sm)]",
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
              message={errorMessage || "Erro ao carregar tabela"}
              actionLabel={onRetry ? "Tentar novamente" : undefined}
              onAction={onRetry}
            />
          </div>
        </div>
      );
    }

    // Estado empty
    if (state === "empty" || rows.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-[var(--radius-bento-card)]",
            "border border-[var(--border-bento-default)]",
            "bg-white shadow-[var(--shadow-bento-sm)]",
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

          {/* Empty */}
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-400">
            <p className="font-body text-sm">{emptyMessage}</p>
          </div>
        </div>
      );
    }

    // Estado default com dados
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-bento-card)]",
          "border border-[var(--border-bento-default)]",
          "bg-white shadow-[var(--shadow-bento-sm)]",
          "hover:shadow-[var(--shadow-bento-sm-hover)]",
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

        {/* Table */}
        <div className="p-6">
          <div className="space-y-3">
            {/* Table Header */}
            <div
              className="grid items-center gap-2 border-b border-[var(--border-bento-subtle)] pb-2"
              style={{
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
              }}
            >
              {columns.map((column) => (
                <span
                  key={column.key}
                  className={cn(
                    "font-body text-xs font-medium uppercase tracking-wide text-zinc-500",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                >
                  {column.label}
                </span>
              ))}
            </div>

            {/* Table Rows */}
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  "grid items-center gap-2 rounded-[var(--radius-bento-inner)] p-2",
                  "transition-colors duration-[var(--transition-bento-fast)]",
                  "hover:bg-zinc-50"
                )}
                style={{
                  gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={cn(
                      "min-w-0 font-body text-sm",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "")}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

BentoTableCard.displayName = "BentoTableCard";

export { BentoTableCard };
