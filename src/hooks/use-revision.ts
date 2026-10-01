"use client";

import { useAppStore } from "@/store/app-store";

export function useRevision(): number {
  return useAppStore((s) => s.revision);
}
