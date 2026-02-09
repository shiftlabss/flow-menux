"use client";

import Image from "next/image";
import { Menu, Search } from "lucide-react";
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

export function Header() {
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
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 md:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="text-zinc-600"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Image
          src="/flow-logo.svg"
          alt="Flow by Menux"
          width={120}
          height={32}
          priority
          className="h-8 w-auto"
        />

        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-zinc-400">/</span>
            <span className="font-body text-sm text-zinc-600">
              {breadcrumb}
            </span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Global Search */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className="text-zinc-600"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-brand text-xs font-medium text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-[15px]">
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
      </div>
    </header>
  );
}
