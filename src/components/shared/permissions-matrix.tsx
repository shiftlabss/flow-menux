"use client";

import { useState, useCallback } from "react";
import { Save } from "lucide-react";
import { type UserRole, type Permission } from "@/stores/auth-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ── Permission labels (PT-BR) ──────────────────────────────────────
const permissionLabels: Record<keyof Permission, string> = {
  canCreateOpportunity: "Criar oportunidades",
  canEditOpportunity: "Editar oportunidades",
  canDeleteOpportunity: "Excluir oportunidades",
  canViewFinance: "Visualizar financeiro",
  canEditFinance: "Editar financeiro",
  canManageUsers: "Gerenciar usuários",
  canManageSettings: "Gerenciar configurações",
  canViewReports: "Visualizar relatórios",
  canExportData: "Exportar dados",
  canApproveDiscounts: "Aprovar descontos",
  canManageGoals: "Gerenciar metas",
  canViewAllUnits: "Visualizar todas as unidades",
};

// ── Roles ──────────────────────────────────────────────────────────
const roles: { key: UserRole; label: string }[] = [
  { key: "master", label: "Master" },
  { key: "admin", label: "Admin" },
  { key: "comercial", label: "Comercial" },
  { key: "cs", label: "CS" },
  { key: "leitura", label: "Leitura" },
];

const permissionKeys = Object.keys(permissionLabels) as (keyof Permission)[];

// ── Default permissions per role (mock) ────────────────────────────
const defaultPermissions: Record<UserRole, Permission> = {
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

// ── Component ──────────────────────────────────────────────────────
export function PermissionsMatrix() {
  const [permissions, setPermissions] =
    useState<Record<UserRole, Permission>>(defaultPermissions);

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = useCallback(
    (role: UserRole, permission: keyof Permission) => {
      // Master permissions cannot be changed
      if (role === "master") return;

      setPermissions((prev) => ({
        ...prev,
        [role]: {
          ...prev[role],
          [permission]: !prev[role][permission],
        },
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  }, []);

  return (
    <Card className="rounded-[15px]">
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Matriz de permissões
        </CardTitle>
        <CardDescription className="font-body">
          Configure as permissões de cada perfil de acesso
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-heading text-xs min-w-[200px]">
                  Permissão
                </TableHead>
                {roles.map((role) => (
                  <TableHead
                    key={role.key}
                    className="font-heading text-xs text-center min-w-[90px]"
                  >
                    {role.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {permissionKeys.map((permKey) => (
                <TableRow key={permKey}>
                  <TableCell className="font-body text-sm text-zinc-700">
                    {permissionLabels[permKey]}
                  </TableCell>

                  {roles.map((role) => {
                    const isChecked = permissions[role.key][permKey];
                    const isMaster = role.key === "master";

                    return (
                      <TableCell key={role.key} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isChecked}
                            disabled={isMaster}
                            onCheckedChange={() =>
                              handleToggle(role.key, permKey)
                            }
                            className={cn(
                              isMaster && "opacity-60 cursor-not-allowed"
                            )}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-black text-white hover:bg-zinc-800 rounded-full font-heading"
          >
            <Save className="size-4" />
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
