export function getPasswordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  if (score <= 25) return { score, label: "Fraca" };
  if (score <= 50) return { score, label: "Razoável" };
  if (score <= 75) return { score, label: "Boa" };
  return { score, label: "Forte" };
}
