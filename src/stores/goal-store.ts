import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Goal } from "@/types";
import { mockGoals } from "@/lib/mock-data";

interface GoalState {
  goals: Goal[];

  // CRUD
  addGoal: (data: Omit<Goal, "id">) => Goal;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalState>()(
  devtools(
    (set) => ({
      goals: mockGoals,

      addGoal: (data) => {
        const newGoal: Goal = {
          ...data,
          id: `goal-${Date.now()}`,
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
        return newGoal;
      },

      updateGoal: (id, data) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
    }),
    { name: "goal-store" }
  )
);
