"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  startTransition,
  type KeyboardEvent,
} from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Mock Team Members
// ---------------------------------------------------------------------------

const mockTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "Ana Souza",
    email: "ana@flow.com",
    initials: "AS",
    color: "bg-brand-light text-brand",
  },
  {
    id: "user-2",
    name: "Carlos Lima",
    email: "carlos@flow.com",
    initials: "CL",
    color: "bg-status-success-light text-status-success",
  },
  {
    id: "user-3",
    name: "Fernanda Reis",
    email: "fernanda@flow.com",
    initials: "FR",
    color: "bg-status-warning-light text-status-warning",
  },
  {
    id: "user-4",
    name: "Pedro Alves",
    email: "pedro@flow.com",
    initials: "PA",
    color: "bg-status-info-light text-status-info",
  },
  {
    id: "user-5",
    name: "Mariana Costa",
    email: "mariana@flow.com",
    initials: "MC",
    color: "bg-status-danger-light text-status-danger",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MentionInput({ value, onChange, placeholder }: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter team members based on query
  const filteredMembers = mentionQuery
    ? mockTeamMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : mockTeamMembers;

  // Detect "@" typing
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      onChange(newValue);

      // Find the last "@" before the cursor
      const textBeforeCursor = newValue.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show suggestions if there's no space in the mention query
        // or if it was just typed
        if (!textAfterAt.includes(" ") || textAfterAt.length === 0) {
          setShowSuggestions(true);
          setMentionQuery(textAfterAt);
          setMentionStartIndex(lastAtIndex);
          setSelectedIndex(0);
          return;
        }
      }

      setShowSuggestions(false);
      setMentionQuery("");
      setMentionStartIndex(-1);
    },
    [onChange]
  );

  // Select a mention
  const handleSelectMember = useCallback(
    (member: TeamMember) => {
      if (mentionStartIndex === -1) return;

      const cursorPos = textareaRef.current?.selectionStart || value.length;
      const beforeMention = value.slice(0, mentionStartIndex);
      const afterMention = value.slice(cursorPos);
      const newValue = `${beforeMention}@${member.name} ${afterMention}`;

      onChange(newValue);
      setShowSuggestions(false);
      setMentionQuery("");
      setMentionStartIndex(-1);

      // Focus back on textarea and place cursor after mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = mentionStartIndex + member.name.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [mentionStartIndex, value, onChange]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showSuggestions || filteredMembers.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredMembers.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredMembers.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          handleSelectMember(filteredMembers[selectedIndex]);
          break;
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    },
    [showSuggestions, filteredMembers, selectedIndex, handleSelectMember]
  );

  // Reset selection when filtered members change
  useEffect(() => {
    startTransition(() => {
      setSelectedIndex(0);
    });
  }, [mentionQuery]);

  // Render value with highlighted mentions
  const renderDisplayValue = () => {
    const parts = value.split(/(@\w+(?:\s\w+)?)/g);
    return parts.map((part, index) => {
      const memberMatch = mockTeamMembers.find(
        (m) => `@${m.name}` === part
      );
      if (memberMatch) {
        return (
          <span
            key={index}
            className="inline-flex items-center rounded-[10px] bg-brand-light px-1.5 py-0.5 font-body text-sm font-medium text-brand"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative">
      <Popover open={showSuggestions && filteredMembers.length > 0}>
        <PopoverAnchor asChild>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Digite sua mensagem... Use @ para mencionar"}
            className="min-h-[80px] w-full resize-none rounded-[15px] border border-zinc-200 bg-white px-4 py-3 font-body text-sm text-black placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
            rows={3}
          />
        </PopoverAnchor>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-[280px] max-w-[calc(100vw-2rem)] rounded-[15px] p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="py-1">
            <p className="mb-1 px-3 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Membros da equipe
            </p>
            {filteredMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => handleSelectMember(member)}
                className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-brand-light"
                    : "hover:bg-zinc-50"
                }`}
              >
                <Avatar size="sm">
                  <AvatarFallback className={`text-[10px] ${member.color}`}>
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium text-black">
                    {member.name}
                  </p>
                  <p className="truncate font-body text-xs text-zinc-400">
                    {member.email}
                  </p>
                </div>
              </button>
            ))}
            {filteredMembers.length === 0 && (
              <p className="px-3 py-4 text-center font-body text-sm text-zinc-400">
                Nenhum membro encontrado
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Mentions hint */}
      <div className="mt-1.5 flex items-center gap-1 px-1">
        <span className="font-body text-xs text-zinc-400">
          Use <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px]">@</kbd> para mencionar alguém
        </span>
      </div>
    </div>
  );
}
