"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Percent,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { ApprovalRequest } from "@/types";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: "apr-1",
    opportunityId: "opp-1",
    opportunityTitle: "Restaurante Bela Vista",
    requesterId: "user-2",
    requesterName: "Carlos Lima",
    requestedDiscount: 15,
    originalValue: 12000,
    justification:
      "Cliente estratégico com potencial de expansão para mais 3 unidades. Desconto necessário para fechar contrato de 12 meses.",
    status: "pending",
    createdAt: "2026-02-05T14:30:00Z",
  },
  {
    id: "apr-2",
    opportunityId: "opp-3",
    opportunityTitle: "Hotel Sunset",
    requesterId: "user-3",
    requesterName: "Fernanda Reis",
    requestedDiscount: 20,
    originalValue: 36000,
    justification:
      "Concorrente ofereceu preço 25% menor. Desconto de 20% mantém margem aceitável e garante conta.",
    status: "approved",
    approverId: "user-1",
    approverName: "Ana Souza",
    resolvedAt: "2026-02-04T10:15:00Z",
    createdAt: "2026-02-03T09:00:00Z",
  },
  {
    id: "apr-3",
    opportunityId: "opp-5",
    opportunityTitle: "Pousada Mar Azul",
    requesterId: "user-4",
    requesterName: "Pedro Alves",
    requestedDiscount: 30,
    originalValue: 24000,
    justification: "Cliente solicitou desconto agressivo para fechar imediatamente.",
    status: "rejected",
    approverId: "user-1",
    approverName: "Ana Souza",
    resolvedAt: "2026-02-04T16:45:00Z",
    createdAt: "2026-02-04T11:20:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "text-status-warning",
    bgColor: "bg-status-warning-light",
    borderColor: "border-status-warning/30",
    icon: <Clock className="h-4 w-4" />,
  },
  approved: {
    label: "Aprovado",
    color: "text-status-success",
    bgColor: "bg-status-success-light",
    borderColor: "border-status-success/30",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  rejected: {
    label: "Rejeitado",
    color: "text-status-danger",
    bgColor: "bg-status-danger-light",
    borderColor: "border-status-danger/30",
    icon: <XCircle className="h-4 w-4" />,
  },
};

// ---------------------------------------------------------------------------
// Discount Threshold
// ---------------------------------------------------------------------------

const DISCOUNT_THRESHOLD = 10;

// ---------------------------------------------------------------------------
// ApprovalRequestCard — single request display
// ---------------------------------------------------------------------------

function ApprovalRequestCard({
  request,
  isAdmin,
  onApprove,
  onReject,
}: {
  request: ApprovalRequest;
  isAdmin: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const config = statusConfig[request.status];
  const discountedValue =
    request.originalValue * (1 - request.requestedDiscount / 100);

  return (
    <div
      className={`rounded-[15px] border p-4 transition-colors ${config.borderColor} ${
        request.status === "pending" ? config.bgColor : "bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-brand-light text-xs font-medium text-brand">
              {getInitials(request.requesterName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-body text-sm font-medium text-black">
              {request.requesterName}
            </p>
            <p className="font-body text-xs text-zinc-500">
              {formatDate(request.createdAt)}
            </p>
          </div>
        </div>
        <Badge
          className={`rounded-[10px] font-body text-xs ${config.bgColor} ${config.color} border-0`}
        >
          <span className="mr-1">{config.icon}</span>
          {config.label}
        </Badge>
      </div>

      {/* Opportunity info */}
      <div className="mt-3 rounded-[10px] bg-zinc-50 p-3">
        <p className="font-body text-xs text-zinc-500">Oportunidade</p>
        <p className="font-heading text-sm font-semibold text-black">
          {request.opportunityTitle}
        </p>
      </div>

      {/* Discount details */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-[10px] bg-zinc-50 p-3 text-center">
          <p className="font-body text-xs text-zinc-500">Valor Original</p>
          <p className="font-heading text-sm font-bold text-black">
            {formatCurrency(request.originalValue)}
          </p>
        </div>
        <div
          className={`rounded-[10px] p-3 text-center ${
            request.requestedDiscount > 20
              ? "bg-status-danger-light"
              : "bg-status-warning-light"
          }`}
        >
          <p className="font-body text-xs text-zinc-500">Desconto</p>
          <p
            className={`font-heading text-sm font-bold ${
              request.requestedDiscount > 20
                ? "text-status-danger"
                : "text-status-warning"
            }`}
          >
            {request.requestedDiscount}%
          </p>
        </div>
        <div className="rounded-[10px] bg-status-success-light p-3 text-center">
          <p className="font-body text-xs text-zinc-500">Valor Final</p>
          <p className="font-heading text-sm font-bold text-status-success">
            {formatCurrency(discountedValue)}
          </p>
        </div>
      </div>

      {/* Justification */}
      <div className="mt-3">
        <p className="font-body text-xs font-medium text-zinc-500">
          Justificativa
        </p>
        <p className="mt-1 font-body text-sm text-zinc-700">
          {request.justification}
        </p>
      </div>

      {/* Resolver info (for approved/rejected) */}
      {request.status !== "pending" && request.approverName && (
        <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-zinc-50 p-3">
          <span className={config.color}>{config.icon}</span>
          <p className="font-body text-xs text-zinc-600">
            {request.status === "approved" ? "Aprovado" : "Rejeitado"} por{" "}
            <span className="font-medium text-black">
              {request.approverName}
            </span>{" "}
            em {request.resolvedAt && formatDate(request.resolvedAt)}
          </p>
        </div>
      )}

      {/* Admin actions for pending */}
      {isAdmin && request.status === "pending" && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            onClick={() => onApprove?.(request.id)}
            className="flex-1 rounded-full bg-status-success font-heading text-sm text-white hover:bg-status-success/90"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Aprovar
          </Button>
          <Button
            onClick={() => onReject?.(request.id)}
            variant="outline"
            className="flex-1 rounded-full border-status-danger font-heading text-sm text-status-danger hover:bg-status-danger-light"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeitar
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NewApprovalForm — request a new approval
// ---------------------------------------------------------------------------

function NewApprovalForm({
  discount,
  originalValue,
  opportunityTitle,
  onSubmit,
}: {
  discount: number;
  originalValue: number;
  opportunityTitle: string;
  onSubmit: (justification: string) => void;
}) {
  const [justification, setJustification] = useState("");
  const discountedValue = originalValue * (1 - discount / 100);

  return (
    <Card className="rounded-[15px] border-status-warning/30 bg-status-warning-light">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-warning/20">
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </div>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Aprovacao Necessaria
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-body text-sm text-zinc-700">
          O desconto de{" "}
          <span className="font-semibold text-status-warning">{discount}%</span>{" "}
          para{" "}
          <span className="font-semibold text-black">{opportunityTitle}</span>{" "}
          excede o limite de {DISCOUNT_THRESHOLD}% e requer aprovacao gerencial.
        </p>

        {/* Value breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[10px] bg-white p-3 text-center">
            <p className="font-body text-xs text-zinc-500">Original</p>
            <p className="font-heading text-sm font-bold text-black">
              {formatCurrency(originalValue)}
            </p>
          </div>
          <div className="rounded-[10px] bg-white p-3 text-center">
            <p className="font-body text-xs text-zinc-500">Desconto</p>
            <div className="flex items-center justify-center gap-1">
              <Percent className="h-3 w-3 text-status-warning" />
              <p className="font-heading text-sm font-bold text-status-warning">
                {discount}%
              </p>
            </div>
          </div>
          <div className="rounded-[10px] bg-white p-3 text-center">
            <p className="font-body text-xs text-zinc-500">Valor Final</p>
            <p className="font-heading text-sm font-bold text-status-success">
              {formatCurrency(discountedValue)}
            </p>
          </div>
        </div>

        {/* Justification */}
        <div>
          <label className="mb-1.5 block font-body text-sm font-medium text-zinc-700">
            Justificativa
          </label>
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Descreva o motivo do desconto..."
            className="min-h-[80px] rounded-[15px] border-zinc-200 bg-white font-body text-sm"
          />
        </div>

        <Button
          onClick={() => onSubmit(justification)}
          disabled={justification.trim().length === 0}
          className="w-full rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
        >
          <Send className="mr-2 h-4 w-4" />
          Solicitar Aprovacao
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ApprovalWorkflow — main exported component
// ---------------------------------------------------------------------------

interface ApprovalWorkflowProps {
  /** If true, shows admin view with approve/reject buttons */
  isAdmin?: boolean;
  /** If provided, shows the new approval form for this discount */
  pendingDiscount?: {
    discount: number;
    originalValue: number;
    opportunityTitle: string;
  };
}

export function ApprovalWorkflow({
  isAdmin = false,
  pendingDiscount,
}: ApprovalWorkflowProps) {
  const [requests, setRequests] =
    useState<ApprovalRequest[]>(mockApprovalRequests);
  const [showForm, setShowForm] = useState(!!pendingDiscount);
  const [submitted, setSubmitted] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status !== "pending");

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved" as const,
              approverId: "user-1",
              approverName: "Ana Souza",
              resolvedAt: new Date().toISOString(),
            }
          : r
      )
    );
  }

  function handleReject(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "rejected" as const,
              approverId: "user-1",
              approverName: "Ana Souza",
              resolvedAt: new Date().toISOString(),
            }
          : r
      )
    );
  }

  function handleSubmitApproval(justification: string) {
    if (!pendingDiscount) return;
    const newRequest: ApprovalRequest = {
      id: `apr-${Date.now()}`,
      opportunityId: "opp-new",
      opportunityTitle: pendingDiscount.opportunityTitle,
      requesterId: "user-current",
      requesterName: "Voce",
      requestedDiscount: pendingDiscount.discount,
      originalValue: pendingDiscount.originalValue,
      justification,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newRequest, ...prev]);
    setShowForm(false);
    setSubmitted(true);
  }

  return (
    <div className="space-y-6">
      {/* New approval form (shown in drawer/pipe context) */}
      {showForm && pendingDiscount && !submitted && (
        <NewApprovalForm
          discount={pendingDiscount.discount}
          originalValue={pendingDiscount.originalValue}
          opportunityTitle={pendingDiscount.opportunityTitle}
          onSubmit={handleSubmitApproval}
        />
      )}

      {/* Success message after submission */}
      {submitted && (
        <Card className="rounded-[15px] border-status-success/30 bg-status-success-light">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-status-success" />
            <div>
              <p className="font-heading text-sm font-semibold text-status-success">
                Solicitacao enviada com sucesso
              </p>
              <p className="font-body text-xs text-zinc-600">
                Voce sera notificado quando a aprovacao for processada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin: Pending approvals */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="font-heading text-lg font-semibold text-black">
              Aprovacoes Pendentes
            </h3>
            <Badge className="rounded-[10px] bg-status-warning-light font-body text-xs text-status-warning border-0">
              {pendingRequests.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <ApprovalRequestCard
                key={request.id}
                request={request}
                isAdmin={isAdmin}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Separator between sections */}
      {isAdmin && pendingRequests.length > 0 && resolvedRequests.length > 0 && (
        <Separator />
      )}

      {/* All requests history */}
      {resolvedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-black">
            Historico de Aprovacoes
          </h3>
          <div className="space-y-3">
            {resolvedRequests.map((request) => (
              <ApprovalRequestCard
                key={request.id}
                request={request}
                isAdmin={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Non-admin: all requests */}
      {!isAdmin && pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-black">
            Minhas Solicitacoes
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <ApprovalRequestCard
                key={request.id}
                request={request}
                isAdmin={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
