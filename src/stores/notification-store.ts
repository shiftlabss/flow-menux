import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Notification } from "@/types";
import { mockNotifications } from "@/lib/mock-data";

interface NotificationState {
  notifications: Notification[];

  // Actions
  addNotification: (data: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Computed
  getUnread: () => Notification[];
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: mockNotifications,

      addNotification: (data) =>
        set((state) => ({
          notifications: [
            {
              ...data,
              id: `notif-${Date.now()}`,
              createdAt: new Date().toISOString(),
              isRead: false,
            },
            ...state.notifications,
          ],
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      getUnread: () => get().notifications.filter((n) => !n.isRead),
      getUnreadCount: () => get().notifications.filter((n) => !n.isRead).length,
    }),
    { name: "notification-store" }
  )
);
