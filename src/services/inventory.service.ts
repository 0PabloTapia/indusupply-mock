"use client";

import { getDatabase, patchDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";
import type { InventoryMovement, Product } from "@/types";

function notify() {
  useAppStore.getState().bump();
}

function applyStock(product: Product, delta: number) {
  product.stock = Math.max(0, product.stock + delta);
  product.status =
    product.stock <= 0
      ? "inactive"
      : product.stock <= product.minStock
        ? "low_stock"
        : "active";
}

export const inventoryService = {
  async listProducts(): Promise<Product[]> {
    await randomDelay(200, 400);
    return getDatabase().products;
  },

  async movements(limit = 100) {
    await randomDelay(200, 400);
    return getDatabase()
      .movements.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },

  async adjustStock(productId: string, delta: number, reason: string, user = "Sergio") {
    await randomDelay(400, 700);
    patchDatabase((db) => {
      const product = db.products.find((p) => p.id === productId);
      if (!product) return;
      applyStock(product, delta);
      db.listings
        .filter((l) => l.productId === productId)
        .forEach((l) => {
          l.stock = product.stock;
        });
      const mov: InventoryMovement = {
        id: `mov-${Date.now()}`,
        productId,
        sku: product.sku,
        delta,
        stockAfter: product.stock,
        reason,
        origin: "adjustment",
        user,
        createdAt: new Date().toISOString(),
      };
      db.movements.unshift(mov);
      db.activity.unshift({
        id: `act-${Date.now()}`,
        message: `Stock actualizado SKU ${product.sku}`,
        createdAt: new Date().toISOString(),
      });
    });
    notify();
  },
};
