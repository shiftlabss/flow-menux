"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ActivityType } from "@/types";
import { typeIconComponents, typeLabels, typeColors, allActivityTypes } from "./config";

interface ActivityFiltersBarProps {
  filterTypes: Set<ActivityType>;
  filterResponsible: string;
  filterDateStart: string;
  filterDateEnd: string;
  responsibles: Array<[string, string]>;
  onToggleType: (type: ActivityType) => void;
  onChangeResponsible: (id: string) => void;
  onChangeDateStart: (date: string) => void;
  onChangeDateEnd: (date: string) => void;
  onClearAll: () => void;
}

export function ActivityFiltersBar({
  filterTypes,
  filterResponsible,
  filterDateStart,
  filterDateEnd,
  responsibles,
  onToggleType,
  onChangeResponsible,
  onChangeDateStart,
  onChangeDateEnd,
  onClearAll,
}: ActivityFiltersBarProps) {
  const hasActiveFilters =
    filterTypes.size < allActivityTypes.length ||
    filterResponsible !== "all" ||
    filterDateStart !== "" ||
    filterDateEnd !== "";

  return (
    <div className="space-y-2 rounded-[18px] border border-zinc-200/70 bg-white/70 p-3 shadow-sm">
      {/* Type Chips + Drawer Trigger */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {allActivityTypes.map((type) => {
            const Icon = typeIconComponents[type];
            const active = filterTypes.has(type);
            const tc = typeColors[type];
            return (
              <button
                key={type}
                onClick={() => onToggleType(type)}
                className={`flex h-8 items-center gap-1.5 rounded-full border px-3 font-body text-xs font-medium transition-colors ${
                  active
                    ? `${tc.bg} ${tc.text} border-transparent`
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                <Icon className="h-3 w-3" />
                {typeLabels[type]}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full border-zinc-200 bg-white font-heading text-xs hover:bg-zinc-100"
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] premium-panel">
            <SheetHeader>
              <SheetTitle className="font-heading">Filtros</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 px-4 pt-4">
              {/* Type checkboxes */}
              <div>
                <p className="mb-3 font-heading text-sm font-semibold text-black">
                  Tipo de Atividade
                </p>
                <div className="space-y-2">
                  {allActivityTypes.map((type) => {
                    const Icon = typeIconComponents[type];
                    const tc = typeColors[type];
                    return (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-2.5"
                      >
                        <Checkbox
                          checked={filterTypes.has(type)}
                          onCheckedChange={() => onToggleType(type)}
                          className="h-[18px] w-[18px] rounded-[4px]"
                        />
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${tc.bg}`}
                        >
                          <span className={tc.text}>
                            <Icon className="h-3 w-3" />
                          </span>
                        </div>
                        <span className="font-body text-sm text-zinc-700">
                          {typeLabels[type]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Responsible */}
              <div>
                <p className="mb-3 font-heading text-sm font-semibold text-black">
                  Responsavel
                </p>
                <select
                  value={filterResponsible}
                  onChange={(e) => onChangeResponsible(e.target.value)}
                  className="h-9 w-full rounded-[var(--radius-input)] border border-zinc-200 bg-white px-3 font-body text-sm text-zinc-700 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  <option value="all">Todos</option>
                  {responsibles.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <p className="mb-3 font-heading text-sm font-semibold text-black">
                  Periodo
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
                      className="rounded-[var(--radius-input)] font-body text-sm"
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
                      className="rounded-[var(--radius-input)] font-body text-sm"
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-full font-heading text-sm"
                onClick={onClearAll}
              >
                Limpar Filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filterResponsible !== "all" && (
            <FilterChip
              label={`Responsavel: ${responsibles.find(([id]) => id === filterResponsible)?.[1] || filterResponsible}`}
              onRemove={() => onChangeResponsible("all")}
            />
          )}
          {filterDateStart && (
            <FilterChip
              label={`De: ${filterDateStart}`}
              onRemove={() => onChangeDateStart("")}
            />
          )}
          {filterDateEnd && (
            <FilterChip
              label={`Ate: ${filterDateEnd}`}
              onRemove={() => onChangeDateEnd("")}
            />
          )}
          <button
            onClick={onClearAll}
            className="font-body text-xs text-brand hover:underline"
          >
            Limpar todos
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1">
      <span className="font-body text-xs text-zinc-600">{label}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 text-zinc-400 transition-colors hover:text-zinc-600"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
