"use client";

import { useEffect, useState, startTransition } from "react";
import { cn } from "@/lib/cn";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebarStore();
  const { setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Initialize auth store with Master role on mount (client-side only)
  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
    setUser(
      {
        id: "demo-user",
        name: "Usuário Demo",
        email: "demo@flow.com",
        role: "master",
        unitId: "unit-1",
        unitName: "Unidade Principal",
        isActive: true,
      },
      "demo-token"
    );
  }, [setUser]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Sidebar />
      <main
        className={cn(
          "mt-16 min-h-[calc(100vh-64px)] p-6 transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "ml-0 md:ml-16",
          isExpanded && "md:ml-60"
        )}
      >
        {children}
      </main>
    </div>
  );
}
