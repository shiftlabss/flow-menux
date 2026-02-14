"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  CalendarCheck,
  Trophy,
  XCircle,
  HeartCrack,
  Target,
  AtSign,
  Bell,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { mockNotifications } from "@/lib/mock-data";
import type { NotificationType } from "@/types";

const notificationIcons: Record<NotificationType, React.ElementType> = {
  "sla-warning": AlertTriangle,
  "sla-breach": AlertOctagon,
  "activity-due": CalendarCheck,
  "opportunity-won": Trophy,
  "opportunity-lost": XCircle,
  "client-health-drop": HeartCrack,
  "goal-achieved": Target,
  mention: AtSign,
  system: Bell,
};

const notificationIconColors: Record<NotificationType, string> = {
  "sla-warning": "text-status-warning",
  "sla-breach": "text-status-danger",
  "activity-due": "text-status-info",
  "opportunity-won": "text-status-success",
  "opportunity-lost": "text-status-danger",
  "client-health-drop": "text-status-warning",
  "goal-achieved": "text-status-success",
  mention: "text-brand",
  system: "text-zinc-500",
};

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `${diffMinutes}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays}d atrás`;
  return `${Math.floor(diffDays / 7)}sem atrás`;
}

export function NotificationsDropdown() {
  const { isNotificationsOpen, setNotificationsOpen } = useUIStore();
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <Popover open={isNotificationsOpen} onOpenChange={setNotificationsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-zinc-600"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-status-danger" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] max-w-[calc(100vw-2rem)] rounded-[15px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h3 className="font-heading text-base font-semibold text-black">
            Notificações
          </h3>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="font-body text-xs text-brand hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Marcar todas como lidas
          </button>
        </div>

        {/* Notifications list */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Bell className="mb-2 h-8 w-8" />
              <span className="font-body text-sm">Nenhuma notificação</span>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const iconColor = notificationIconColors[notification.type];

                return (
                  <div
                    key={notification.id}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-zinc-50"
                  >
                    {/* Icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-body text-sm font-medium text-black">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                        )}
                      </div>
                      <p className="mt-0.5 font-body text-xs text-zinc-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 font-body text-xs text-zinc-400">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 px-4 py-2.5 text-center">
          <span className="font-body text-sm text-zinc-400">
            Página de notificações em breve
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
