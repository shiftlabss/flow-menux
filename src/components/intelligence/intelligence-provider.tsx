"use client";

// ============================================================================
// Menux Intelligence — Provider
// Componente raiz que renderiza FAB + Drawer + gerencia empilhamento
// Ref: docs/Menux Intelligence.md — seção 2.2.3 (empilhamento)
// Renderizado no (auth)/layout.tsx junto com GlobalDrawers
// ============================================================================

import { useEffect } from "react";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { canAccessIntelligence } from "@/lib/intelligence-permissions";
import { IntelligenceFAB } from "./intelligence-fab";
import { IntelligenceDrawer } from "./intelligence-drawer";

export function IntelligenceProvider() {
  const user = useAuthStore((s) => s.user);
  const hasAccess = user?.role ? canAccessIntelligence(user.role) : false;

  // Empilhamento: quando Intelligence abre, ajustar drawers de card — seção 2.2.3
  const intelligenceIsOpen = useIntelligenceStore((s) => s.isOpen);
  const cardDrawerType = useUIStore((s) => s.drawerType);

  useEffect(() => {
    // Injetar CSS custom property para o sistema de empilhamento
    const root = document.documentElement;

    if (intelligenceIsOpen) {
      root.style.setProperty("--intelligence-drawer-width", "480px");
      root.style.setProperty("--intelligence-open", "1");
    } else {
      root.style.setProperty("--intelligence-drawer-width", "0px");
      root.style.setProperty("--intelligence-open", "0");
    }

    return () => {
      root.style.removeProperty("--intelligence-drawer-width");
      root.style.removeProperty("--intelligence-open");
    };
  }, [intelligenceIsOpen]);

  // Reset de rate limit a cada hora
  useEffect(() => {
    const interval = setInterval(() => {
      const { rateLimitResetAt, resetRateLimit } =
        useIntelligenceStore.getState();
      if (rateLimitResetAt && new Date(rateLimitResetAt) <= new Date()) {
        resetRateLimit();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Não renderizar nada se o perfil não tem acesso — seção 11
  if (!hasAccess) return null;

  return (
    <>
      <IntelligenceFAB />
      <IntelligenceDrawer />
    </>
  );
}
