"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  User,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

interface Pipeline {
  id: string;
  label: string;
}

interface PipelineSwitcherProps {
  selectedPipeline: Pipeline;
  availablePipelines: Pipeline[];
  hasActiveFilters?: boolean;
  isAdmin?: boolean;
  showOnlyMine?: boolean;
  onToggleShowOnlyMine?: () => void;
  onPipelineChange: (pipelineId: string) => void;
  onSettingsClick?: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// PipelineTitle Component
// ═══════════════════════════════════════════════════════════════════

export function PipelineTitle({
  title,
  isHighlighted,
}: {
  title: string;
  isHighlighted: boolean;
}) {
  const isTruncated = title.length > 30;

  const titleElement = (
    <h1
      className={`font-heading text-2xl font-bold text-black transition-all duration-300 ${
        isHighlighted ? "text-brand" : ""
      }`}
    >
      {isTruncated ? `${title.substring(0, 30)}...` : title}
    </h1>
  );

  if (isTruncated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{titleElement}</TooltipTrigger>
          <TooltipContent>{title}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return titleElement;
}

// ═══════════════════════════════════════════════════════════════════
// PipelineSwitcherIcon Component
// ═══════════════════════════════════════════════════════════════════

export function PipelineSwitcherIcon({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              isOpen ? "bg-zinc-100" : ""
            }`}
            aria-label="Trocar funil"
            aria-expanded={isOpen}
          >
            <ChevronDown
              className={`h-4 w-4 text-zinc-600 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>Trocar funil</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PipelineSwitcherPopover Component
// ═══════════════════════════════════════════════════════════════════

export function PipelineSwitcher({
  selectedPipeline,
  availablePipelines,
  hasActiveFilters = false,
  isAdmin = false,
  showOnlyMine = false,
  onToggleShowOnlyMine,
  onPipelineChange,
  onSettingsClick,
}: PipelineSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingPipelineId, setPendingPipelineId] = useState<string | null>(
    null
  );
  const [isApplying, setIsApplying] = useState(false);
  const [titleHighlighted, setTitleHighlighted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Show switcher icon only if more than 1 pipeline
  const shouldShowSwitcher = availablePipelines.length > 1;

  // Filter pipelines based on search
  const filteredPipelines = useMemo(() => {
    if (!searchQuery.trim()) return availablePipelines;
    const query = searchQuery.toLowerCase();
    return availablePipelines.filter((p) =>
      p.label.toLowerCase().includes(query)
    );
  }, [availablePipelines, searchQuery]);

  // Show search if 7+ pipelines
  const showSearch = availablePipelines.length >= 7;

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, showSearch]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 250);
  };

  // Handle pipeline selection
  const handlePipelineSelect = (pipelineId: string) => {
    if (pipelineId === selectedPipeline.id) {
      setIsOpen(false);
      return;
    }

    // If filters are active, show confirmation
    if (hasActiveFilters && !showConfirmation) {
      setPendingPipelineId(pipelineId);
      setShowConfirmation(true);
      return;
    }

    // Apply change
    setIsApplying(true);
    setError(null);

    // Simulate async operation
    setTimeout(() => {
      try {
        onPipelineChange(pipelineId);
        setIsApplying(false);
        setIsOpen(false);
        setShowConfirmation(false);
        setPendingPipelineId(null);
        setSearchQuery("");

        // Highlight title for 800ms
        setTitleHighlighted(true);
        setTimeout(() => setTitleHighlighted(false), 800);
      } catch (err) {
        setError("Erro ao trocar funil. Tente novamente.");
        setIsApplying(false);
      }
    }, 300);
  };

  const handleConfirmChange = () => {
    if (pendingPipelineId) {
      handlePipelineSelect(pendingPipelineId);
    }
  };

  const handleCancelChange = () => {
    setShowConfirmation(false);
    setPendingPipelineId(null);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, filteredPipelines.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredPipelines[focusedIndex]) {
          handlePipelineSelect(filteredPipelines[focusedIndex].id);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setShowConfirmation(false);
        setPendingPipelineId(null);
        break;
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [focusedIndex, isOpen]);

  if (!shouldShowSwitcher) {
    return <PipelineTitle title={selectedPipeline.label} isHighlighted={false} />;
  }

  return (
    <div className="flex items-center gap-2">
      <PipelineTitle
        title={selectedPipeline.label}
        isHighlighted={titleHighlighted}
      />

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div>
            <PipelineSwitcherIcon
              onClick={() => setIsOpen(!isOpen)}
              isOpen={isOpen}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 rounded-[var(--radius-bento-card)] p-0"
          align="start"
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="border-b border-zinc-200 px-4 py-3">
            <h3 className="font-heading text-sm font-semibold text-black">
              Selecionar funil
            </h3>
          </div>

          {/* Error State */}
          {error && (
            <div className="mx-4 mt-3 flex items-start gap-2 rounded-[var(--radius-bento-inner)] bg-[var(--feedback-error-bg)] p-3 text-[var(--feedback-error-text)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="font-body text-xs leading-tight">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-2 h-7 px-2 font-body text-xs"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          {/* Search */}
          {showSearch && !showConfirmation && (
            <div className="px-4 pt-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar funil..."
                  className="h-9 rounded-full pl-8 pr-8 font-body text-sm"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  defaultValue={searchQuery}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      if (searchInputRef.current) {
                        searchInputRef.current.value = "";
                      }
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Confirmation State */}
          {showConfirmation && (
            <div className="p-4">
              <div className="rounded-[var(--radius-bento-inner)] bg-[var(--feedback-warning-bg)] p-3 text-[var(--feedback-warning-text)]">
                <p className="font-body text-xs leading-tight">
                  Trocar funil vai limpar filtros ativos. Você quer continuar?
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleConfirmChange}
                    disabled={isApplying}
                    className="h-8 flex-1 rounded-full bg-black font-heading text-xs text-white hover:bg-zinc-800"
                  >
                    {isApplying ? "Aplicando..." : "Trocar e limpar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelChange}
                    disabled={isApplying}
                    className="h-8 flex-1 rounded-full font-heading text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline List */}
          {!showConfirmation && (
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto px-2 py-2"
              role="listbox"
              aria-label="Lista de funis"
            >
              {isLoading ? (
                // Loading State
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : filteredPipelines.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="font-body text-sm text-zinc-500">
                    Nenhum funil disponível
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="mt-2 h-8 rounded-full font-heading text-xs"
                  >
                    Recarregar
                  </Button>
                </div>
              ) : (
                // Pipeline Items
                filteredPipelines.map((pipeline, index) => {
                  const isSelected = pipeline.id === selectedPipeline.id;
                  const isFocused = index === focusedIndex;
                  const isCurrentlyApplying =
                    isApplying && pipeline.id === pendingPipelineId;

                  return (
                    <button
                      key={pipeline.id}
                      onClick={() => handlePipelineSelect(pipeline.id)}
                      disabled={isApplying}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-brand/10 text-brand"
                          : isFocused
                            ? "bg-zinc-100"
                            : "hover:bg-zinc-50"
                      } ${isApplying ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={isFocused ? 0 : -1}
                    >
                      <span className="font-body text-sm font-medium">
                        {pipeline.label}
                      </span>
                      {isCurrentlyApplying ? (
                        <span className="font-body text-xs text-zinc-500">
                          Aplicando...
                        </span>
                      ) : (
                        isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-brand" />
                        )
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Footer */}
          {!showConfirmation && (
            <div className="border-t border-zinc-200 px-2 py-2">
              {onToggleShowOnlyMine && (
                <button
                  onClick={onToggleShowOnlyMine}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-500" />
                    <span className="font-body text-sm font-medium text-zinc-700">
                      Apenas meus cards
                    </span>
                  </div>
                  <div
                    className={`flex h-5 w-9 items-center rounded-full transition-colors ${
                      showOnlyMine ? "bg-black" : "bg-zinc-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        showOnlyMine ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </button>
              )}
              {isAdmin && onSettingsClick && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onSettingsClick();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
                >
                  <Settings2 className="h-4 w-4 text-zinc-500" />
                  <span className="font-body text-sm font-medium text-zinc-700">
                    Gerenciar Funis
                  </span>
                </button>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
