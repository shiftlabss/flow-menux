"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Hook: useIsMobile ──────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // set initial value
    handleChange(mql);

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}

// ── Accordion Section (mobile column) ──────────────────────────────
interface AccordionSectionProps {
  title: string;
  count: number;
  children: ReactNode;
  defaultOpen?: boolean;
  color?: string;
}

function AccordionSection({
  title,
  count,
  children,
  defaultOpen = false,
  color,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-[15px] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="size-4 text-zinc-500" />
          ) : (
            <ChevronRight className="size-4 text-zinc-500" />
          )}
          <span className="font-heading font-semibold text-sm">{title}</span>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "rounded-[10px] text-xs",
            color && `bg-${color} text-white`
          )}
        >
          {count}
        </Badge>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3">{children}</div>
      )}
    </div>
  );
}

// ── Column definition for list mode ────────────────────────────────
export interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  color?: string;
  children: ReactNode;
}

// ── Main Component: ResponsiveKanban ───────────────────────────────
interface ResponsiveKanbanProps {
  /** Kanban view content (rendered on desktop) */
  children: ReactNode;
  /** Columns for the mobile list/accordion view */
  columns?: KanbanColumn[];
  /** Breakpoint in px to switch between views (default: 768) */
  breakpoint?: number;
}

export function ResponsiveKanban({
  children,
  columns,
  breakpoint = 768,
}: ResponsiveKanbanProps) {
  const isMobile = useIsMobile(breakpoint);

  if (isMobile && columns && columns.length > 0) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {columns.map((column, index) => (
          <AccordionSection
            key={column.id}
            title={column.title}
            count={column.count}
            color={column.color}
            defaultOpen={index === 0}
          >
            {column.children}
          </AccordionSection>
        ))}
      </div>
    );
  }

  // Desktop: render kanban content as-is
  return <>{children}</>;
}

export { useIsMobile };
