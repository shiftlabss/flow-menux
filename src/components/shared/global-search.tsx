"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Kanban,
  Users,
  DollarSign,
  Settings,
  User,
  Target,
  BarChart3,
  ShieldCheck,
  Building2,
  Handshake,
} from "lucide-react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/stores/ui-store";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface SearchableItem {
  type: "opportunity" | "client";
  name: string;
  razaoSocial: string;
  cnpj: string;
  phone: string;
  email: string;
  contact: string;
  city: string;
  stage?: string;
  healthScore?: string;
  responsible: string;
}

const mockSearchableItems: SearchableItem[] = [
  // Opportunities
  {
    type: "opportunity",
    name: "Restaurante Bela Vista",
    razaoSocial: "Restaurante Bela Vista Ltda ME",
    cnpj: "12.345.678/0001-00",
    phone: "(11) 99999-1234",
    email: "contato@belavista.com",
    contact: "João Silva",
    city: "São Paulo",
    stage: "Contato Feito",
    responsible: "Maria Silva",
  },
  {
    type: "opportunity",
    name: "Pizzaria Don Corleone",
    razaoSocial: "Don Corleone Alimentos Ltda",
    cnpj: "23.456.789/0001-11",
    phone: "(11) 98765-4321",
    email: "contato@doncorleone.com",
    contact: "Pedro Oliveira",
    city: "São Paulo",
    stage: "Proposta Enviada",
    responsible: "Pedro Santos",
  },
  {
    type: "opportunity",
    name: "Bistrô La Maison",
    razaoSocial: "La Maison Gastronomia Ltda",
    cnpj: "34.567.890/0001-22",
    phone: "(21) 97654-3210",
    email: "contato@lamaison.com",
    contact: "Ana Costa",
    city: "Rio de Janeiro",
    stage: "Negociação",
    responsible: "Maria Silva",
  },
  {
    type: "opportunity",
    name: "Churrascaria Fogo de Chão",
    razaoSocial: "Fogo de Chão Restaurantes SA",
    cnpj: "45.678.901/0001-33",
    phone: "(11) 96543-2109",
    email: "contato@fogodechao.com",
    contact: "Carlos Santos",
    city: "São Paulo",
    stage: "Lead-In",
    responsible: "Julia Fernandes",
  },
  {
    type: "opportunity",
    name: "Sushi Yamamoto",
    razaoSocial: "Yamamoto Culinária Japonesa Ltda",
    cnpj: "56.789.012/0001-44",
    phone: "(11) 95432-1098",
    email: "contato@sushiyamamoto.com",
    contact: "Yuki Yamamoto",
    city: "São Paulo",
    stage: "Reunião Agendada",
    responsible: "Rafael Costa",
  },
  {
    type: "opportunity",
    name: "Café Colonial Oma",
    razaoSocial: "Oma Café Colonial Eireli",
    cnpj: "67.890.123/0001-55",
    phone: "(41) 94321-0987",
    email: "contato@cafeoma.com",
    contact: "Klaus Schmidt",
    city: "Curitiba",
    stage: "Qualificação",
    responsible: "Maria Silva",
  },
  {
    type: "opportunity",
    name: "Cantina Famiglia Mancini",
    razaoSocial: "Famiglia Mancini Restaurante Ltda",
    cnpj: "11.222.333/0001-66",
    phone: "(11) 93210-9876",
    email: "contato@famigliamancini.com",
    contact: "Marco Mancini",
    city: "São Paulo",
    stage: "Contato Feito",
    responsible: "Pedro Santos",
  },
  {
    type: "opportunity",
    name: "Doceria Amor aos Pedaços",
    razaoSocial: "Amor aos Pedaços Doces Ltda",
    cnpj: "22.333.444/0001-77",
    phone: "(11) 92109-8765",
    email: "contato@amorpedacos.com",
    contact: "Lucia Ferreira",
    city: "São Paulo",
    stage: "Proposta Enviada",
    responsible: "Julia Fernandes",
  },
  // Clients
  {
    type: "client",
    name: "Restaurante Panorâmico",
    razaoSocial: "Restaurante Panorâmico Ltda ME",
    cnpj: "78.901.234/0001-66",
    phone: "(11) 3456-7890",
    email: "contato@panoramico.com",
    contact: "Ana Costa",
    city: "São Paulo",
    healthScore: "Saudável",
    responsible: "Maria Silva",
  },
  {
    type: "client",
    name: "Hotel Fazenda Serra Azul",
    razaoSocial: "Serra Azul Hotelaria Ltda",
    cnpj: "89.012.345/0001-77",
    phone: "(35) 3456-7891",
    email: "contato@serraazul.com",
    contact: "Fernando Lima",
    city: "Monte Verde",
    healthScore: "Atenção",
    responsible: "Pedro Santos",
  },
  {
    type: "client",
    name: "Padaria Pão de Ouro",
    razaoSocial: "Pão de Ouro Panificação Ltda",
    cnpj: "90.123.456/0001-88",
    phone: "(11) 2345-6789",
    email: "contato@paodeouro.com",
    contact: "Rosa Mendes",
    city: "São Paulo",
    healthScore: "Saudável",
    responsible: "Julia Fernandes",
  },
  {
    type: "client",
    name: "Bar do Zé",
    razaoSocial: "José da Silva Bebidas ME",
    cnpj: "01.234.567/0001-99",
    phone: "(21) 1234-5678",
    email: "contato@bardoze.com",
    contact: "José da Silva",
    city: "Rio de Janeiro",
    healthScore: "Crítico",
    responsible: "Rafael Costa",
  },
  {
    type: "client",
    name: "Confeitaria Colombo",
    razaoSocial: "Confeitaria Colombo SA",
    cnpj: "33.444.555/0001-00",
    phone: "(21) 2345-9876",
    email: "contato@colombo.com",
    contact: "Helena Oliveira",
    city: "Rio de Janeiro",
    healthScore: "Saudável",
    responsible: "Maria Silva",
  },
  {
    type: "client",
    name: "Empório Santa Maria",
    razaoSocial: "Empório Santa Maria Alimentos Ltda",
    cnpj: "44.555.666/0001-11",
    phone: "(11) 3456-1234",
    email: "contato@emporiosantamaria.com",
    contact: "Roberto Almeida",
    city: "São Paulo",
    healthScore: "Atenção",
    responsible: "Rafael Costa",
  },
];

// ---------------------------------------------------------------------------
// Pages for navigation
// ---------------------------------------------------------------------------

const pages = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/activities", label: "Atividades", icon: CalendarCheck },
  { path: "/pipes", label: "Pipeline de Vendas", icon: Kanban },
  { path: "/clients", label: "Clientes", icon: Users },
  { path: "/finance", label: "Financeiro", icon: DollarSign },
  { path: "/goals", label: "Metas", icon: Target },
  { path: "/reports", label: "Relatórios", icon: BarChart3 },
  { path: "/audit", label: "Auditoria", icon: ShieldCheck },
  { path: "/settings/general", label: "Configurações", icon: Settings },
  { path: "/settings/users", label: "Gestão de Usuários", icon: User },
  { path: "/settings/profile", label: "Meu Perfil", icon: User },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_RESULTS_PER_GROUP = 5;
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesQuery(item: SearchableItem, query: string): boolean {
  const q = normalize(query);
  return (
    normalize(item.name).includes(q) ||
    normalize(item.razaoSocial).includes(q) ||
    normalize(item.cnpj).includes(q) ||
    normalize(item.phone).includes(q) ||
    normalize(item.email).includes(q) ||
    normalize(item.contact).includes(q) ||
    normalize(item.city).includes(q)
  );
}

function healthScoreColor(score: string | undefined): string {
  switch (score) {
    case "Saudável":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
    case "Atenção":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "Crítico":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Hook: debounced value
// ---------------------------------------------------------------------------

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GlobalSearch() {
  const { isSearchOpen, setSearchOpen, openDrawer } = useUIStore();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query when dialog closes
  useEffect(() => {
    if (!isSearchOpen) {
      startTransition(() => {
        setQuery("");
      });
    }
  }, [isSearchOpen]);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  // Filter mock results based on debounced query
  const hasSearchQuery = debouncedQuery.trim().length >= MIN_QUERY_LENGTH;

  const opportunities = useMemo(() => {
    if (!hasSearchQuery) return [];
    return mockSearchableItems
      .filter((i) => i.type === "opportunity" && matchesQuery(i, debouncedQuery))
      .slice(0, MAX_RESULTS_PER_GROUP);
  }, [debouncedQuery, hasSearchQuery]);

  const clients = useMemo(() => {
    if (!hasSearchQuery) return [];
    return mockSearchableItems
      .filter((i) => i.type === "client" && matchesQuery(i, debouncedQuery))
      .slice(0, MAX_RESULTS_PER_GROUP);
  }, [debouncedQuery, hasSearchQuery]);

  const hasResults = opportunities.length > 0 || clients.length > 0;
  const showNoResults = hasSearchQuery && !hasResults;

  // Navigation helpers
  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      setSearchOpen(false);
    },
    [router, setSearchOpen],
  );

  const openOpportunity = useCallback(
    (item: SearchableItem) => {
      openDrawer("lead-card", {
        name: item.name,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        phone: item.phone,
        email: item.email,
        contact: item.contact,
        city: item.city,
        stage: item.stage,
        responsible: item.responsible,
      });
      setSearchOpen(false);
    },
    [openDrawer, setSearchOpen],
  );

  const openClient = useCallback(
    (item: SearchableItem) => {
      openDrawer("client-card", {
        name: item.name,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        phone: item.phone,
        email: item.email,
        contact: item.contact,
        city: item.city,
        healthScore: item.healthScore,
        responsible: item.responsible,
      });
      setSearchOpen(false);
    },
    [openDrawer, setSearchOpen],
  );

  // Build a unique value for each cmdk item to avoid collisions
  const itemValue = (item: SearchableItem) =>
    `${item.type}-${item.cnpj}-${item.name}`;

  return (
    <CommandDialog
      open={isSearchOpen}
      onOpenChange={setSearchOpen}
      title="Busca Global"
      description="Busque por páginas, oportunidades e clientes"
      showCloseButton={false}
    >
      <CommandInput
        ref={inputRef}
        placeholder="Buscar páginas, oportunidades, clientes..."
        className="font-body"
        value={query}
        onValueChange={setQuery}
      />

      <CommandList className="max-h-[420px]">
        {/* ---- Empty state ---- */}
        {showNoResults && (
          <div className="py-8 text-center">
            <p className="font-body text-sm text-zinc-500">
              Nenhum resultado para{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                &ldquo;{debouncedQuery}&rdquo;
              </span>
            </p>
          </div>
        )}

        {/* ---- Opportunities ---- */}
        {opportunities.length > 0 && (
          <>
            <CommandGroup
              heading={
                <span className="font-heading text-xs font-semibold uppercase tracking-wider text-brand">
                  Oportunidades
                </span>
              }
            >
              {opportunities.map((item) => (
                <CommandItem
                  key={itemValue(item)}
                  value={itemValue(item)}
                  onSelect={() => openOpportunity(item)}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-amber-100 dark:bg-amber-900/40">
                    <Handshake className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-body text-sm font-medium truncate">
                      {item.name}
                    </span>
                    <span className="font-body text-xs text-muted-foreground truncate">
                      {item.contact} &middot; {item.city}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-[10px] text-[10px] font-body shrink-0"
                  >
                    {item.stage}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* ---- Clients ---- */}
        {clients.length > 0 && (
          <>
            <CommandGroup
              heading={
                <span className="font-heading text-xs font-semibold uppercase tracking-wider text-brand">
                  Clientes
                </span>
              }
            >
              {clients.map((item) => (
                <CommandItem
                  key={itemValue(item)}
                  value={itemValue(item)}
                  onSelect={() => openClient(item)}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-100 dark:bg-blue-900/40">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-body text-sm font-medium truncate">
                      {item.name}
                    </span>
                    <span className="font-body text-xs text-muted-foreground truncate">
                      {item.contact} &middot; {item.city}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`rounded-[10px] text-[10px] font-body shrink-0 border-0 ${healthScoreColor(item.healthScore)}`}
                  >
                    {item.healthScore}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* ---- Pages ---- */}
        <CommandGroup
          heading={
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Páginas
            </span>
          }
        >
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.path}
                value={`page-${page.label}`}
                onSelect={() => navigate(page.path)}
                className="rounded-[10px] px-3 py-2"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="font-body">{page.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>

      {/* ---- Footer hints ---- */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <div className="flex items-center gap-3 font-body text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded-[5px] border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              &uarr;&darr;
            </kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-[5px] border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              &crarr;
            </kbd>
            selecionar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-[5px] border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              esc
            </kbd>
            fechar
          </span>
        </div>
        <div className="flex items-center gap-1 font-body text-[11px] text-muted-foreground">
          <kbd className="rounded-[5px] border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            &#8984;K
          </kbd>
          busca rápida
        </div>
      </div>
    </CommandDialog>
  );
}
