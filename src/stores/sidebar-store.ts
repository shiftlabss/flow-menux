import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isExpanded: boolean;
  toggle: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isExpanded: true,
      toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setExpanded: (isExpanded) => set({ isExpanded }),
    }),
    {
      name: "flow-sidebar",
    }
  )
);
