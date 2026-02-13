// ============================================================================
// Menux Intelligence — Permissions Matrix
// Ref: docs/Menux Intelligence.md — seção 9
// ============================================================================

import type {
  IntelligencePermissions,
  UserRoleIntelligence,
} from "@/types/intelligence";

/**
 * Mapa completo de permissões da Intelligence por perfil.
 * Ref: seção 9.1 — Tabela de acesso por perfil.
 */
const permissionsMatrix: Record<
  UserRoleIntelligence | "leitura",
  IntelligencePermissions
> = {
  master: {
    canAccessIntelligence: true,
    canBriefingAllCards: true,
    canBriefingOwnCards: true,
    canViewAllFunnel: true,
    canViewOwnFunnel: true,
    canGhostwrite: true,
    canUseObjectionsAndPitch: true,
    canQueryMenuxBase: true,
    canViewOthersHistory: true,
    canReceiveProactiveSuggestions: true,
    canSelectAllClientsInPicker: true,
  },
  admin: {
    canAccessIntelligence: true,
    canBriefingAllCards: true,
    canBriefingOwnCards: true,
    canViewAllFunnel: true,
    canViewOwnFunnel: true,
    canGhostwrite: true,
    canUseObjectionsAndPitch: true,
    canQueryMenuxBase: true,
    canViewOthersHistory: false,
    canReceiveProactiveSuggestions: true,
    canSelectAllClientsInPicker: true,
  },
  comercial: {
    canAccessIntelligence: true,
    canBriefingAllCards: false,
    canBriefingOwnCards: true,
    canViewAllFunnel: false,
    canViewOwnFunnel: true,
    canGhostwrite: true,
    canUseObjectionsAndPitch: true,
    canQueryMenuxBase: true,
    canViewOthersHistory: false,
    canReceiveProactiveSuggestions: true,
    canSelectAllClientsInPicker: false,
  },
  cs: {
    canAccessIntelligence: true,
    canBriefingAllCards: false,
    canBriefingOwnCards: true,
    canViewAllFunnel: false,
    canViewOwnFunnel: true,
    canGhostwrite: true,
    canUseObjectionsAndPitch: true,
    canQueryMenuxBase: true,
    canViewOthersHistory: false,
    canReceiveProactiveSuggestions: true,
    canSelectAllClientsInPicker: false,
  },
  leitura: {
    canAccessIntelligence: false,
    canBriefingAllCards: false,
    canBriefingOwnCards: false,
    canViewAllFunnel: false,
    canViewOwnFunnel: false,
    canGhostwrite: false,
    canUseObjectionsAndPitch: false,
    canQueryMenuxBase: false,
    canViewOthersHistory: false,
    canReceiveProactiveSuggestions: false,
    canSelectAllClientsInPicker: false,
  },
};

/**
 * Retorna as permissões da Intelligence para um perfil.
 */
export function getIntelligencePermissions(
  role: UserRoleIntelligence | "leitura"
): IntelligencePermissions {
  return permissionsMatrix[role] ?? permissionsMatrix.leitura;
}

/**
 * Verifica se o perfil pode acessar a Intelligence.
 * Ref: seção 9.1 — Perfil "Leitura" NÃO pode acessar.
 * Ref: seção 11 — Vendedor perfil Leitura: FAB não aparece, atalho não funciona.
 */
export function canAccessIntelligence(
  role: string
): boolean {
  const perms = permissionsMatrix[role as keyof typeof permissionsMatrix];
  return perms?.canAccessIntelligence ?? false;
}
