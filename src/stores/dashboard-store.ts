import { create } from 'zustand'

export type Period = 'today' | '7d' | '30d' | 'quarter'
export type Context = 'me' | 'team'

interface DashboardState {
  period: Period
  context: Context
  setPeriod: (period: Period) => void
  setContext: (context: Context) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  period: 'today',
  context: 'me',
  setPeriod: (period) => set({ period }),
  setContext: (context) => set({ context }),
}))
