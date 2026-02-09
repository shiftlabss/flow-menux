"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Camera,
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/masked-inputs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { profileSchema, type ProfileFormData } from "@/lib/schemas";
import { useAuthStore } from "@/stores/auth-store";

// ===== Mock Sessions Data =====

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  icon: "desktop" | "mobile" | "tablet";
}

const mockSessions: Session[] = [
  {
    id: "1",
    device: "MacBook Pro",
    browser: "Chrome 121",
    ip: "189.***.***.42",
    lastActive: "Agora",
    isCurrent: true,
    icon: "desktop",
  },
  {
    id: "2",
    device: "iPhone 15",
    browser: "Safari 17",
    ip: "189.***.***.42",
    lastActive: "Há 2 horas",
    isCurrent: false,
    icon: "mobile",
  },
  {
    id: "3",
    device: "Windows Desktop",
    browser: "Edge 120",
    ip: "201.***.***.18",
    lastActive: "Há 3 dias",
    isCurrent: false,
    icon: "desktop",
  },
];

// ===== Notification Preferences Config =====

interface NotificationPref {
  id: string;
  label: string;
  description: string;
}

const notificationCategories: NotificationPref[] = [
  {
    id: "sla",
    label: "SLA",
    description: "Alertas de prazo e violações de SLA",
  },
  {
    id: "activities",
    label: "Atividades",
    description: "Lembretes e atualizações de atividades",
  },
  {
    id: "opportunities",
    label: "Oportunidades",
    description: "Movimentações e mudanças em oportunidades",
  },
  {
    id: "health-score",
    label: "Health Score",
    description: "Alterações no score de saúde dos clientes",
  },
];

// ===== Main Page =====

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Perfil atualizado!", {
        description: "Suas informações pessoais foram salvas com sucesso.",
      });
    } catch {
      toast.error("Erro ao salvar perfil", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "FL";

  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
          Meu Perfil
        </h1>
        <p className="mt-1 font-body text-sm text-zinc-500">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Avatar Section */}
      <Card className="rounded-[15px] border-zinc-200">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || user?.avatar} />
              <AvatarFallback className="bg-brand font-heading text-xl font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.warning("Arquivo muito grande", {
                      description: "A imagem deve ter no máximo 5MB.",
                    });
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarPreview(reader.result as string);
                    toast.success("Avatar atualizado!", {
                      description: "Sua foto de perfil foi atualizada.",
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-white bg-white shadow-sm"
            >
              <Camera className="h-4 w-4 text-zinc-600" />
            </Button>
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-black">
              {user?.name || "Usuário"}
            </p>
            <p className="font-body text-sm text-zinc-500">
              {user?.email || "email@menux.com"}
            </p>
            <p className="mt-1 font-body text-xs text-zinc-400">
              {user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : "Admin"}{" "}
              · {user?.unitName || "Matriz"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="rounded-[15px] border-zinc-200">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Nome completo
              </Label>
              <Input
                className="h-10 rounded-[15px] font-body text-sm"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-status-danger">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">E-mail</Label>
              <Input
                type="email"
                className="h-10 rounded-[15px] font-body text-sm"
                disabled
                {...register("email")}
              />
              <p className="font-body text-xs text-zinc-400">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Telefone
              </Label>
              <PhoneInput
                className="h-10 rounded-[15px] font-body text-sm"
                onValueChange={(raw) => setValue("phone", raw)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="rounded-[15px] border-zinc-200">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Senha atual
              </Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 rounded-[15px] font-body text-sm"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Nova senha
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-[15px] font-body text-sm"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">
                Confirmar nova senha
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-[15px] font-body text-sm"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!currentPassword) {
                    toast.error("Erro", { description: "Senha atual é obrigatória." });
                    return;
                  }
                  if (!newPassword || newPassword.length < 8) {
                    toast.error("Erro", { description: "Nova senha deve ter no mínimo 8 caracteres." });
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error("Erro", { description: "As senhas não coincidem." });
                    return;
                  }
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  toast.success("Senha alterada!", {
                    description: "Sua senha foi alterada com sucesso.",
                  });
                }}
                className="rounded-full font-heading text-sm"
              >
                Alterar senha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <SessionsCard />

      {/* Notification Preferences */}
      <NotificationPreferencesCard />
    </div>
  );
}

// ===== Sessions Card =====

function SessionsCard() {
  const [sessions, setSessions] = useState(mockSessions);

  const handleEndSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    toast.success("Sessão encerrada!", {
      description: "A sessão foi desconectada com sucesso.",
    });
  };

  const handleEndAllOtherSessions = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
    toast.success("Sessões encerradas!", {
      description: "Todas as outras sessões foram desconectadas.",
    });
  };

  const getSessionIcon = (icon: Session["icon"]) => {
    switch (icon) {
      case "desktop":
        return <Monitor className="h-5 w-5 text-zinc-500" />;
      case "mobile":
        return <Smartphone className="h-5 w-5 text-zinc-500" />;
      case "tablet":
        return <Tablet className="h-5 w-5 text-zinc-500" />;
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Sessões Ativas
          </CardTitle>
          <p className="mt-1 font-body text-xs text-zinc-500">
            Gerencie os dispositivos conectados à sua conta
          </p>
        </div>
        <Shield className="h-5 w-5 text-zinc-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-[15px] border border-zinc-200 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                  {getSessionIcon(session.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-body text-sm font-medium text-black">
                      {session.device}
                    </p>
                    {session.isCurrent && (
                      <Badge className="rounded-[10px] bg-status-success-light font-body text-[10px] text-status-success">
                        Sessão atual
                      </Badge>
                    )}
                  </div>
                  <p className="font-body text-xs text-zinc-500">
                    {session.browser} · IP: {session.ip}
                  </p>
                  <p className="font-body text-xs text-zinc-400">
                    Último acesso: {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEndSession(session.id)}
                  className="rounded-full font-heading text-xs text-status-danger hover:bg-status-danger-light hover:text-status-danger"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Encerrar sessão
                </Button>
              )}
            </div>
          ))}
        </div>

        {otherSessions.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndAllOtherSessions}
              className="rounded-full font-heading text-xs text-status-danger hover:bg-status-danger-light hover:text-status-danger"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Encerrar todas as outras sessões
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Notification Preferences Card =====

function NotificationPreferencesCard() {
  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({
    sla: true,
    activities: true,
    opportunities: true,
    "health-score": false,
  });

  const [pushPrefs, setPushPrefs] = useState<Record<string, boolean>>({
    sla: true,
    activities: false,
    opportunities: true,
    "health-score": false,
  });

  const toggleEmail = (id: string) => {
    setEmailPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePush = (id: string) => {
    setPushPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Preferências de Notificação
        </CardTitle>
        <p className="font-body text-xs text-zinc-500">
          Escolha como e quando deseja receber notificações
        </p>
      </CardHeader>
      <CardContent>
        {/* Email Notifications */}
        <div className="mb-6">
          <h3 className="mb-4 font-heading text-sm font-semibold text-black">
            Notificações por E-mail
          </h3>
          <div className="space-y-4">
            {notificationCategories.map((cat) => (
              <div
                key={`email-${cat.id}`}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-body text-sm font-medium text-black">
                    {cat.label}
                  </p>
                  <p className="font-body text-xs text-zinc-500">
                    {cat.description}
                  </p>
                </div>
                <Switch
                  checked={emailPrefs[cat.id] ?? false}
                  onCheckedChange={() => toggleEmail(cat.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Push Notifications */}
        <div>
          <h3 className="mb-4 font-heading text-sm font-semibold text-black">
            Notificações Push
          </h3>
          <div className="space-y-4">
            {notificationCategories.map((cat) => (
              <div
                key={`push-${cat.id}`}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-body text-sm font-medium text-black">
                    {cat.label}
                  </p>
                  <p className="font-body text-xs text-zinc-500">
                    {cat.description}
                  </p>
                </div>
                <Switch
                  checked={pushPrefs[cat.id] ?? false}
                  onCheckedChange={() => togglePush(cat.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => {
              toast.success("Preferências salvas!", {
                description: "Suas preferências de notificação foram atualizadas.",
              });
            }}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            Salvar preferências
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
