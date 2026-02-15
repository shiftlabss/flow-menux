"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarCheck,
  Kanban,
  Users,
  MoreHorizontal,
  DollarSign,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ── Nav item type ──────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  matchPrefix?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Atividades", href: "/activities", icon: CalendarCheck },
  { label: "Pipeline", href: "/pipes", icon: Kanban },
  { label: "Clientes", href: "/clients", icon: Users },
];

const moreNavItems: NavItem[] = [
  { label: "Financeiro", href: "/finance", icon: DollarSign },
  {
    label: "Configurações",
    href: "/settings/general",
    matchPrefix: "/settings",
    icon: Settings,
  },
  { label: "Intelligence", href: "/intelligence", icon: Sparkles },
];

// ── Mobile Bottom Nav ──────────────────────────────────────────────
export function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isActive = (item: NavItem) => {
    const target = item.matchPrefix ?? item.href;
    return pathname.startsWith(target);
  };

  const isMoreActive = moreNavItems.some((item) => isActive(item));

  return (
    <>
      {/* Bottom nav bar - visible only on mobile (below md breakpoint) */}
      <nav className="premium-grain fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-zinc-200/75 bg-white/90 backdrop-blur-xl md:hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/35 to-transparent" />
        <div className="flex items-center justify-around h-full px-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "premium-shine flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                  active
                    ? "bg-brand/10 text-brand-strong"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-heading font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* "Mais" button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "premium-shine flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-colors",
              isMoreActive
                ? "bg-brand/10 text-brand-strong"
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <MoreHorizontal className="size-5" />
            <span className="text-[10px] font-heading font-medium">Mais</span>
          </button>
        </div>
      </nav>

      {/* "Mais" Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-[15px] premium-panel">
          <SheetHeader>
            <SheetTitle className="font-heading">Mais opções</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-1 py-2">
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-[10px] transition-colors",
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="font-body text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Separator */}
            <div className="h-px bg-zinc-200 my-2" />

            {/* Sair */}
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-status-danger hover:bg-status-danger-light transition-colors"
              onClick={() => {
                setIsMoreOpen(false);
                // logout handler would go here
              }}
            >
              <LogOut className="size-5" />
              <span className="font-body text-sm font-medium">Sair</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
