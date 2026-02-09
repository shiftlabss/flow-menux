"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  Check,
  MapPin,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Unit } from "@/types";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockUnits: Unit[] = [
  {
    id: "unit-1",
    name: "Matriz",
    address: "Av. Paulista, 1000 - Sao Paulo, SP",
    isActive: true,
  },
  {
    id: "unit-2",
    name: "Filial SP",
    address: "Rua Augusta, 500 - Sao Paulo, SP",
    isActive: true,
  },
  {
    id: "unit-3",
    name: "Filial RJ",
    address: "Av. Rio Branco, 200 - Rio de Janeiro, RJ",
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// UnitSwitcher
// ---------------------------------------------------------------------------

interface UnitSwitcherProps {
  /** If true, shows "Todas as unidades" option (master/admin) */
  isAdminOrMaster?: boolean;
}

export function UnitSwitcher({ isAdminOrMaster = false }: UnitSwitcherProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | "all">(
    mockUnits[0].id
  );

  const selectedUnit =
    selectedUnitId === "all"
      ? null
      : mockUnits.find((u) => u.id === selectedUnitId);
  const displayName = selectedUnit ? selectedUnit.name : "Todas as unidades";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-body text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand/20">
          <Building2 className="h-4 w-4 text-zinc-500" />
          <span className="max-w-[120px] truncate font-medium">
            {displayName}
          </span>
          <Badge className="rounded-[10px] bg-brand-light font-body text-[10px] font-semibold text-brand border-0 px-1.5 py-0">
            {mockUnits.length}
          </Badge>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 rounded-[15px] p-1"
      >
        {/* "Todas as unidades" option — admin/master only */}
        {isAdminOrMaster && (
          <>
            <DropdownMenuItem
              onClick={() => setSelectedUnitId("all")}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 font-body text-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light">
                <Globe className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="font-heading text-sm font-medium text-black">
                  Todas as unidades
                </p>
                <p className="font-body text-xs text-zinc-500">
                  Visao consolidada
                </p>
              </div>
              {selectedUnitId === "all" && (
                <Check className="h-4 w-4 text-brand" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Unit list */}
        {mockUnits.map((unit) => (
          <DropdownMenuItem
            key={unit.id}
            onClick={() => setSelectedUnitId(unit.id)}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 font-body text-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
              <MapPin className="h-4 w-4 text-zinc-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-medium text-black">
                {unit.name}
              </p>
              {unit.address && (
                <p className="truncate font-body text-xs text-zinc-500">
                  {unit.address}
                </p>
              )}
            </div>
            {selectedUnitId === unit.id && (
              <Check className="h-4 w-4 shrink-0 text-brand" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
