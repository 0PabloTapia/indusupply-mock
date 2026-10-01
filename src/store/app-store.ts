"use client";

import { create } from "zustand";

interface AppStore {
  revision: number;
  bump: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  revision: 0,
  bump: () => set((s) => ({ revision: s.revision + 1 })),
}));
