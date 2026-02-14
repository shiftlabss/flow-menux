import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Client, ClientStage } from "@/types";
import { mockClients } from "@/lib/mock-data";

interface ClientState {
  clients: Client[];
  isLoading: boolean;

  // CRUD
  addClient: (data: Omit<Client, "id" | "createdAt" | "updatedAt">) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Stage management
  moveToStage: (id: string, stage: ClientStage) => void;

  // Computed
  getById: (id: string) => Client | undefined;
  getByStage: (stage: ClientStage) => Client[];
}

export const useClientStore = create<ClientState>()(
  devtools(
    (set, get) => ({
      clients: mockClients,
      isLoading: false,

      addClient: (data) => {
        const newClient: Client = {
          ...data,
          id: `client-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          clients: [...state.clients, newClient],
        }));
        return newClient;
      },

      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((cli) =>
            cli.id === id
              ? { ...cli, ...data, updatedAt: new Date().toISOString() }
              : cli
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((cli) => cli.id !== id),
        })),

      moveToStage: (id, stage) =>
        set((state) => ({
          clients: state.clients.map((cli) =>
            cli.id === id
              ? { ...cli, stage, updatedAt: new Date().toISOString() }
              : cli
          ),
        })),

      getById: (id) => get().clients.find((c) => c.id === id),
      getByStage: (stage) => get().clients.filter((c) => c.stage === stage),
    }),
    { name: "client-store" }
  )
);
