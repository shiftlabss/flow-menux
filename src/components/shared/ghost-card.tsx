"use client";

import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ── Props ──────────────────────────────────────────────────────────
interface GhostCardProps {
  /** Title of the opportunity or client */
  title: string;
  /** Name of the card's owner */
  ownerName: string;
  /** Type of entity */
  type: "opportunity" | "client";
  /** Additional CSS classes */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────
export function GhostCard({
  title,
  ownerName,
  type,
  className,
}: GhostCardProps) {
  const typeLabel = type === "opportunity" ? "Oportunidade" : "Cliente";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "rounded-[15px] opacity-50 cursor-default select-none",
              className
            )}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div className="flex items-center justify-center size-8 rounded-full bg-zinc-100 shrink-0">
                <Lock className="size-4 text-zinc-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-medium text-zinc-700 truncate">
                  {title}
                </p>
                <p className="font-body text-xs text-zinc-400">
                  {typeLabel} de {ownerName}
                </p>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>

        <TooltipContent side="top" className="max-w-[240px]">
          <p className="text-xs">
            Você não tem permissão para visualizar os detalhes deste card
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
