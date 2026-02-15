"use client";

import { cn } from "@/lib/cn";

import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useRouter, usePathname } from "next/navigation";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { transition } from "@/lib/motion";

interface HeaderProps {
  isScrolled?: boolean;
}

export function Header({ isScrolled = false }: HeaderProps) {
  const { toggle } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { setSearchOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  const breadcrumbMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/activities": "Atividades",
    "/pipes": "Pipeline",
    "/clients": "Clientes",
    "/finance": "Financeiro",
    "/goals": "Metas",
    "/reports": "Relatórios",
    "/audit": "Auditoria",
  };

  function getBreadcrumb(): string | null {
    if (pathname.startsWith("/settings")) {
      const settingsTabMap: Record<string, string> = {
        general: "Geral",
        pipeline: "Pipeline",
        users: "Usuários",
        goals: "Metas",
        profile: "Perfil",
        integrations: "Integrações",
        billing: "Assinatura",
      };
      const segments = pathname.split("/");
      const tab = segments[2];
      const tabLabel = tab ? settingsTabMap[tab] || tab : "Geral";
      return `Configurações > ${tabLabel}`;
    }
    for (const [path, label] of Object.entries(breadcrumbMap)) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return label;
      }
    }
    return null;
  }

  const breadcrumb = getBreadcrumb();

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "FL";

  return (
    <header
      className={cn(
        "absolute left-0 right-0 top-0 z-50 h-[72px] px-6 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        // Sticky/Scrolled State
        isScrolled
          ? "bg-white/95 shadow-sm backdrop-blur-md"
          : "bg-transparent backdrop-blur-none"
      )}
    >
      <div className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand/35 to-transparent transition-opacity duration-300",
        isScrolled ? "opacity-100" : "opacity-0"
      )} />

      {/* Subtle top gradient - always visible or hidden on scroll? 
          User said: "background +4%" contrast on scroll. 
          Let's keep the gradient but maybe fade it out if it clashes. 
          For now preserve existing gradients.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-r from-brand/8 via-transparent to-cyan-500/8 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition.panel}
        className="flex h-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="premium-shine text-zinc-600 hover:bg-zinc-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Image
            src="/flow-logo.svg"
            alt="Flow by Menux"
            width={120}
            height={32}
            priority
            className="h-8 w-auto drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]"
          />

          <div className="hidden items-center md:flex">
            <AnimatePresence mode="wait">
              {breadcrumb && (
                <motion.span
                  key={breadcrumb}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={transition.smooth}
                  className="rounded-full border border-zinc-200/80 bg-zinc-50/80 px-3 py-1 font-body text-sm text-zinc-600"
                >
                  {breadcrumb}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transition.panel, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="premium-shine text-zinc-600 hover:bg-zinc-100"
          >
            <Search className="h-5 w-5" />
          </Button>

          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="premium-shine rounded-full ring-1 ring-zinc-200/70 transition-all hover:ring-brand/30"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-brand text-xs font-medium text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-[15px] premium-panel">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-black">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-zinc-500">
                  {user?.email || "email@menux.com"}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/general")}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-status-danger"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.div>
    </header>
  );
}
