import { create } from "zustand";

export type UserRole = "master" | "admin" | "comercial" | "cs" | "leitura";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  unitId: string;
  unitName: string;
  isActive: boolean;
}

export interface Permission {
  canCreateOpportunity: boolean;
  canEditOpportunity: boolean;
  canDeleteOpportunity: boolean;
  canViewFinance: boolean;
  canEditFinance: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canApproveDiscounts: boolean;
  canManageGoals: boolean;
  canViewAllUnits: boolean;
}

const rolePermissions: Record<UserRole, Permission> = {
  master: {
    canCreateOpportunity: true,
    canEditOpportunity: true,
    canDeleteOpportunity: true,
    canViewFinance: true,
    canEditFinance: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewReports: true,
    canExportData: true,
    canApproveDiscounts: true,
    canManageGoals: true,
    canViewAllUnits: true,
  },
  admin: {
    canCreateOpportunity: true,
    canEditOpportunity: true,
    canDeleteOpportunity: true,
    canViewFinance: true,
    canEditFinance: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewReports: true,
    canExportData: true,
    canApproveDiscounts: true,
    canManageGoals: true,
    canViewAllUnits: false,
  },
  comercial: {
    canCreateOpportunity: true,
    canEditOpportunity: true,
    canDeleteOpportunity: false,
    canViewFinance: true,
    canEditFinance: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewReports: false,
    canExportData: false,
    canApproveDiscounts: false,
    canManageGoals: false,
    canViewAllUnits: false,
  },
  cs: {
    canCreateOpportunity: false,
    canEditOpportunity: true,
    canDeleteOpportunity: false,
    canViewFinance: false,
    canEditFinance: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewReports: false,
    canExportData: false,
    canApproveDiscounts: false,
    canManageGoals: false,
    canViewAllUnits: false,
  },
  leitura: {
    canCreateOpportunity: false,
    canEditOpportunity: false,
    canDeleteOpportunity: false,
    canViewFinance: false,
    canEditFinance: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewReports: false,
    canExportData: false,
    canApproveDiscounts: false,
    canManageGoals: false,
    canViewAllUnits: false,
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: Permission | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  permissions: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user, token) => {
    // Set cookie so middleware allows protected routes
    document.cookie = `flow-token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`;
    set({
      user,
      token,
      permissions: rolePermissions[user.role],
      isAuthenticated: true,
      isLoading: false,
    });
  },
  logout: () => {
    // Remove the auth cookie
    document.cookie = "flow-token=; path=/; max-age=0; SameSite=Lax; Secure";
    set({
      user: null,
      token: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
