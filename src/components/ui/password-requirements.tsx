import { CheckCircle2, Circle } from "lucide-react";

export function RequirementsList({ password }: { password: string }) {
  const requirements = [
    { label: "Mínimo de 8 caracteres", met: password.length >= 8 },
    { label: "1 letra maiúscula", met: /[A-Z]/.test(password) },
    { label: "1 número", met: /[0-9]/.test(password) },
    { label: "1 caractere especial", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <ul className="mt-2 space-y-1.5">
      {requirements.map((req) => (
        <li key={req.label} className="flex items-center gap-2">
          {req.met ? (
            <CheckCircle2 className="h-4 w-4 text-status-success" />
          ) : (
            <Circle className="h-4 w-4 text-zinc-300" />
          )}
          <span
            className={`font-body text-xs ${req.met ? "text-status-success" : "text-zinc-400"}`}
          >
            {req.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
