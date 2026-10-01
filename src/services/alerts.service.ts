"use client";

import { getDatabase, patchDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";

function notify() {
  useAppStore.getState().bump();
}

export const alertsService = {
  async list() {
    await randomDelay(200, 400);
    return getDatabase().alerts.filter((a) => !a.resolved);
  },

  async fixStockMismatch(): Promise<void> {
    await randomDelay(500, 800);
    patchDatabase((db) => {
      const gates = db.products.find((p) => p.sku === "GAT-A42");
      if (gates) {
        db.listings
          .filter((l) => l.productId === gates.id)
          .forEach((l) => {
            l.mlStock = gates.stock;
            l.stock = gates.stock;
            l.status = "synced";
          });
      }
      const alert = db.alerts.find((a) => a.type === "stock_mismatch");
      if (alert) alert.resolved = true;
      db.activity.unshift({
        id: `act-${Date.now()}`,
        message: "Stock ML corregido · Correa Gates A42",
        createdAt: new Date().toISOString(),
      });
    });
    notify();
  },

  async associateOrphanListing(): Promise<void> {
    await randomDelay(500, 800);
    patchDatabase((db) => {
      const product = db.products.find((p) => p.sku === "SKF-6204");
      if (product) {
        db.listings.push({
          id: `list-orphan-fix`,
          mlId: "MLB-285839",
          productId: product.id,
          title: `${product.name} (asociada)`,
          price: Math.round(product.price * 1.25),
          stock: product.stock,
          mlStock: product.stock,
          status: "synced",
          lastSyncAt: new Date().toISOString(),
        });
      }
      const alert = db.alerts.find((a) => a.type === "orphan_listing");
      if (alert) alert.resolved = true;
    });
    notify();
  },

  async reviewDuplicate(): Promise<void> {
    await randomDelay(400, 600);
    patchDatabase((db) => {
      const alert = db.alerts.find((a) => a.type === "duplicate_product");
      if (alert) alert.resolved = true;
      db.audit.unshift({
        id: `aud-${Date.now()}`,
        user: "Pablo",
        action: "Revisó duplicado",
        detail: "SKF 6204 · sin acción requerida",
        createdAt: new Date().toISOString(),
      });
    });
    notify();
  },

  async acknowledgeLowStock(): Promise<void> {
    await randomDelay(300, 500);
    patchDatabase((db) => {
      const alert = db.alerts.find((a) => a.type === "low_stock");
      if (alert) alert.resolved = true;
    });
    notify();
  },

  async acknowledgePendingInvoice(): Promise<void> {
    await randomDelay(300, 500);
    patchDatabase((db) => {
      const alert = db.alerts.find((a) => a.type === "pending_invoice");
      if (alert) alert.resolved = true;
    });
    notify();
  },
};
