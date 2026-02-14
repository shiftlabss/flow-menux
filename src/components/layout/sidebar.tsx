"use client";

import { useEffect, useState, useCallback, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Kanban,
  Users,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";

// Simple useMediaQuery hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    startTransition(() => {
      setMatches(mql.matches);
    });

    function handleChange(e: MediaQueryListEvent) {
      startTransition(() => {
        setMatches(e.matches);
      });
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

const PENDING_ACTIVITIES_COUNT = 3;

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Atividades",
    href: "/activities",
    icon: CalendarCheck,
    badge: PENDING_ACTIVITIES_COUNT,
  },
  {
    label: "Pipes",
    href: "/pipes",
    icon: Kanban,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Financeiro",
    href: "/finance",
    icon: DollarSign,
    permission: "canViewFinance" as const,
  },
  {
    label: "Metas",
    href: "/goals",
    icon: Target,
    permission: "canManageGoals" as const,
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    permission: "canViewReports" as const,
  },
  {
    label: "Auditoria",
    href: "/audit",
    icon: ShieldCheck,
    permission: "canManageSettings" as const,
  },
  {
    label: "Configurações",
    href: "/settings/general",
    icon: Settings,
    permission: "canManageSettings" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebarStore();
  const { permissions } = useAuthStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    startTransition(() => {
      setIsMobileOpen(false);
    });
  }, [pathname]);

  // On mobile, sidebar open/close is managed by isMobileOpen
  // On desktop, it's managed by isExpanded from the store
  const handleToggle = useCallback(() => {
    if (isDesktop) {
      toggle();
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  }, [isDesktop, toggle]);

  // Expose toggle for header hamburger use
  useEffect(() => {
    if (!isDesktop) {
      // Sync: when sidebar store toggle is called on mobile, open mobile overlay
      // This is handled via the header's toggle call
    }
  }, [isDesktop]);

  const filteredItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (!permissions) return false;
    return permissions[item.permission];
  });

  const sidebarExpanded = isDesktop ? isExpanded : true;
  const sidebarVisible = isDesktop || isMobileOpen;

  // On mobile, listen for the sidebar store toggle to open overlay
  useEffect(() => {
    if (!isDesktop) {
      const unsub = useSidebarStore.subscribe((state, prev) => {
        if (state.isExpanded !== prev.isExpanded) {
          setIsMobileOpen((open) => !open);
        }
      });
      return unsub;
    }
  }, [isDesktop]);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {!isDesktop && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 flex h-[calc(100vh-64px)] flex-col border-r border-zinc-200 bg-white transition-[width,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isDesktop
            ? isExpanded
              ? "w-60"
              : "w-16"
            : "w-60",
          !isDesktop && !isMobileOpen && "-translate-x-full"
        )}
      >
        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const hasBadge = item.badge && item.badge > 0;

            const linkContent = (
              <Link
                href={item.href}
                onClick={() => {
                  if (!isDesktop) setIsMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-[15px] px-3 py-2.5 text-sm font-medium transition-colors duration-100",
                  isActive
                    ? "bg-zinc-100 text-black"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
                )}
              >
                <div className="relative shrink-0">
                  <Icon className="h-5 w-5" />
                  {hasBadge && !sidebarExpanded && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap font-body"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {hasBadge && sidebarExpanded && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-status-danger text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );

            if (!sidebarExpanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* Intelligence Button */}
        <div className="px-3 pb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/intelligence"
                className={cn(
                  "group flex items-center gap-3 rounded-[15px] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === "/intelligence"
                    ? "group relative flex items-center gap-3 overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-2.5 text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 dark:from-indigo-500 dark:to-violet-500"
                    : "bg-white text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600 border border-zinc-200 hover:border-indigo-100 hover:shadow-sm"
                )}
                onClick={() => {
                  if (!isDesktop) setIsMobileOpen(false);
                }}
              >
                <div className="relative shrink-0">
                  <Sparkles
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      pathname === "/intelligence" ? "text-white" : "text-indigo-500",
                      "group-hover:scale-110"
                    )}
                  />
                  {pathname === "/intelligence" && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-30"></span>
                  )}
                </div>
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap font-heading font-semibold"
                    >
                      Intelligence
                    </motion.span>
                  )}
                </AnimatePresence>

              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Menux Intelligence</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Collapse Toggle - only on desktop */}
        {isDesktop && (
          <div className="border-t border-zinc-200 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className={cn(
                "h-9 w-9 text-zinc-400 hover:text-zinc-600",
                isExpanded && "ml-auto"
              )}
            >
              {isExpanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
