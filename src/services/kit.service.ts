"use client";

import { getDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";

export const kitService = {
  async list() {
    await randomDelay(200, 400);
    const db = getDatabase();
    return db.kits.map((kit) => {
      const avail = kit.components.map((c) => {
        const p = db.products.find((x) => x.id === c.productId);
        const stock = p?.stock ?? 0;
        return Math.floor(stock / c.quantity);
      });
      const kitStock = avail.length ? Math.min(...avail) : 0;
      return { kit, kitStock, componentAvailability: avail };
    });
  },
};
