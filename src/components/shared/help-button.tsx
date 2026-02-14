"use client";

import { useState, useCallback } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  Keyboard,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuickLink {
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const quickLinks: QuickLink[] = [
  {
    title: "Central de Ajuda",
    icon: <BookOpen className="h-4 w-4" />,
    description: "A central de ajuda completa estará disponível em breve. Consulte as perguntas frequentes abaixo.",
  },
  {
    title: "Atalhos de teclado",
    icon: <Keyboard className="h-4 w-4" />,
    description: "Ctrl+K: Busca global · Esc: Fechar painel",
  },
  {
    title: "Novidades",
    icon: <Sparkles className="h-4 w-4" />,
    description: "Versão 1.0: Pipeline Kanban, Gestão de Clientes, Relatórios e mais!",
  },
  {
    title: "Fale conosco",
    icon: <MessageCircle className="h-4 w-4" />,
    description: "Envie um e-mail para suporte@menux.com.br",
  },
];

const faqItems: FAQItem[] = [
  {
    question: "Como criar uma nova oportunidade?",
    answer:
      "Acesse a página Pipeline e clique no botão \"Nova Oportunidade\" no canto superior direito. Preencha os dados do deal como nome, valor, cliente e etapa inicial.",
  },
  {
    question: "Como configurar as etapas do meu pipeline?",
    answer:
      "Vá em Configurações > Pipeline. Você pode adicionar, remover e reordenar etapas. Defina SLAs para cada etapa para receber alertas automáticos.",
  },
  {
    question: "Como convidar membros para minha equipe?",
    answer:
      "Acesse Configurações > Usuários e clique em \"Convidar\". Insira o e-mail do colega e selecione o perfil de acesso (Comercial, CS ou Admin).",
  },
  {
    question: "O que é o Health Score do cliente?",
    answer:
      "O Health Score é uma pontuação de 0 a 100 que indica a saúde do relacionamento com o cliente. É calculado com base em interações recentes, SLAs cumpridos e engajamento.",
  },
];

// ---------------------------------------------------------------------------
// FAQ Accordion Item
// ---------------------------------------------------------------------------

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left transition-colors hover:text-brand"
      >
        <span className="flex-1 pr-2 font-body text-sm font-medium text-zinc-700">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        )}
      </button>
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 pb-3">
          <p className="font-body text-sm leading-relaxed text-zinc-500">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HelpButton() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [expandedLinkIndex, setExpandedLinkIndex] = useState<number | null>(null);

  const handleToggleFAQ = useCallback((index: number) => {
    setOpenFAQIndex((prev) => (prev === index ? null : index));
  }, []);

  // Filter FAQ items based on search query
  const filteredFAQ = searchQuery.trim()
    ? faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  const filteredLinks = searchQuery.trim()
    ? quickLinks.filter((link) =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickLinks;

  return (
    <div className="fixed bottom-24 right-6 z-50 hidden md:block">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl"
            aria-label="Abrir central de ajuda"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="w-[340px] rounded-[15px] p-0"
        >
          {/* Header */}
          <div className="border-b border-zinc-100 px-4 py-3">
            <h3 className="font-heading text-base font-semibold text-black">
              Como podemos ajudar?
            </h3>
          </div>

          {/* Search */}
          <div className="px-4 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Buscar na ajuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-[15px] pl-9 font-body text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick links */}
          {filteredLinks.length > 0 && (
            <div className="px-4 pt-3">
              <p className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Links rápidos
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {filteredLinks.map((link, idx) => {
                  const globalIdx = quickLinks.indexOf(link);
                  const isExpanded = expandedLinkIndex === globalIdx;
                  return (
                    <div key={link.title} className="col-span-1">
                      <button
                        onClick={() => setExpandedLinkIndex(isExpanded ? null : globalIdx)}
                        className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 transition-colors ${
                          isExpanded ? "bg-brand/5" : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                          {link.icon}
                        </div>
                        <span className="font-body text-xs font-medium text-zinc-700">
                          {link.title}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="animate-in fade-in slide-in-from-top-1 mt-1 rounded-[8px] bg-zinc-50 px-3 py-2">
                          <p className="font-body text-xs leading-relaxed text-zinc-500">
                            {link.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="px-4 pb-4 pt-3">
            <p className="mb-1 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Perguntas frequentes
            </p>
            <div>
              {filteredFAQ.length > 0 ? (
                filteredFAQ.map((item, index) => (
                  <FAQAccordionItem
                    key={index}
                    item={item}
                    isOpen={openFAQIndex === index}
                    onToggle={() => handleToggleFAQ(index)}
                  />
                ))
              ) : (
                <p className="py-4 text-center font-body text-sm text-zinc-400">
                  Nenhum resultado encontrado
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
