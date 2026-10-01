"use client";

import { patchDatabase, getDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";

function notify() {
  useAppStore.getState().bump();
}

export const shippingService = {
  async pendingLabels() {
    await randomDelay(200, 400);
    return getDatabase().labels.filter((l) => l.status === "pending");
  },

  async printLabel(labelId: string) {
    await randomDelay(600, 900);
    patchDatabase((db) => {
      const label = db.labels.find((l) => l.id === labelId);
      if (label) label.status = "printed";
      const sale = db.sales.find((s) => s.id === label?.saleId);
      if (sale) sale.status = "completed";
    });
    notify();
    return { printer: "Zebra ZD420" };
  },
};
