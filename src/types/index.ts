// ===== Pipeline / Kanban Types =====

export type PipelineStage =
  | "lead-in"
  | "contato-feito"
  | "reuniao-agendada"
  | "proposta-enviada"
  | "negociacao"
  | "fechamento";

export type Temperature = "hot" | "warm" | "cold";

export type OpportunityStatus =
  | "open"
  | "won"
  | "lost";

export interface Opportunity {
  id: string;
  title: string;
  clientName: string;
  clientId?: string;
  value: number;
  monthlyValue: number;
  stage: PipelineStage;
  temperature: Temperature;
  responsibleId: string;
  responsibleName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  expectedCloseDate?: string;
  status: OpportunityStatus;
  lossReason?: string;
  source?: string;
  notes?: string;
  slaDeadline?: string;
  neighborhood?: string;
  metadata?: Record<string, unknown>;
}

// ===== Client Types =====

export type ClientStage =
  | "onboarding"
  | "implantacao"
  | "acompanhamento"
  | "retencao"
  | "churn";

export type HealthScore = "good" | "warning" | "critical";

export interface Client {
  id: string;
  companyName: string;
  cnpj: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  stage: ClientStage;
  healthScore: HealthScore;
  monthlyRevenue: number;
  contractStart: string;
  contractEnd?: string;
  responsibleId: string;
  responsibleName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastInteraction?: string;
}

// ===== Activity Types =====

export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "visit"
  | "task"
  | "follow-up"
  | "whatsapp";

export type ActivityStatus = "pending" | "completed" | "overdue" | "cancelled";

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  description?: string;
  dueDate: string;
  dueTime?: string;
  responsibleId: string;
  responsibleName: string;
  opportunityId?: string;
  opportunityTitle?: string;
  clientId?: string;
  clientName?: string;
  completedAt?: string;
  createdAt: string;
}

// ===== Finance Types =====

export type CommissionStatus = "projected" | "confirmed" | "paid" | "contested";

export interface Commission {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  userId: string;
  userName: string;
  value: number;
  percentage: number;
  status: CommissionStatus;
  competenceMonth: string;
  paidAt?: string;
}

// ===== User Management Types =====

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: "master" | "admin" | "comercial" | "cs" | "leitura";
  isActive: boolean;
  avatar?: string;
  phone?: string;
  unitId: string;
  unitName: string;
  createdAt: string;
  lastLogin?: string;
}

// ===== Notification Types =====

export type NotificationType =
  | "sla-warning"
  | "sla-breach"
  | "activity-due"
  | "opportunity-won"
  | "opportunity-lost"
  | "client-health-drop"
  | "goal-achieved"
  | "mention"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ===== Dashboard Types =====

export interface DashboardMetrics {
  totalOpportunities: number;
  totalValue: number;
  conversionRate: number;
  averageTicket: number;
  activitiesDue: number;
  slaBreaches: number;
  newLeadsThisMonth: number;
  wonThisMonth: number;
}

// ===== Settings Types =====

export interface PipelineConfig {
  stages: {
    id: PipelineStage;
    label: string;
    requiredFields: string[];
    slaHours: number;
  }[];
}

export interface GoalConfig {
  id: string;
  type: "revenue" | "opportunities" | "conversion" | "activities";
  target: number;
  period: "monthly" | "quarterly";
  userId?: string;
  teamId?: string;
}

// ===== Audit Types =====

export interface AuditEvent {
  id: string;
  action: string;
  entity: "opportunity" | "client" | "activity" | "user" | "settings";
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

// ===== Approval Types =====

export interface ApprovalRequest {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  requesterId: string;
  requesterName: string;
  requestedDiscount: number;
  originalValue: number;
  justification: string;
  status: "pending" | "approved" | "rejected";
  approverId?: string;
  approverName?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ===== Unit Types =====

export interface Unit {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

// ===== Goal Types =====

export interface Goal {
  id: string;
  title: string;
  type: "revenue" | "opportunities" | "conversion" | "activities";
  target: number;
  current: number;
  period: "monthly" | "quarterly";
  startDate: string;
  endDate: string;
  userId?: string;
  userName?: string;
  teamId?: string;
}

// ===== Help & Onboarding Types =====

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  action?: string;
}

// ===== System Limits =====

export interface SystemLimit {
  key: string;
  label: string;
  currentUsage: number;
  maxAllowed: number;
  unit: string;
}

// ===== Filter State =====

export interface FilterState {
  responsible: string[];
  stage: string[];
  temperature: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  tags: string[];
  search: string;
}

// ===== Negotiation Types =====

export type NegotiationType = "proposal" | "counter" | "internal" | "agreement";

export type NegotiationStatus =
  | "none"
  | "negotiating"
  | "waiting_client"
  | "waiting_approval"
  | "agreed";

export interface NegotiationRound {
  id: string;
  type: NegotiationType;
  authorId: string;
  authorName: string;
  createdAt: string;
  // Values
  monthlyValue?: number;
  totalValue?: number;
  setupValue?: number;
  commissionValue?: number;
  termMonths?: number;
  discountPercentage?: number;
  // Conditions
  conditions: string[];
  details?: string;
  // Attachments
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: "pdf" | "image" | "link";
  }[];
  // Internal
  isFinal?: boolean;
  status?: "active" | "edited" | "superseded";
}

export interface NegotiationSummary {
  status: NegotiationStatus;
  lastRound?: NegotiationRound; // Latest round regardless of type
  lastInternalOffer?: NegotiationRound;
  lastClientCounter?: NegotiationRound;
  finalAgreement?: NegotiationRound;
}
