"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { cn } from "@/lib/cn";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebarStore();
  const { setUser } = useAuthStore();
  const mainRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Handle scroll detection for sticky header state
  const handleScroll = () => {
    if (mainRef.current) {
      setIsScrolled(mainRef.current.scrollTop > 8);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden premium-mesh">
      {/* Sidebar - Fixed Left, Full Height */}
      <Sidebar />

      {/* Main Column - Flex Vertical */}
      <div
        className={cn(
          "flex flex-1 flex-col h-full relative transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "ml-0 md:ml-0" // Sidebar handles its own spacing via width interaction if needed, or we adapt layout
        )}
        style={{
          // If sidebar is 'fixed' inside, we might need margin. 
          // But simpler: Sidebar is a flex child? 
          // The current Sidebar component is 'fixed'. We need to align with that or change Sidebar code.
          // Let's assume we will refactor Sidebar to NOT be fixed-to-viewport but simply a block.
          // For now, let's keep Sidebar fixed logic in mind, so we add margin-left.
          marginLeft: isExpanded ? "15rem" : "4rem" // 60 (15rem) or 16 (4rem)
        }}
      >
        {/* Top Header - Sticky/Fixed at top of Main Column */}
        <Header isScrolled={isScrolled} />

        {/* Content Scroll Area */}
        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-24 md:pb-8 pt-[calc(72px+1.5rem)]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
