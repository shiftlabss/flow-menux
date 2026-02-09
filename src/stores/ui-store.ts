import { create } from "zustand";

export type DrawerType =
  | "lead-card"
  | "client-card"
  | "new-opportunity"
  | "new-activity"
  | "win-opportunity"
  | "lose-opportunity"
  | "filters"
  | null;

export type ModalType =
  | "invite-user"
  | "new-opportunity"
  | "new-activity"
  | "win-opportunity"
  | "lose-opportunity"
  | "confirm-delete"
  | "confirm-deactivate"
  | null;

interface UIState {
  // Drawer state
  drawerType: DrawerType;
  drawerData: Record<string, unknown> | null;
  openDrawer: (type: DrawerType, data?: Record<string, unknown>) => void;
  closeDrawer: () => void;

  // Modal state
  modalType: ModalType;
  modalData: Record<string, unknown> | null;
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Global search
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Notifications
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  drawerType: null,
  drawerData: null,
  openDrawer: (drawerType, drawerData) =>
    set({ drawerType, drawerData: drawerData ?? null }),
  closeDrawer: () => set({ drawerType: null, drawerData: null }),

  modalType: null,
  modalData: null,
  openModal: (modalType, modalData) => set({ modalType, modalData: modalData ?? null }),
  closeModal: () => set({ modalType: null, modalData: null }),

  isSearchOpen: false,
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),

  isNotificationsOpen: false,
  setNotificationsOpen: (isNotificationsOpen) => set({ isNotificationsOpen }),
}));
