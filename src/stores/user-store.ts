import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TeamUser } from "@/types";
import { mockUsers } from "@/lib/mock-data";

interface UserState {
  users: TeamUser[];

  // CRUD
  addUser: (data: Omit<TeamUser, "id" | "createdAt">) => TeamUser;
  updateUser: (id: string, data: Partial<TeamUser>) => void;
  deactivateUser: (id: string) => void;
  activateUser: (id: string) => void;

  // Computed
  getById: (id: string) => TeamUser | undefined;
  getActive: () => TeamUser[];
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      users: mockUsers,

      addUser: (data) => {
        const newUser: TeamUser = {
          ...data,
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
        return newUser;
      },

      updateUser: (id, data) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...data } : u
          ),
        })),

      deactivateUser: (id) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, isActive: false } : u
          ),
        })),

      activateUser: (id) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, isActive: true } : u
          ),
        })),

      getById: (id) => get().users.find((u) => u.id === id),
      getActive: () => get().users.filter((u) => u.isActive),
    }),
    { name: "user-store" }
  )
);
