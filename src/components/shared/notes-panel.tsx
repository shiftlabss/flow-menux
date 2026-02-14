"use client";

import { useState, useCallback } from "react";
import {
  Lock,
  Globe,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MentionInput } from "@/components/shared/mention-input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EntryType = "note" | "comment";

interface NoteEntry {
  id: string;
  type: EntryType;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  authorId: string;
  timestamp: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const CURRENT_USER_ID = "user-1";

const mockEntries: NoteEntry[] = [
  {
    id: "entry-1",
    type: "note",
    authorName: "Ana Souza",
    authorInitials: "AS",
    authorColor: "bg-brand-light text-brand",
    authorId: "user-1",
    timestamp: "2025-01-15T10:30:00",
    text: "Cliente mencionou interesse em expandir para mais 2 unidades. Preparar proposta com desconto progressivo.",
  },
  {
    id: "entry-2",
    type: "comment",
    authorName: "Carlos Lima",
    authorInitials: "CL",
    authorColor: "bg-status-success-light text-status-success",
    authorId: "user-2",
    timestamp: "2025-01-15T11:15:00",
    text: "Conversei com o financeiro deles. Orçamento aprovado para Q1. Vamos agendar reunião de fechamento.",
  },
  {
    id: "entry-3",
    type: "note",
    authorName: "Ana Souza",
    authorInitials: "AS",
    authorColor: "bg-brand-light text-brand",
    authorId: "user-1",
    timestamp: "2025-01-14T16:45:00",
    text: "Concorrente ofereceu preço 15% menor. Precisamos justificar nosso diferencial de suporte e implementação.",
  },
  {
    id: "entry-4",
    type: "comment",
    authorName: "Fernanda Reis",
    authorInitials: "FR",
    authorColor: "bg-status-warning-light text-status-warning",
    authorId: "user-3",
    timestamp: "2025-01-14T09:00:00",
    text: "@Ana Souza podemos incluir treinamento grátis na proposta para diferenciar? Já fizemos isso com a TechCorp e deu certo.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} às ${time}`;
}

// ---------------------------------------------------------------------------
// Entry Component
// ---------------------------------------------------------------------------

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: NoteEntry;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOwn = entry.authorId === CURRENT_USER_ID;

  return (
    <div className="group flex gap-3 rounded-[15px] p-3 transition-colors hover:bg-zinc-50">
      {/* Avatar */}
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback className={`text-[10px] ${entry.authorColor}`}>
          {entry.authorInitials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm font-semibold text-black">
            {entry.authorName}
          </span>
          {/* Type icon */}
          {entry.type === "note" ? (
            <div className="flex items-center gap-1 rounded-[10px] bg-zinc-100 px-1.5 py-0.5">
              <Lock className="h-3 w-3 text-zinc-400" />
              <span className="font-body text-[10px] text-zinc-400">
                Privado
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-[10px] bg-brand-light px-1.5 py-0.5">
              <Globe className="h-3 w-3 text-brand" />
              <span className="font-body text-[10px] text-brand">
                Público
              </span>
            </div>
          )}
          <span className="font-body text-xs text-zinc-400">
            {formatTimestamp(entry.timestamp)}
          </span>
        </div>

        <p className="mt-1.5 font-body text-sm leading-relaxed text-zinc-600">
          {entry.text}
        </p>

        {/* Actions (only for own entries) */}
        {isOwn && (
          <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit(entry.id)}
              className="flex items-center gap-1 rounded-full px-2 py-1 font-body text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="flex items-center gap-1 rounded-full px-2 py-1 font-body text-xs text-zinc-400 transition-colors hover:bg-status-danger-light hover:text-status-danger"
            >
              <Trash2 className="h-3 w-3" />
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotesPanel() {
  const [activeTab, setActiveTab] = useState<"notes" | "comments">("notes");
  const [entries, setEntries] = useState<NoteEntry[]>(mockEntries);
  const [newEntryText, setNewEntryText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredEntries = entries.filter((entry) =>
    activeTab === "notes" ? entry.type === "note" : entry.type === "comment"
  );

  const handleAdd = useCallback(() => {
    if (!newEntryText.trim()) return;

    if (editingId) {
      // Update existing entry
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingId ? { ...e, text: newEntryText.trim() } : e
        )
      );
      setEditingId(null);
      setNewEntryText("");
      setIsAdding(false);
      return;
    }

    const newEntry: NoteEntry = {
      id: `entry-${Date.now()}`,
      type: activeTab === "notes" ? "note" : "comment",
      authorName: "Ana Souza",
      authorInitials: "AS",
      authorColor: "bg-brand-light text-brand",
      authorId: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      text: newEntryText.trim(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setNewEntryText("");
    setIsAdding(false);
  }, [newEntryText, activeTab, editingId]);

  const handleEdit = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    setNewEntryText(entry.text);
    setEditingId(id);
    setIsAdding(true);
  }, [entries]);

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const notesCount = entries.filter((e) => e.type === "note").length;
  const commentsCount = entries.filter((e) => e.type === "comment").length;

  return (
    <div className="flex h-full flex-col">
      {/* Tab toggle */}
      <div className="flex items-center gap-1 rounded-[15px] bg-zinc-100 p-1">
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-2 font-heading text-sm font-medium transition-all ${
            activeTab === "notes"
              ? "bg-white text-black shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          Notas
          <span
            className={`rounded-[10px] px-1.5 py-0.5 text-xs ${
              activeTab === "notes"
                ? "bg-zinc-100 text-zinc-600"
                : "bg-zinc-200/50 text-zinc-400"
            }`}
          >
            {notesCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-2 font-heading text-sm font-medium transition-all ${
            activeTab === "comments"
              ? "bg-white text-black shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          Comentários
          <span
            className={`rounded-[10px] px-1.5 py-0.5 text-xs ${
              activeTab === "comments"
                ? "bg-zinc-100 text-zinc-600"
                : "bg-zinc-200/50 text-zinc-400"
            }`}
          >
            {commentsCount}
          </span>
        </button>
      </div>

      {/* Description */}
      <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-zinc-50 px-3 py-2">
        {activeTab === "notes" ? (
          <>
            <Lock className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-body text-xs text-zinc-500">
              Notas privadas — visíveis somente para você
            </span>
          </>
        ) : (
          <>
            <Globe className="h-3.5 w-3.5 text-brand" />
            <span className="font-body text-xs text-zinc-500">
              Comentários — visíveis para toda a equipe
            </span>
          </>
        )}
      </div>

      {/* Entries list */}
      <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            {activeTab === "notes" ? (
              <Lock className="mb-2 h-8 w-8" />
            ) : (
              <Globe className="mb-2 h-8 w-8" />
            )}
            <p className="font-body text-sm">
              {activeTab === "notes"
                ? "Nenhuma nota ainda"
                : "Nenhum comentário ainda"}
            </p>
          </div>
        )}
      </div>

      {/* Add new entry */}
      <div className="mt-4 border-t border-zinc-100 pt-4">
        {isAdding ? (
          <div className="space-y-3">
            <MentionInput
              value={newEntryText}
              onChange={setNewEntryText}
              placeholder={
                activeTab === "notes"
                  ? "Escreva uma nota privada..."
                  : "Escreva um comentário para a equipe..."
              }
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewEntryText("");
                  setEditingId(null);
                }}
                className="rounded-full font-heading"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!newEntryText.trim()}
                className="rounded-full bg-black font-heading text-white hover:bg-zinc-800"
              >
                {editingId ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full rounded-[15px] border-dashed font-heading"
          >
            <Plus className="h-4 w-4" />
            Adicionar {activeTab === "notes" ? "nota" : "comentário"}
          </Button>
        )}
      </div>
    </div>
  );
}
