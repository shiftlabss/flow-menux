import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonBlockProps {
  type?: "stat" | "list" | "table" | "chart" | "custom";
  lines?: number;
  className?: string;
}

const SkeletonBlock = React.forwardRef<HTMLDivElement, SkeletonBlockProps>(
  ({ type = "custom", lines = 3, className, ...props }, ref) => {
    // Skeleton para BentoStatCard
    if (type === "stat") {
      return (
        <div ref={ref} className={cn("space-y-3", className)} {...props}>
          {/* Icon + Delta */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 animate-pulse rounded-[var(--radius-bento-inner)] bg-zinc-100" />
            <div className="h-5 w-14 animate-pulse rounded-[var(--radius-bento-inner)] bg-zinc-100" />
          </div>
          {/* Value */}
          <div className="h-8 w-20 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
          {/* Label */}
          <div className="h-4 w-32 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
          {/* Helper */}
          <div className="h-3 w-28 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
        </div>
      );
    }

    // Skeleton para listas (alertas, atividades)
    if (type === "list") {
      return (
        <div ref={ref} className={cn("space-y-3", className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-14 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100",
                // Variação de altura para parecer mais natural
                i % 3 === 0 && "h-16",
                i % 3 === 1 && "h-12"
              )}
            />
          ))}
        </div>
      );
    }

    // Skeleton para tabelas
    if (type === "table") {
      return (
        <div ref={ref} className={cn("space-y-3", className)} {...props}>
          {/* Header */}
          <div className="flex gap-2 border-b border-zinc-100 pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3 flex-1 animate-pulse rounded-[var(--radius-bento-small)] bg-zinc-100"
              />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: lines || 4 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className={cn(
                    "h-4 flex-1 animate-pulse rounded-[var(--radius-bento-inner)] bg-zinc-100",
                    // Primeira coluna mais larga
                    j === 0 && "flex-[2]"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Skeleton para charts (barras horizontais)
    if (type === "chart") {
      const barWidths = [72, 55, 88, 63, 45, 80];
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          {Array.from({ length: lines || 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              {/* Label + Value */}
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
                <div className="flex items-center gap-3">
                  <div className="h-5 w-8 animate-pulse rounded-[var(--radius-bento-inner)] bg-zinc-100" />
                  <div className="h-4 w-20 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
                </div>
              </div>
              {/* Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full animate-pulse rounded-full bg-zinc-200"
                  style={{ width: `${barWidths[i % barWidths.length]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Custom skeleton - linhas genéricas
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100",
              // Variação de largura
              i === 0 && "w-3/4",
              i === 1 && "w-full",
              i === 2 && "w-5/6",
              i > 2 && "w-full"
            )}
          />
        ))}
      </div>
    );
  }
);

SkeletonBlock.displayName = "SkeletonBlock";

export { SkeletonBlock };
