import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface InlineFeedbackProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  compact?: boolean;
  className?: string;
}

const InlineFeedback = React.forwardRef<HTMLDivElement, InlineFeedbackProps>(
  (
    {
      type,
      message,
      actionLabel,
      onAction,
      onClose,
      compact = false,
      className,
      ...props
    },
    ref
  ) => {
    const icons = {
      success: CheckCircle2,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
    };

    const Icon = icons[type];

    const styles = {
      success: {
        bg: "bg-[var(--feedback-success-bg)]",
        border: "border-l-[var(--feedback-success-border)]",
        text: "text-[var(--feedback-success-text)]",
        icon: "text-[var(--feedback-success-text)]",
      },
      error: {
        bg: "bg-[var(--feedback-error-bg)]",
        border: "border-l-[var(--feedback-error-border)]",
        text: "text-[var(--feedback-error-text)]",
        icon: "text-[var(--feedback-error-text)]",
      },
      warning: {
        bg: "bg-[var(--feedback-warning-bg)]",
        border: "border-l-[var(--feedback-warning-border)]",
        text: "text-[var(--feedback-warning-text)]",
        icon: "text-[var(--feedback-warning-text)]",
      },
      info: {
        bg: "bg-[var(--feedback-info-bg)]",
        border: "border-l-[var(--feedback-info-border)]",
        text: "text-[var(--feedback-info-text)]",
        icon: "text-[var(--feedback-info-text)]",
      },
    };

    const style = styles[type];

    return (
      <div
        ref={ref}
        className={cn(
          // Base
          "flex items-start gap-3 rounded-[var(--radius-bento-inner)]",
          "border-l-4",
          style.bg,
          style.border,

          // Padding
          compact ? "px-3 py-2" : "px-4 py-3",

          // Animation
          "animate-in fade-in slide-in-from-top-1 duration-300",

          className
        )}
        {...props}
      >
        {/* Icon */}
        <Icon
          className={cn("shrink-0", style.icon, compact ? "h-4 w-4" : "h-5 w-5")}
        />

        {/* Message */}
        <p
          className={cn(
            "flex-1 font-body font-medium",
            style.text,
            compact ? "text-xs" : "text-sm"
          )}
        >
          {message}
        </p>

        {/* Action Button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={cn(
              "shrink-0 font-body font-semibold underline-offset-2 hover:underline",
              style.text,
              compact ? "text-xs" : "text-sm",
              "transition-all duration-[var(--transition-bento-fast)]"
            )}
          >
            {actionLabel}
          </button>
        )}

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "shrink-0 rounded-[var(--radius-bento-small)]",
              "transition-all duration-[var(--transition-bento-fast)]",
              "hover:bg-black/5 active:scale-95",
              style.text
            )}
            aria-label="Fechar"
          >
            <X className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
          </button>
        )}
      </div>
    );
  }
);

InlineFeedback.displayName = "InlineFeedback";

export { InlineFeedback };
