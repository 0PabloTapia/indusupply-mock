"use client";

import { create } from "zustand";
import { DEMO_TOUR_STEPS } from "@/config/demo-tour-steps";

interface DemoTourState {
  active: boolean;
  stepIndex: number;
  events: Set<string>;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  goToStep: (index: number) => void;
  signalEvent: (name: string) => void;
  clearEvents: () => void;
}

export const useDemoTourStore = create<DemoTourState>((set, get) => ({
  active: false,
  stepIndex: 0,
  events: new Set(),
  start: () =>
    set({ active: true, stepIndex: 0, events: new Set() }),
  stop: () => set({ active: false, stepIndex: 0, events: new Set() }),
  next: () => {
    const max = DEMO_TOUR_STEPS.length - 1;
    set((s) => ({ stepIndex: Math.min(s.stepIndex + 1, max) }));
  },
  prev: () => set((s) => ({ stepIndex: Math.max(s.stepIndex - 1, 0) })),
  goToStep: (index) =>
    set({ stepIndex: Math.max(0, Math.min(index, DEMO_TOUR_STEPS.length - 1)) }),
  signalEvent: (name) =>
    set((s) => {
      const events = new Set(s.events);
      events.add(name);
      return { events };
    }),
  clearEvents: () => set({ events: new Set() }),
}));

export function getDemoStep() {
  const { stepIndex, active } = useDemoTourStore.getState();
  if (!active) return null;
  return DEMO_TOUR_STEPS[stepIndex] ?? null;
}
