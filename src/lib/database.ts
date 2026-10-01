"use client";

import { createSeedDatabase } from "@/fixtures/seed-data";
import type { AppDatabase } from "@/types";

const STORAGE_KEY = "indusupply-mock-v1";

let memory: AppDatabase | null = null;

function load(): AppDatabase {
  if (typeof window === "undefined") {
    return createSeedDatabase();
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AppDatabase;
    } catch {
      /* fall through */
    }
  }
  const seed = createSeedDatabase();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export function getDatabase(): AppDatabase {
  if (!memory) {
    memory = load();
  }
  return memory;
}

export function saveDatabase(db: AppDatabase): void {
  memory = db;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

export function resetDatabase(): AppDatabase {
  const seed = createSeedDatabase();
  saveDatabase(seed);
  return seed;
}

export function patchDatabase(mutator: (db: AppDatabase) => void): AppDatabase {
  const db = structuredClone(getDatabase());
  mutator(db);
  saveDatabase(db);
  return db;
}
