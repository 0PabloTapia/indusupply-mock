"use client";

import { getDatabase, patchDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";

function notify() {
  useAppStore.getState().bump();
}

export const billingService = {
  async list() {
    await randomDelay(200, 400);
    const db = getDatabase();
    return db.billing.map((b) => {
      const sale = db.sales.find((s) => s.id === b.saleId);
      return { ...b, sale };
    });
  },

  async issueDocument(billingId: string) {
    await randomDelay(800, 800);
    patchDatabase((db) => {
      const doc = db.billing.find((b) => b.id === billingId);
      if (!doc) return;
      doc.status = "accepted";
      doc.number = `184${Math.floor(Math.random() * 90 + 10)}`;
      doc.issuedAt = new Date().toISOString();
      const sale = db.sales.find((s) => s.id === doc.saleId);
      if (sale && sale.status === "pending_invoice") {
        sale.status = "pending_label";
      }
    });
    notify();
    return { number: getDatabase().billing.find((b) => b.id === billingId)?.number };
  },
};
