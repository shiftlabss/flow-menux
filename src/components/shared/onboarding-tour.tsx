"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Kanban,
  CalendarCheck,
  Users,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TourStep {
  title: string;
  description: string;
  targetArea: string;
  icon: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Tour Steps
// ---------------------------------------------------------------------------

const tourSteps: TourStep[] = [
  {
    title: "Bem-vindo ao Flow",
    description:
      "O Flow é o CRM completo para sua equipe de vendas e sucesso do cliente. Vamos fazer um tour rápido pelas funcionalidades principais.",
    targetArea: "Visão geral do sistema",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    title: "Seu Dashboard",
    description:
      "Acompanhe métricas de vendas, atividades pendentes e alertas críticos em tempo real. Tudo que você precisa em um só lugar.",
    targetArea: "Dashboard principal",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
  {
    title: "Pipeline de Vendas",
    description:
      "Gerencie suas oportunidades com um pipeline visual estilo Kanban. Arraste e solte para mover deals entre etapas.",
    targetArea: "Página de Pipeline",
    icon: <Kanban className="h-6 w-6" />,
  },
  {
    title: "Atividades",
    description:
      "Organize ligações, reuniões e follow-ups. Nunca perca um prazo com lembretes automáticos e SLA configurável.",
    targetArea: "Página de Atividades",
    icon: <CalendarCheck className="h-6 w-6" />,
  },
  {
    title: "Clientes",
    description:
      "Tenha visão 360° de cada cliente: histórico de interações, health score, oportunidades associadas e muito mais.",
    targetArea: "Página de Clientes",
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: "Configurações",
    description:
      "Personalize seu pipeline, convide membros da equipe, configure integrações e ajuste o sistema ao seu fluxo de trabalho.",
    targetArea: "Página de Configurações",
    icon: <Settings className="h-6 w-6" />,
  },
];

// ---------------------------------------------------------------------------
// Local Storage Key
// ---------------------------------------------------------------------------

const TOUR_COMPLETED_KEY = "flow-onboarding-tour-completed";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!completed) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    }
    setIsVisible(false);
  }, [dontShowAgain]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tour card */}
      <div className="relative z-10 mx-4 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-[15px] border border-zinc-200 bg-white p-8 shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Fechar tour"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[15px] bg-brand-light text-brand">
            {step.icon}
          </div>

          {/* Content */}
          <h2 className="font-heading text-2xl font-bold text-black">
            {step.title}
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-zinc-600">
            {step.description}
          </p>

          {/* Target area label */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-zinc-100 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-brand" />
            <span className="font-body text-xs text-zinc-500">
              {step.targetArea}
            </span>
          </div>

          {/* Don't show again checkbox (last step only) */}
          {isLastStep && (
            <div className="mt-6 flex items-center gap-2">
              <Checkbox
                id="dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) =>
                  setDontShowAgain(checked === true)
                }
              />
              <label
                htmlFor="dont-show-again"
                className="cursor-pointer font-body text-sm text-zinc-500"
              >
                Não mostrar novamente
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="font-heading text-sm text-zinc-400 transition-colors hover:text-zinc-600"
            >
              Pular
            </button>

            <div className="flex items-center gap-4">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "w-6 bg-brand"
                        : index < currentStep
                          ? "w-2 bg-brand/40"
                          : "w-2 bg-zinc-200"
                    }`}
                    aria-label={`Ir para passo ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="rounded-full bg-black font-heading text-white hover:bg-zinc-800"
              >
                {isLastStep ? "Concluir" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
