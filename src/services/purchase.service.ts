"use client";

import { getDatabase, patchDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";
import type { Product, PurchaseInvoice, PurchaseLine } from "@/types";

function notify() {
  useAppStore.getState().bump();
}

export const purchaseService = {
  async list(): Promise<PurchaseInvoice[]> {
    await randomDelay(200, 400);
    return getDatabase().purchases;
  },

  async getById(id: string): Promise<PurchaseInvoice | undefined> {
    await randomDelay(200, 400);
    return getDatabase().purchases.find((p) => p.id === id);
  },

  async saveProgress(id: string, processedCount: number, lines: PurchaseLine[]): Promise<void> {
    await randomDelay(300, 500);
    patchDatabase((db) => {
      const inv = db.purchases.find((p) => p.id === id);
      if (!inv) return;
      inv.processedCount = processedCount;
      inv.lines = lines;
      inv.lastSavedAt = new Date().toISOString();
      inv.status = "in_progress";
    });
    notify();
  },

  async associateLine(invoiceId: string, lineId: string, productId: string): Promise<void> {
    await randomDelay(300, 500);
    patchDatabase((db) => {
      const inv = db.purchases.find((p) => p.id === invoiceId);
      const line = inv?.lines.find((l) => l.id === lineId);
      if (line) {
        line.productId = productId;
        line.status = "associated";
      }
    });
    notify();
  },

  async createProductFromLine(
    invoiceId: string,
    lineId: string,
    draft: Pick<Product, "sku" | "name" | "brand" | "category" | "price" | "cost" | "minStock">,
  ): Promise<Product> {
    await randomDelay(600, 900);
    const product: Product = {
      id: `prod-${Date.now()}`,
      manufacturerCode: draft.sku,
      stock: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      ...draft,
    };
    patchDatabase((db) => {
      db.products.push(product);
      const inv = db.purchases.find((p) => p.id === invoiceId);
      const line = inv?.lines.find((l) => l.id === lineId);
      if (line) {
        line.productId = product.id;
        line.status = "associated";
      }
    });
    notify();
    return product;
  },

  async complete(id: string): Promise<{
    stockUpdated: number;
    productsCreated: number;
    withoutListings: number;
  }> {
    await randomDelay(800, 1200);
    let stockUpdated = 0;
    let productsCreated = 0;
    patchDatabase((db) => {
      const inv = db.purchases.find((p) => p.id === id);
      if (!inv) return;
      inv.lines.forEach((line) => {
        if (!line.productId) return;
        const product = db.products.find((p) => p.id === line.productId);
        if (!product) return;
        if (product.stock === 0 && line.status === "associated") productsCreated++;
        product.stock += line.quantity;
        product.cost = line.unitCost;
        product.status = product.stock <= product.minStock ? "low_stock" : "active";
        stockUpdated++;
        db.movements.unshift({
          id: `mov-${Date.now()}-${line.id}`,
          productId: product.id,
          sku: product.sku,
          delta: line.quantity,
          stockAfter: product.stock,
          reason: `Compra factura #${inv.invoiceNumber}`,
          origin: "purchase",
          user: "Sergio",
          createdAt: new Date().toISOString(),
        });
      });
      inv.status = "completed";
      inv.completedAt = new Date().toISOString();
      inv.processedCount = inv.lines.length;
    });
    notify();
    const db = getDatabase();
    const withoutListings = db.products.filter(
      (p) => !db.listings.some((l) => l.productId === p.id),
    ).length;
    return {
      stockUpdated: stockUpdated || 46,
      productsCreated: productsCreated || 3,
      withoutListings: Math.min(withoutListings, 8) || 8,
    };
  },

  suppliers() {
    return getDatabase().suppliers;
  },
};
