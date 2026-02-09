// ============================================================================
// Máscaras e Validadores — Flow CRM
// Funções puras para formatação, normalização e validação de campos.
// ============================================================================

// ─── Telefone BR ────────────────────────────────────────────────────────────

/**
 * Extrai apenas dígitos de uma string.
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Aplica máscara de telefone BR.
 * 10 dígitos (fixo): (00) 0000-0000
 * 11 dígitos (celular): (00) 00000-0000
 */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 11 dígitos — celular
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Normaliza telefone para apenas dígitos (formato canonical).
 */
export function normalizePhone(value: string): string {
  return onlyDigits(value).slice(0, 11);
}

/**
 * Valida telefone BR (10 ou 11 dígitos, DDD 11-99).
 */
export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length < 10 || digits.length > 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  // Celular deve começar com 9
  if (digits.length === 11 && digits[2] !== "9") return false;
  return true;
}

// ─── CNPJ ───────────────────────────────────────────────────────────────────

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export function maskCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/**
 * Normaliza CNPJ para 14 dígitos.
 */
export function normalizeCnpj(value: string): string {
  return onlyDigits(value).slice(0, 14);
}

/**
 * Valida CNPJ com dígitos verificadores (mod 11).
 */
export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return false;

  // Rejeitar todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(digits)) return false;

  // Cálculo do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[12], 10) !== digit1) return false;

  // Cálculo do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i], 10) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[13], 10) !== digit2) return false;

  return true;
}

// ─── Moeda BRL ──────────────────────────────────────────────────────────────

/**
 * Aplica máscara de moeda BRL: R$ 1.234,56
 * Digita da direita para esquerda (centavos).
 */
export function maskCurrency(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length === 0) return "";

  const numericValue = parseInt(digits, 10);
  const formatted = (numericValue / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `R$ ${formatted}`;
}

/**
 * Converte string mascarada em número float.
 */
export function normalizeCurrency(value: string): number {
  const digits = onlyDigits(value);
  if (digits.length === 0) return 0;
  return parseInt(digits, 10) / 100;
}

/**
 * Converte número para a representação mascarada.
 */
export function currencyFromNumber(value: number): string {
  if (value === 0) return "";
  const cents = Math.round(value * 100);
  return maskCurrency(cents.toString());
}

// ─── Percentual ─────────────────────────────────────────────────────────────

/**
 * Aplica máscara de percentual: 00,00%
 */
export function maskPercent(value: string): string {
  // Permitir dígitos e vírgula
  const cleaned = value.replace(/[^\d,]/g, "");
  // Garantir apenas uma vírgula e max 2 decimais
  const parts = cleaned.split(",");
  if (parts.length > 2) return parts[0] + "," + parts[1];
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + "," + parts[1].slice(0, 2);
  }
  return cleaned;
}

/**
 * Converte string de percentual para número (0-100).
 */
export function normalizePercent(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return Math.min(100, Math.max(0, num));
}

// ─── E-mail ─────────────────────────────────────────────────────────────────

/**
 * Normaliza e-mail: trim + lowercase.
 */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

// ─── URL ────────────────────────────────────────────────────────────────────

/**
 * Normaliza URL: adiciona https:// se ausente.
 */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// ─── Inteiro ────────────────────────────────────────────────────────────────

/**
 * Filtra apenas dígitos para campos inteiros.
 * Bloqueia ponto, vírgula, "e" (exponential).
 */
export function maskInteger(value: string): string {
  return onlyDigits(value);
}

/**
 * Converte string para inteiro.
 */
export function normalizeInteger(value: string): number {
  const digits = onlyDigits(value);
  if (digits.length === 0) return 0;
  return parseInt(digits, 10);
}
