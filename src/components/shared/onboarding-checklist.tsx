"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import {
  CheckCircle2,
  Circle,
  X,
  ChevronDown,
  User,
  Kanban,
  CalendarCheck,
  UserPlus,
  Settings,
  BarChart3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChecklistItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Checklist Items
// ---------------------------------------------------------------------------

const checklistItems: ChecklistItem[] = [
  {
    id: "complete-profile",
    title: "Completar perfil",
    href: "/settings/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    id: "create-opportunity",
    title: "Criar primeira oportunidade",
    href: "/pipes",
    icon: <Kanban className="h-4 w-4" />,
  },
  {
    id: "schedule-activity",
    title: "Agendar primeira atividade",
    href: "/activities",
    icon: <CalendarCheck className="h-4 w-4" />,
  },
  {
    id: "invite-member",
    title: "Convidar membro da equipe",
    href: "/settings/users",
    icon: <UserPlus className="h-4 w-4" />,
  },
  {
    id: "configure-pipeline",
    title: "Configurar pipeline",
    href: "/settings/pipeline",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: "explore-reports",
    title: "Explorar relatórios",
    href: "/reports",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

// ---------------------------------------------------------------------------
// Local Storage Keys
// ---------------------------------------------------------------------------

const CHECKLIST_KEY = "flow-onboarding-checklist";
const CHECKLIST_DISMISSED_KEY = "flow-onboarding-checklist-dismissed";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadCompletedItems(): Set<string> {
  try {
    const stored = localStorage.getItem(CHECKLIST_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

function saveCompletedItems(items: Set<string>) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(Array.from(items)));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingChecklist() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dismissed = localStorage.getItem(CHECKLIST_DISMISSED_KEY);
    startTransition(() => {
      setIsDismissed(dismissed === "true");
      setCompletedItems(loadCompletedItems());
    });
  }, []);

  const completedCount = completedItems.size;
  const totalCount = checklistItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleItem = useCallback(
    (itemId: string) => {
      setCompletedItems((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) {
          next.delete(itemId);
        } else {
          next.add(itemId);
        }
        saveCompletedItems(next);
        return next;
      });
    },
    []
  );

  const handleDismissForever = useCallback(() => {
    localStorage.setItem(CHECKLIST_DISMISSED_KEY, "true");
    setIsDismissed(true);
    setIsOpen(false);
  }, []);

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:block">
      {/* Expanded checklist card */}
      {isOpen && (
        <div className="mb-3 w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-[15px] border border-zinc-200 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <h3 className="font-heading text-sm font-semibold text-black">
                Primeiros passos
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Minimizar checklist"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-4 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-zinc-500">
                  {completedCount} de {totalCount} concluídos
                </span>
                <span className="font-heading text-xs font-semibold text-brand">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} className="mt-2 h-1.5" />
            </div>

            {/* Checklist items */}
            <div className="p-2 pt-3">
              {checklistItems.map((item) => {
                const isCompleted = completedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-zinc-50"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="shrink-0"
                      aria-label={
                        isCompleted
                          ? `Desmarcar: ${item.title}`
                          : `Marcar como concluído: ${item.title}`
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-status-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-300" />
                      )}
                    </button>

                    {/* Icon */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-status-success-light text-status-success"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {item.icon}
                    </div>

                    {/* Title as link */}
                    <a
                      href={item.href}
                      className={`flex-1 font-body text-sm transition-colors ${
                        isCompleted
                          ? "text-zinc-400 line-through"
                          : "text-zinc-700 hover:text-brand"
                      }`}
                    >
                      {item.title}
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-100 px-4 py-2.5 text-center">
              <button
                onClick={handleDismissForever}
                className="font-body text-xs text-zinc-400 transition-colors hover:text-zinc-600"
              >
                Fechar para sempre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-all hover:bg-brand/90 hover:shadow-xl"
        aria-label="Abrir checklist de onboarding"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <span className="font-heading text-xs font-bold">
            {completedCount}/{totalCount}
          </span>
        )}
      </button>
    </div>
  );
}
