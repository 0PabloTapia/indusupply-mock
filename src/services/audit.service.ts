"use client";

import { getDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";

export const auditService = {
  async list(limit = 50) {
    await randomDelay(200, 400);
    return getDatabase()
      .audit.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },
};
