import { create } from 'zustand'
import type { MealType } from '@/types/food'

interface UIStore {
  sidebarExpanded: boolean
  toggleSidebar: () => void
  activeMealTab: MealType
  setActiveMealTab: (tab: MealType) => void
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarExpanded: false,
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  activeMealTab: 'breakfast',
  setActiveMealTab: (tab) => set({ activeMealTab: tab }),
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}))
