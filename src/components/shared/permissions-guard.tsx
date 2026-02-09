"use client";

import { ReactNode } from "react";
import { ShieldX } from "lucide-react";
import { useAuthStore, type Permission } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";

// ── Default fallback ───────────────────────────────────────────────
function NoPermissionCard() {
  return (
    <Card className="rounded-[15px] border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10">
        <div className="flex items-center justify-center size-12 rounded-full bg-zinc-100">
          <ShieldX className="size-6 text-zinc-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-heading text-sm font-semibold text-zinc-700">
            Sem permissão
          </p>
          <p className="font-body text-xs text-zinc-500">
            Você não tem permissão para acessar este recurso.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Props ──────────────────────────────────────────────────────────
interface PermissionsGuardProps {
  /** The permission key to check from the auth store */
  permission: keyof Permission;
  /** Content to render when user has the permission */
  children: ReactNode;
  /** Optional fallback when user lacks permission (defaults to NoPermissionCard) */
  fallback?: ReactNode;
}

// ── Component ──────────────────────────────────────────────────────
export function PermissionsGuard({
  permission,
  children,
  fallback,
}: PermissionsGuardProps) {
  const permissions = useAuthStore((state) => state.permissions);

  // If permissions haven't loaded yet, render nothing
  if (!permissions) return null;

  // Check if the user has the required permission
  if (permissions[permission]) {
    return <>{children}</>;
  }

  // Render fallback or default "no permission" card
  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return <NoPermissionCard />;
}
