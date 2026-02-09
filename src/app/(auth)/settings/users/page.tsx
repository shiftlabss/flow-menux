"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  User,
  Eye,
  Headphones,
  Pencil,
  KeyRound,
  ArrowRightLeft,
  Palmtree,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUIStore } from "@/stores/ui-store";
import { useUserStore } from "@/stores/user-store";
import type { TeamUser } from "@/types";

const roleConfig: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  master: {
    label: "Master",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    className: "bg-brand-light text-brand",
  },
  admin: {
    label: "Admin",
    icon: <Shield className="h-3.5 w-3.5" />,
    className: "bg-zinc-100 text-zinc-700",
  },
  comercial: {
    label: "Comercial",
    icon: <User className="h-3.5 w-3.5" />,
    className: "bg-status-info-light text-status-info",
  },
  cs: {
    label: "CS",
    icon: <Headphones className="h-3.5 w-3.5" />,
    className: "bg-status-success-light text-status-success",
  },
  leitura: {
    label: "Leitura",
    icon: <Eye className="h-3.5 w-3.5" />,
    className: "bg-status-warning-light text-status-warning",
  },
};

// Local fallback data
const localMockUsers: TeamUser[] = [
  {
    id: "1",
    name: "Fernando Calado",
    email: "fernando@menux.com",
    role: "master",
    isActive: true,
    unitId: "1",
    unitName: "Matriz",
    createdAt: "2025-01-01",
    lastLogin: "2026-02-06",
  },
  {
    id: "2",
    name: "Maria Silva",
    email: "maria@menux.com",
    role: "admin",
    isActive: true,
    unitId: "1",
    unitName: "Matriz",
    createdAt: "2025-03-15",
    lastLogin: "2026-02-06",
  },
  {
    id: "3",
    name: "João Santos",
    email: "joao@menux.com",
    role: "comercial",
    isActive: true,
    unitId: "1",
    unitName: "Matriz",
    createdAt: "2025-06-01",
    lastLogin: "2026-02-05",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana@menux.com",
    role: "cs",
    isActive: true,
    unitId: "1",
    unitName: "Matriz",
    createdAt: "2025-08-01",
    lastLogin: "2026-02-04",
  },
  {
    id: "5",
    name: "Pedro Oliveira",
    email: "pedro@menux.com",
    role: "leitura",
    isActive: false,
    unitId: "2",
    unitName: "Filial SP",
    createdAt: "2025-10-01",
    lastLogin: "2026-01-15",
  },
  {
    id: "6",
    name: "Camila Rocha",
    email: "camila@menux.com",
    role: "comercial",
    isActive: true,
    unitId: "2",
    unitName: "Filial SP",
    createdAt: "2025-11-01",
    lastLogin: "2026-02-03",
  },
];

type StatusFilter = "todos" | "ativos" | "inativos";

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const { openModal } = useUIStore();
  const { users: storeUsers } = useUserStore();

  // Use store users if available, otherwise local mock
  const allUsers = storeUsers.length > 0 ? storeUsers : localMockUsers;

  // Filter users
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "todos" || u.role === roleFilter;

    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "ativos" && u.isActive) ||
      (statusFilter === "inativos" && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalUsers);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
            Gestão de Usuários
          </h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Gerencie os membros da sua equipe
          </p>
        </div>
        <Button
          onClick={() => openModal("invite-user")}
          className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-[15px] pl-10 font-body text-sm"
          />
        </div>

        {/* Role Filter */}
        <Select
          value={roleFilter}
          onValueChange={(val) => {
            setRoleFilter(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-40 rounded-[15px] font-body text-sm">
            <SelectValue placeholder="Filtrar por papel" />
          </SelectTrigger>
          <SelectContent className="rounded-[15px]">
            <SelectItem value="todos">Todos os papéis</SelectItem>
            <SelectItem value="master">Master</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="comercial">Comercial</SelectItem>
            <SelectItem value="cs">CS</SelectItem>
            <SelectItem value="leitura">Leitura</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter Toggle */}
        <div className="flex items-center rounded-[15px] border border-zinc-200 p-0.5">
          {(["todos", "ativos", "inativos"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`rounded-[12px] px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-black text-white"
                  : "text-zinc-500 hover:text-black"
              }`}
            >
              {status === "todos"
                ? "Todos"
                : status === "ativos"
                  ? "Ativos"
                  : "Inativos"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="rounded-[15px] border-zinc-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-100 bg-zinc-50">
                <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                  Usuário
                </TableHead>
                <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                  Papel
                </TableHead>
                <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                  Unidade
                </TableHead>
                <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                  Status
                </TableHead>
                <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                  Último acesso
                </TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const role = roleConfig[user.role];
                const initials = user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <TableRow
                    key={user.id}
                    className="h-[52px] border-zinc-100"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-zinc-100 font-body text-xs text-zinc-600">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-body text-sm font-medium text-black">
                            {user.name}
                          </p>
                          <p className="font-body text-xs text-zinc-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`gap-1 rounded-[10px] font-body text-xs ${role.className}`}
                      >
                        {role.icon}
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-sm text-zinc-600">
                      {user.unitName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-[10px] font-body text-xs ${
                          user.isActive
                            ? "bg-status-success-light text-status-success"
                            : "bg-status-danger-light text-status-danger"
                        }`}
                      >
                        {user.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-sm text-zinc-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("pt-BR")
                        : "--"}
                    </TableCell>
                    <TableCell>
                      <UserActionsMenu user={user} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center font-body text-sm text-zinc-400"
                  >
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-zinc-500">
          Mostrando {totalUsers > 0 ? startIndex + 1 : 0}-{endIndex} de{" "}
          {totalUsers} usuários
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-full font-heading text-xs"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          <span className="font-body text-sm text-zinc-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full font-heading text-xs"
          >
            Próxima
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== User Actions Dropdown =====

function UserActionsMenu({ user }: { user: TeamUser }) {
  const { updateUser, deactivateUser, activateUser } = useUserStore();

  const handleEdit = () => {
    toast.info(`Edição de ${user.name}`, {
      description: "Funcionalidade de edição completa disponível em breve.",
    });
  };

  const handleChangeRole = () => {
    // Cycle through roles for demo: comercial → cs → admin → comercial
    const roleOrder: TeamUser["role"][] = ["comercial", "cs", "admin", "leitura"];
    const currentIdx = roleOrder.indexOf(user.role);
    const nextRole = roleOrder[(currentIdx + 1) % roleOrder.length];
    const roleLabels: Record<string, string> = { admin: "Admin", comercial: "Comercial", cs: "CS", leitura: "Leitura", master: "Master" };

    if (user.role === "master") {
      toast.error("Não é possível alterar o papel do usuário Master.");
      return;
    }

    updateUser(user.id, { role: nextRole });
    toast.success(`Papel alterado para ${roleLabels[nextRole]}`, {
      description: `${user.name} agora é ${roleLabels[nextRole]}.`,
    });
  };

  const handleResetPassword = () => {
    toast.success("Link de redefinição enviado!", {
      description: `Um e-mail foi enviado para ${user.email} com instruções para redefinir a senha.`,
    });
  };

  const handleTransferCards = () => {
    toast.info("Transferência de cards", {
      description: `Funcionalidade de transferência para ${user.name} disponível em breve.`,
    });
  };

  const handleMarkVacation = () => {
    toast.success("Férias registradas!", {
      description: `${user.name} foi marcado em férias.`,
    });
  };

  const handleToggleStatus = () => {
    if (user.isActive) {
      deactivateUser(user.id);
      toast.success(`${user.name} foi desativado`, {
        description: "O usuário não poderá mais acessar o sistema.",
      });
    } else {
      activateUser(user.id);
      toast.success(`${user.name} foi reativado`, {
        description: "O usuário pode acessar o sistema novamente.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-[15px]">
        <DropdownMenuItem
          onClick={handleEdit}
          className="cursor-pointer font-body text-sm"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleChangeRole}
          className="cursor-pointer font-body text-sm"
        >
          <Shield className="mr-2 h-4 w-4" />
          Alterar papel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleResetPassword}
          className="cursor-pointer font-body text-sm"
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Resetar senha
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleTransferCards}
          className="cursor-pointer font-body text-sm"
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Transferir cards
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleMarkVacation}
          className="cursor-pointer font-body text-sm"
        >
          <Palmtree className="mr-2 h-4 w-4" />
          Marcar férias
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleStatus}
          className={`cursor-pointer font-body text-sm ${
            user.isActive ? "text-status-danger" : "text-status-success"
          }`}
        >
          {user.isActive ? (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Desativar
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Reativar
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
