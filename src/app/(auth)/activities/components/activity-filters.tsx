"use client";

import * as React from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ActivityType } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityFiltersProps {
  filterTypes: Set<ActivityType>;
  onToggleType: (type: ActivityType) => void;
  filterResponsible: string;
  onChangeResponsible: (id: string) => void;
  filterDateStart: string;
  onChangeDateStart: (date: string) => void;
  filterDateEnd: string;
  onChangeDateEnd: (date: string) => void;
  responsibles: Array<[string, string]>;
  onClearAll: () => void;
  typeLabels: Record<ActivityType, string>;
  typeColors: Record<ActivityType, { bg: string; text: string }>;
  TypeIcon: React.ComponentType<{ type: ActivityType; className?: string }>;
}

export function ActivityFilters({
  filterTypes,
  onToggleType,
  filterResponsible,
  onChangeResponsible,
  filterDateStart,
  onChangeDateStart,
  filterDateEnd,
  onChangeDateEnd,
  responsibles,
  onClearAll,
  typeLabels,
  typeColors,
  TypeIcon,
}: ActivityFiltersProps) {
  const [open, setOpen] = React.useState(false);

  // Contar filtros ativos
  const allTypes: ActivityType[] = [
    "call",
    "email",
    "meeting",
    "visit",
    "task",
    "follow-up",
    "whatsapp",
  ];
  const activeTypesCount = allTypes.length - filterTypes.size;
  const hasResponsibleFilter = filterResponsible !== "all";
  const hasDateFilter = filterDateStart || filterDateEnd;
  const activeFiltersCount =
    (activeTypesCount > 0 ? 1 : 0) +
    (hasResponsibleFilter ? 1 : 0) +
    (hasDateFilter ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Filter Button */}
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "rounded-full font-heading text-sm",
                activeFiltersCount > 0 && "border-brand bg-brand-light text-brand"
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-full bg-brand px-2 py-0 text-white"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-sm font-semibold">Filtros</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-auto p-0 font-body text-xs text-brand hover:bg-transparent hover:underline"
                  >
                    Limpar tudo
                  </Button>
                )}
              </div>

              {/* Type filters */}
              <div>
                <p className="mb-2 font-heading text-xs font-semibold text-black">
                  Tipo de Atividade
                </p>
                <div className="space-y-2">
                  {allTypes.map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2.5 rounded-[10px] p-1.5 transition-colors hover:bg-zinc-50"
                    >
                      <Checkbox
                        checked={filterTypes.has(type)}
                        onCheckedChange={() => onToggleType(type)}
                        className="h-[18px] w-[18px] rounded-[4px]"
                      />
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                          typeColors[type].bg
                        )}
                      >
                        <span className={typeColors[type].text}>
                          <TypeIcon type={type} className="h-3 w-3" />
                        </span>
                      </div>
                      <span className="font-body text-sm text-zinc-700">
                        {typeLabels[type]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Responsible filter */}
              <div>
                <p className="mb-2 font-heading text-xs font-semibold text-black">
                  Responsável
                </p>
                <select
                  value={filterResponsible}
                  onChange={(e) => onChangeResponsible(e.target.value)}
                  className="h-9 w-full rounded-[15px] border border-zinc-200 bg-white px-3 font-body text-sm text-zinc-700 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="all">Todos</option>
                  {responsibles.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date range */}
              <div>
                <p className="mb-2 font-heading text-xs font-semibold text-black">
                  Período
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block font-body text-xs text-zinc-500">
                      Data inicial
                    </label>
                    <Input
                      type="date"
                      value={filterDateStart}
                      onChange={(e) => onChangeDateStart(e.target.value)}
                      className="rounded-[15px] font-body text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-body text-xs text-zinc-500">
                      Data final
                    </label>
                    <Input
                      type="date"
                      value={filterDateEnd}
                      onChange={(e) => onChangeDateEnd(e.target.value)}
                      className="rounded-[15px] font-body text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-xs text-zinc-500">Filtros ativos:</span>

          {/* Type filters chips */}
          {allTypes
            .filter((type) => !filterTypes.has(type))
            .map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="gap-1 rounded-full font-body text-xs"
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full",
                    typeColors[type].bg
                  )}
                >
                  <span className={typeColors[type].text}>
                    <TypeIcon type={type} className="h-2.5 w-2.5" />
                  </span>
                </div>
                {typeLabels[type]} excluído
                <button
                  onClick={() => onToggleType(type)}
                  className="ml-0.5 rounded-full hover:bg-zinc-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

          {/* Responsible chip */}
          {hasResponsibleFilter && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-full font-body text-xs"
            >
              Responsável:{" "}
              {responsibles.find(([id]) => id === filterResponsible)?.[1]}
              <button
                onClick={() => onChangeResponsible("all")}
                className="ml-0.5 rounded-full hover:bg-zinc-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Date chip */}
          {hasDateFilter && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-full font-body text-xs"
            >
              Período:{" "}
              {filterDateStart && filterDateEnd
                ? `${filterDateStart} - ${filterDateEnd}`
                : filterDateStart
                  ? `Desde ${filterDateStart}`
                  : `Até ${filterDateEnd}`}
              <button
                onClick={() => {
                  onChangeDateStart("");
                  onChangeDateEnd("");
                }}
                className="ml-0.5 rounded-full hover:bg-zinc-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
