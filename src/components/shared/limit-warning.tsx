"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Props ──────────────────────────────────────────────────────────
interface LimitWarningProps {
  /** Name of the resource approaching its limit */
  resource: string;
  /** Current usage count */
  current: number;
  /** Maximum allowed for this resource */
  max: number;
  /** Additional CSS classes */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────
export function LimitWarning({
  resource,
  current,
  max,
  className,
}: LimitWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const percent = max > 0 ? Math.round((current / max) * 100) : 0;

  // Only show if usage is notable (component can be rendered anywhere,
  // but typically shown when percent > 0)
  if (percent <= 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-[15px] bg-status-warning-light border border-status-warning/30 px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-4 text-status-warning shrink-0" />
        <p className="font-body text-sm text-zinc-700">
          Você atingiu{" "}
          <span className="font-semibold">{percent}%</span> do limite de{" "}
          <span className="font-semibold">{resource}</span>. Considere fazer
          upgrade.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="shrink-0 rounded-full p-1 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors"
        aria-label="Fechar aviso"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
