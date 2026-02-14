"use client";

// ============================================================================
// Menux Intelligence — Message Component (Premium Redesign)
// WhatsApp-style bubbles with grouping, Markdown, copyable blocks and actions
// Ref: docs/Menux Intelligence.md — seções 2.2.2, 6.1, 6.2
// ============================================================================

import { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  X,
  Calendar,
  FileText,
  RefreshCw,
  Eye,
  MessageSquare,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import type {
  Message,
  CopyableBlock,
  SuggestedAction,
  ContextBadge,
} from "@/types/intelligence";
import { useIntelligenceStore } from "@/stores/intelligence-store";

// ─── Context Badge — seção 4.1.2 ────────────────────────────────────────

function MessageContextBadge({ badge }: { badge: ContextBadge }) {
  const tempEmoji =
    badge.temperature === "hot"
      ? "🔥"
      : badge.temperature === "warm"
        ? "🌡️"
        : "❄️";
  const tempLabel =
    badge.temperature === "hot"
      ? "Quente"
      : badge.temperature === "warm"
        ? "Morno"
        : "Frio";

  return (
    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700/40 dark:text-slate-400">
      <span>📋</span>
      <span>
        Baseado no card: <strong>{badge.cardName}</strong> ({badge.stage} ·{" "}
        {tempEmoji} {tempLabel})
      </span>
    </div>
  );
}

// ─── Copyable Block — seção 6.1 ─────────────────────────────────────────

function CopyableBlockComponent({ block }: { block: CopyableBlock }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [editedContent, setEditedContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);

  const charCount = editedContent.length;
  const overLimit = block.charLimit ? charCount > block.charLimit : false;

  const channelIcon =
    block.channel === "whatsapp" ? (
      <MessageSquare className="h-3.5 w-3.5" />
    ) : block.channel === "email" ? (
      <Mail className="h-3.5 w-3.5" />
    ) : block.channel === "call" ? (
      <Phone className="h-3.5 w-3.5" />
    ) : null;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  }, [editedContent]);

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/60 bg-white/80 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100/60 px-3 py-1.5 dark:border-slate-700/40">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {channelIcon}
          <span>{block.label ?? "Mensagem"}</span>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium transition-all duration-[120ms]",
            copied
              ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : copyError
                ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copiado
            </>
          ) : copyError ? (
            <>
              <X className="h-3 w-3" />
              Erro
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Content — edição inline (seção 6.1) */}
      <div className="p-3">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full resize-none rounded border-none bg-transparent font-body text-sm text-slate-700 outline-none dark:text-slate-300"
            rows={Math.min(editedContent.split("\n").length + 1, 8)}
            autoFocus
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="cursor-text whitespace-pre-wrap font-body text-sm leading-relaxed text-slate-700 dark:text-slate-300"
          >
            {editedContent}
          </p>
        )}
      </div>

      {/* Character counter */}
      {block.charLimit && (
        <div className="border-t border-slate-100/60 px-3 py-1 dark:border-slate-700/40">
          <p
            className={cn(
              "text-right text-[10px] font-medium",
              overLimit ? "text-red-500" : "text-slate-400"
            )}
          >
            {charCount}/{block.charLimit} caracteres
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Suggested Action Button — seção 6.2 ────────────────────────────────

function SuggestedActionButton({
  action,
  messageId,
}: {
  action: SuggestedAction;
  messageId: string;
}) {
  const { markActionExecuted, openClientPicker } = useIntelligenceStore();

  const iconMap: Record<string, React.ReactNode> = {
    calendar: <Calendar className="h-3.5 w-3.5" />,
    "file-text": <FileText className="h-3.5 w-3.5" />,
    "refresh-cw": <RefreshCw className="h-3.5 w-3.5" />,
    eye: <Eye className="h-3.5 w-3.5" />,
    users: <MessageSquare className="h-3.5 w-3.5" />,
  };

  const handleClick = () => {
    if (action.executed) return;

    // Handle "Escolher cliente" action — abre o modal D11
    if (action.payload?.action === "open-client-picker") {
      openClientPicker();
      markActionExecuted(messageId, action.id);
      return;
    }

    // Marcar como executada
    markActionExecuted(messageId, action.id);
  };

  return (
    <Button
      variant={action.type === "open-card" ? "ghost" : "secondary"}
      size="sm"
      onClick={handleClick}
      disabled={action.executed}
      className={cn(
        "h-7 gap-1.5 rounded-lg text-xs transition-all duration-[120ms]",
        action.executed && "opacity-50",
        !action.executed && "hover:translate-y-[-1px] hover:shadow-sm"
      )}
    >
      {action.executed ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        iconMap[action.icon] ?? null
      )}
      {action.label}
    </Button>
  );
}

// ─── Markdown Simple Renderer ───────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  const processInline = (line: string, key: string): React.ReactNode => {
    const parts = line.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("***") && part.endsWith("***")) {
        return (
          <strong key={`${key}-${i}`} className="italic">
            {part.slice(3, -3)}
          </strong>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={`${key}-${i}`}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={`${key}-${i}`}
            className="rounded bg-slate-100/80 px-1 py-0.5 font-mono text-[11px] text-purple-600 dark:bg-slate-700/60 dark:text-purple-400"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={`${key}-${i}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-500 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      inTable = false;
      const [header, ...body] = tableRows;
      elements.push(
        <div
          key={`table-${tableKey++}`}
          className="my-2 overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm dark:border-slate-700/60"
        >
          <table className="w-full text-xs">
            {header && (
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-800/40">
                  {header.map((cell, ci) => (
                    <th
                      key={ci}
                      className="px-2.5 py-1.5 text-left font-semibold text-slate-600 dark:text-slate-400"
                    >
                      {processInline(cell, `th-${tableKey}-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-slate-100/40 last:border-0 dark:border-slate-700/30"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400"
                    >
                      {processInline(cell, `td-${tableKey}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="mb-1 mt-3 font-heading text-xs font-bold text-slate-800 dark:text-slate-200"
        >
          {processInline(trimmed.slice(4), `h4i-${i}`)}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mb-1 mt-3 font-heading text-sm font-bold text-slate-800 dark:text-slate-200"
        >
          {processInline(trimmed.slice(3), `h3i-${i}`)}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mb-1.5 mt-3 font-heading text-sm font-bold text-slate-900 dark:text-slate-100"
        >
          {processInline(trimmed.slice(2), `h2i-${i}`)}
        </h2>
      );
    }
    // List items
    else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const indent = line.search(/\S/);
      elements.push(
        <div
          key={`li-${i}`}
          className="flex gap-1.5"
          style={{ paddingLeft: `${Math.max(0, indent * 4)}px` }}
        >
          <span className="mt-1 shrink-0 text-slate-400">•</span>
          <span>{processInline(trimmed.slice(2), `lii-${i}`)}</span>
        </div>
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={`ol-${i}`} className="flex gap-1.5">
            <span className="shrink-0 font-medium text-slate-500">
              {match[1]}.
            </span>
            <span>{processInline(match[2], `oli-${i}`)}</span>
          </div>
        );
      }
    }
    // Horizontal rule
    else if (trimmed === "---" || trimmed === "***") {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-2 border-slate-200/60 dark:border-slate-700/60"
        />
      );
    }
    // Empty line
    else if (trimmed === "") {
      elements.push(<div key={`br-${i}`} className="h-1.5" />);
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={`p-${i}`}>{processInline(trimmed, `pi-${i}`)}</p>
      );
    }
  }

  // Flush remaining table
  if (inTable && tableRows.length > 0) {
    const [header, ...body] = tableRows;
    elements.push(
      <div
        key={`table-final`}
        className="my-2 overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm dark:border-slate-700/60"
      >
        <table className="w-full text-xs">
          {header && (
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-800/40">
                {header.map((cell, ci) => (
                  <th
                    key={ci}
                    className="px-2.5 py-1.5 text-left font-semibold text-slate-600 dark:text-slate-400"
                  >
                    {processInline(cell, `thf-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-slate-100/40 last:border-0 dark:border-slate-700/30"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-2.5 py-1.5 text-slate-600 dark:text-slate-400"
                  >
                    {processInline(cell, `tdf-${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return elements;
}

// ─── Message Component ──────────────────────────────────────────────────

interface IntelligenceMessageProps {
  message: Message;
  /** Se true, esconde ações e blocos copiáveis (modo histórico) — seção 7.2 */
  isReadOnly?: boolean;
  /** Se true, esta mensagem está agrupada (não é a primeira do grupo) */
  isGrouped?: boolean;
  /** Se true, esta mensagem é a última do grupo (mostra timestamp) */
  isLastInGroup?: boolean;
}

export const IntelligenceMessage = memo(function IntelligenceMessage({
  message,
  isReadOnly = false,
  isGrouped = false,
  isLastInGroup = true,
}: IntelligenceMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, ease: [0, 0, 0.2, 1] }}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        // Tighter spacing for grouped messages
        isGrouped ? "mt-0.5" : "mt-2"
      )}
    >
      <div
        className={cn(
          "px-3.5 py-2.5",
          isUser
            ? cn(
                "max-w-[80%]",
                "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
                "shadow-sm shadow-blue-500/15",
                // WhatsApp-style bubble radius
                isGrouped
                  ? "rounded-[18px] rounded-tr-[6px]"
                  : "rounded-[18px] rounded-tr-[6px]"
              )
            : cn(
                "max-w-[90%]",
                "bg-slate-100/80 text-slate-700",
                "dark:bg-slate-800/40 dark:text-slate-300",
                "shadow-sm shadow-slate-200/30 dark:shadow-slate-900/20",
                // WhatsApp-style bubble radius
                isGrouped
                  ? "rounded-[18px] rounded-tl-[6px]"
                  : "rounded-[18px] rounded-tl-[6px]"
              )
        )}
      >
        {/* Context badge */}
        {!isUser && message.contextBadge && (
          <MessageContextBadge badge={message.contextBadge} />
        )}

        {/* Content */}
        <div
          className={cn(
            "font-body text-[13px] leading-relaxed",
            isUser
              ? "[&_strong]:font-semibold"
              : "[&_strong]:font-semibold [&_code]:text-purple-600 dark:[&_code]:text-purple-400"
          )}
        >
          {isUser ? message.content : renderMarkdown(message.content)}
        </div>

        {/* Copyable blocks — seção 6.1 */}
        {!isUser && message.copyableBlocks && message.copyableBlocks.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.copyableBlocks.map((block) => (
              <CopyableBlockComponent key={block.id} block={block} />
            ))}
          </div>
        )}

        {/* Suggested actions — seção 6.2 */}
        {!isUser && !isReadOnly && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {message.suggestedActions.map((action) => (
              <SuggestedActionButton
                key={action.id}
                action={action}
                messageId={message.id}
              />
            ))}
          </div>
        )}

        {/* Timestamp — only on last message in group */}
        {isLastInGroup && (
          <p
            className={cn(
              "mt-1 text-[10px]",
              isUser ? "text-blue-200" : "text-slate-400"
            )}
          >
            {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
});
