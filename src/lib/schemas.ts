import { z } from "zod";
import { isValidPhone, isValidCnpj, onlyDigits } from "@/lib/masks";

// ===== Validadores Zod customizados =====

const phoneValidator = z
  .string()
  .optional()
  .refine(
    (val) => !val || val.length === 0 || isValidPhone(val),
    { message: "Telefone inválido" }
  );

const cnpjValidator = z
  .string()
  .refine(
    (val) => {
      const digits = onlyDigits(val);
      return digits.length === 14 && isValidCnpj(digits);
    },
    { message: "CNPJ inválido" }
  );

const passwordStrong = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial");

// ===== Auth Schemas =====

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordStrong,
    confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const activateAccountSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    phone: phoneValidator,
    password: passwordStrong,
    confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ActivateAccountFormData = z.infer<typeof activateAccountSchema>;

// ===== Opportunity Schemas =====

export const newOpportunitySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  clientName: z.string().min(1, "Nome do cliente é obrigatório"),
  value: z.number().min(0, "Valor não pode ser negativo"),
  monthlyValue: z.number().min(0, "Valor mensal não pode ser negativo"),
  source: z.string().optional(),
  temperature: z.enum(["hot", "warm", "cold"]),
  responsibleId: z.string().min(1, "Responsável é obrigatório"),
  expectedCloseDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type NewOpportunityFormData = z.infer<typeof newOpportunitySchema>;

// ===== Activity Schemas =====

export const newActivitySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  type: z.enum(["call", "email", "meeting", "visit", "task", "follow-up", "whatsapp"]),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Data é obrigatória"),
  dueTime: z.string().optional(),
  responsibleId: z.string().min(1, "Responsável é obrigatório"),
  opportunityId: z.string().optional(),
  clientId: z.string().optional(),
});

export type NewActivityFormData = z.infer<typeof newActivitySchema>;

// ===== Client Schemas =====

export const clientSchema = z.object({
  companyName: z.string().min(1, "Razão social é obrigatória"),
  cnpj: cnpjValidator,
  contactName: z.string().min(1, "Nome do contato é obrigatório"),
  contactEmail: z.string().email("E-mail inválido"),
  contactPhone: phoneValidator,
  monthlyRevenue: z.number().min(0),
  tags: z.array(z.string()).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ===== User Management Schemas =====

export const inviteUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "comercial", "cs", "leitura"]),
  unitId: z.string().min(1, "Unidade é obrigatória"),
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;

// ===== Win/Loss Schemas =====

export const winOpportunitySchema = z.object({
  contractValue: z.number().min(0.01, "Valor do contrato é obrigatório"),
  monthlyValue: z.number().min(0.01, "Valor mensal é obrigatório"),
  contractStart: z.string().min(1, "Data de início é obrigatória"),
  contractMonths: z.number().min(1, "Prazo é obrigatório"),
  notes: z.string().optional(),
});

export type WinOpportunityFormData = z.infer<typeof winOpportunitySchema>;

export const loseOpportunitySchema = z.object({
  reason: z.string().min(1, "Motivo da perda é obrigatório"),
  competitor: z.string().optional(),
  notes: z.string().optional(),
});

export type LoseOpportunityFormData = z.infer<typeof loseOpportunitySchema>;

// ===== Settings Schemas =====

export const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: phoneValidator,
  avatar: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: passwordStrong,
    confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ===== Card Company Schema =====

export const cardCompanySchema = z.object({
  cnpj: cnpjValidator,
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  fantasia: z.string().min(1, "Nome fantasia é obrigatório"),
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  telefone: phoneValidator,
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  site: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CardCompanyFormData = z.infer<typeof cardCompanySchema>;

// ===== Contact Schema =====

export const contactSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: phoneValidator,
  cargo: z.string().optional(),
  isPrimary: z.boolean(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ===== Card Values Schema =====

export const cardValuesSchema = z.object({
  valorTotal: z
    .number()
    .min(0.01, "Valor total é obrigatório"),
  valorMensal: z
    .number()
    .min(0.01, "Valor mensal é obrigatório"),
  dataPrevistaFechamento: z
    .string()
    .min(1, "Data prevista de fechamento é obrigatória"),
});

export type CardValuesFormData = z.infer<typeof cardValuesSchema>;

// ===== Stage Change Schema =====

export const stageChangeSchema = z.object({
  toStage: z.enum([
    "lead-in",
    "contato-feito",
    "reuniao-agendada",
    "proposta-enviada",
    "negociacao",
    "fechamento",
  ]),
  requiredFields: z.object({
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    meetingDate: z.string().optional(),
    proposalValue: z.number().optional(),
    contractValue: z.number().optional(),
    notes: z.string().optional(),
  }),
});

export type StageChangeFormData = z.infer<typeof stageChangeSchema>;

// ===== Goal Schema =====

export const goalSchema = z.object({
  type: z.enum(["revenue", "opportunities", "conversion", "activities"]),
  target: z.number().min(1, "Meta deve ser maior que zero"),
  period: z.enum(["monthly", "quarterly"]),
  userId: z.string().optional(),
  teamId: z.string().optional(),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// ===== Approval Schema =====

export const approvalSchema = z.object({
  opportunityId: z.string().min(1, "Oportunidade é obrigatória"),
  requestedDiscount: z
    .number()
    .min(0.01, "Desconto deve ser maior que zero")
    .max(100, "Desconto não pode ultrapassar 100%"),
  justification: z
    .string()
    .min(10, "Justificativa deve ter no mínimo 10 caracteres"),
});

export type ApprovalFormData = z.infer<typeof approvalSchema>;

// ===== Filter Schema =====

export const filterSchema = z.object({
  responsible: z.string().optional(),
  stage: z.string().optional(),
  temperature: z.enum(["hot", "warm", "cold"]).optional(),
  dateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});

export type FilterFormData = z.infer<typeof filterSchema>;
