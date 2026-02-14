"use client";

import { useState } from "react";
import {
  Trophy,
  Target,
  DollarSign,
  TrendingUp,
  Activity,
  Medal,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  X,
  Users,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import type { Goal } from "@/types";
import { useGoalStore } from "@/stores/goal-store";
import { InlineFeedback } from "@/components/ui/inline-feedback";

// ---------------------------------------------------------------------------
// Framer Motion Variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

interface RankedUser {
  id: string;
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  isCurrentUser: boolean;
}

const mockRanking: RankedUser[] = [
  {
    id: "user-1",
    name: "Ana Souza",
    score: 2450,
    trend: "up",
    isCurrentUser: false,
  },
  {
    id: "user-2",
    name: "Carlos Lima",
    score: 2180,
    trend: "up",
    isCurrentUser: false,
  },
  {
    id: "user-3",
    name: "Fernanda Reis",
    score: 1920,
    trend: "down",
    isCurrentUser: true,
  },
  {
    id: "user-4",
    name: "Pedro Alves",
    score: 1750,
    trend: "stable",
    isCurrentUser: false,
  },
  {
    id: "user-5",
    name: "Julia Mendes",
    score: 1580,
    trend: "up",
    isCurrentUser: false,
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const goalTypeConfig = {
  revenue: {
    icon: <DollarSign className="h-5 w-5" />,
    label: "Receita",
    format: (val: number) => formatCurrency(val),
  },
  opportunities: {
    icon: <Target className="h-5 w-5" />,
    label: "Oportunidades",
    format: (val: number) => val.toString(),
  },
  conversion: {
    icon: <TrendingUp className="h-5 w-5" />,
    label: "Taxa de Conversao",
    format: (val: number) => `${val}%`,
  },
  activities: {
    icon: <Activity className="h-5 w-5" />,
    label: "Atividades",
    format: (val: number) => val.toString(),
  },
};

const trendIcons = {
  up: <ArrowUp className="h-3.5 w-3.5 text-status-success" />,
  down: <ArrowDown className="h-3.5 w-3.5 text-status-danger" />,
  stable: <Minus className="h-3.5 w-3.5 text-zinc-400" />,
};

const positionBadges: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-zinc-100 text-zinc-600",
  3: "bg-amber-100 text-amber-700",
};

// ---------------------------------------------------------------------------
// GoalCard
// ---------------------------------------------------------------------------

function GoalCard({ goal }: { goal: Goal }) {
  const config = goalTypeConfig[goal.type];
  const percentage = Math.min(
    Math.round((goal.current / goal.target) * 100),
    100
  );
  const isOnTrack = percentage >= 60;

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardContent className="p-5">
        {/* Icon + Title */}
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-light text-brand">
            {config.icon}
          </div>
          <Badge
            className={`rounded-[10px] border-0 font-body text-xs ${
              goal.period === "monthly"
                ? "bg-blue-50 text-blue-600"
                : "bg-purple-50 text-purple-600"
            }`}
          >
            {goal.period === "monthly" ? "Mensal" : "Trimestral"}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-heading text-sm font-semibold text-black">
          {goal.title}
        </h3>

        {/* Current / Target */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-heading text-2xl font-bold text-black">
            {config.format(goal.current)}
          </span>
          <span className="font-body text-sm text-zinc-500">
            / {config.format(goal.target)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-brand"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`font-heading text-sm font-semibold ${
                isOnTrack ? "text-status-success" : "text-status-warning"
              }`}
            >
              {percentage}%
            </span>
            <span className="font-body text-xs text-zinc-500">
              {isOnTrack ? "No ritmo" : "Atencao"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

function Leaderboard({ ranking }: { ranking: RankedUser[] }) {
  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-brand" />
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Ranking
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table header */}
        <div className="mb-2 grid grid-cols-12 gap-2 border-b border-zinc-100 pb-2">
          <span className="col-span-1 font-body text-xs font-medium text-zinc-500">
            #
          </span>
          <span className="col-span-6 font-body text-xs font-medium text-zinc-500">
            Vendedor
          </span>
          <span className="col-span-3 text-right font-body text-xs font-medium text-zinc-500">
            Pontuacao
          </span>
          <span className="col-span-2 text-right font-body text-xs font-medium text-zinc-500">
            Trend
          </span>
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {ranking.map((user, index) => {
            const position = index + 1;
            const badgeClass =
              positionBadges[position] || "bg-zinc-50 text-zinc-500";

            return (
              <div
                key={user.id}
                className={`grid grid-cols-12 items-center gap-2 rounded-[10px] p-2.5 transition-colors ${
                  user.isCurrentUser
                    ? "bg-brand-light"
                    : "hover:bg-zinc-50"
                }`}
              >
                {/* Position */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-heading text-xs font-bold ${badgeClass}`}
                  >
                    {position}
                  </span>
                </div>

                {/* Avatar + Name */}
                <div className="col-span-6 flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={`text-xs font-medium ${
                        user.isCurrentUser
                          ? "bg-brand text-white"
                          : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-body text-sm font-medium ${
                        user.isCurrentUser ? "text-brand" : "text-black"
                      }`}
                    >
                      {user.name}
                    </p>
                    {user.isCurrentUser && (
                      <p className="font-body text-[11px] text-brand/70">
                        Voce
                      </p>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-3 text-right">
                  <span className="font-heading text-sm font-bold text-black">
                    {user.score.toLocaleString("pt-BR")}
                  </span>
                  <p className="font-body text-[11px] text-zinc-500">pts</p>
                </div>

                {/* Trend */}
                <div className="col-span-2 flex justify-end">
                  {trendIcons[user.trend]}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// NewGoalDialog
// ---------------------------------------------------------------------------

const goalTypeLabels: Record<string, string> = {
  revenue: "Receita",
  opportunities: "Oportunidades",
  conversion: "Taxa de Conversão",
  activities: "Atividades",
};

const userNames: Record<string, string> = {
  "user-1": "Ana Souza",
  "user-2": "Carlos Lima",
  "user-3": "Fernanda Reis",
  "user-4": "Pedro Alves",
  "user-5": "Julia Mendes",
};

function NewGoalDialog() {
  const { addGoal } = useGoalStore();
  const [open, setOpen] = useState(false);
  const [goalType, setGoalType] = useState<string>("");
  const [target, setTarget] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [assignTo, setAssignTo] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleCreate() {
    if (!goalType || !target || !period || !assignTo) return;

    const now = new Date();
    let startDate: string;
    let endDate: string;

    if (period === "monthly") {
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;
    } else {
      const q = Math.floor(now.getMonth() / 3);
      startDate = `${now.getFullYear()}-${String(q * 3 + 1).padStart(2, "0")}-01`;
      endDate = `${now.getFullYear()}-${String(q * 3 + 3).padStart(2, "0")}-${new Date(now.getFullYear(), q * 3 + 3, 0).getDate()}`;
    }

    addGoal({
      title: goalTypeLabels[goalType] || goalType,
      type: goalType as Goal["type"],
      target: Number(target),
      current: 0,
      period: period as "monthly" | "quarterly",
      startDate,
      endDate,
      userId: assignTo === "team-all" ? undefined : assignTo,
      userName: assignTo === "team-all" ? undefined : userNames[assignTo],
    });

    setFeedback(`Meta criada: ${goalTypeLabels[goalType]} — Meta: ${target} (${period === "monthly" ? "Mensal" : "Trimestral"})`);

    setGoalType("");
    setTarget("");
    setPeriod("");
    setAssignTo("");
    setTimeout(() => {
      setOpen(false);
      setFeedback(null);
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800">
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-[15px] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-black">
            Nova Meta
          </DialogTitle>
        </DialogHeader>

        {feedback && (
          <div className="pt-2">
            <InlineFeedback
              type="success"
              message={feedback}
              compact
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        <div className="space-y-5 pt-2">
          {/* Type */}
          <div className="space-y-2">
            <Label className="font-body text-sm font-medium text-zinc-700">
              Tipo de Meta
            </Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger className="rounded-[15px]">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="revenue">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-brand" />
                    Receita
                  </div>
                </SelectItem>
                <SelectItem value="opportunities">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand" />
                    Oportunidades
                  </div>
                </SelectItem>
                <SelectItem value="conversion">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand" />
                    Taxa de Conversao
                  </div>
                </SelectItem>
                <SelectItem value="activities">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand" />
                    Atividades
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target */}
          <div className="space-y-2">
            <Label className="font-body text-sm font-medium text-zinc-700">
              Valor Alvo
            </Label>
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={
                goalType === "revenue"
                  ? "Ex: 300000"
                  : goalType === "conversion"
                    ? "Ex: 35"
                    : "Ex: 60"
              }
              className="rounded-[15px]"
            />
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label className="font-body text-sm font-medium text-zinc-700">
              Periodo
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="rounded-[15px]">
                <SelectValue placeholder="Selecione o periodo" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    Mensal
                  </div>
                </SelectItem>
                <SelectItem value="quarterly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    Trimestral
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assign to */}
          <div className="space-y-2">
            <Label className="font-body text-sm font-medium text-zinc-700">
              Atribuir a
            </Label>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger className="rounded-[15px]">
                <SelectValue placeholder="Selecione usuario ou equipe" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="team-all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-zinc-500" />
                    Toda a Equipe
                  </div>
                </SelectItem>
                <SelectItem value="user-1">Ana Souza</SelectItem>
                <SelectItem value="user-2">Carlos Lima</SelectItem>
                <SelectItem value="user-3">Fernanda Reis</SelectItem>
                <SelectItem value="user-4">Pedro Alves</SelectItem>
                <SelectItem value="user-5">Julia Mendes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full font-heading text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!goalType || !target || !period || !assignTo}
              className="flex-1 rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
            >
              Criar Meta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Goals Page
// ---------------------------------------------------------------------------

export default function GoalsPage() {
  const { goals } = useGoalStore();

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-8">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
            Metas & Gamificacao
          </h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Acompanhe suas metas, ranking e desempenho da equipe
          </p>
        </div>
        <NewGoalDialog />
      </motion.div>

      {/* Goal Cards — responsive grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((goal) => (
          <motion.div key={goal.id} variants={scaleIn}>
            <GoalCard goal={goal} />
          </motion.div>
        ))}
      </div>

      {/* Ranking Section */}
      <motion.div variants={fadeUp}>
        <Leaderboard ranking={mockRanking} />
      </motion.div>
    </motion.div>
  );
}
