"use client";

import { getDatabase, patchDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";
import type { MarketplaceListing } from "@/types";

function notify() {
  useAppStore.getState().bump();
}

export interface PublishInput {
  productId: string;
  compatibilityId?: string;
  title: string;
  price: number;
  simulateError?: boolean;
}

export const marketplaceService = {
  async getListings(): Promise<MarketplaceListing[]> {
    await randomDelay(300, 600);
    return getDatabase().listings;
  },

  async publish(input: PublishInput): Promise<{ ok: boolean; listing?: MarketplaceListing; error?: string }> {
    await randomDelay(800, 1200);
    if (input.simulateError) {
      return {
        ok: false,
        error: 'Mercado Libre requiere completar el atributo "diámetro"',
      };
    }
    const db = getDatabase();
    const product = db.products.find((p) => p.id === input.productId);
    if (!product) return { ok: false, error: "Producto no encontrado" };
    const listing: MarketplaceListing = {
      id: `list-${Date.now()}`,
      mlId: `MLB-${92849000 + Math.floor(Math.random() * 9999)}`,
      productId: input.productId,
      compatibilityId: input.compatibilityId,
      title: input.title,
      price: input.price,
      stock: product.stock,
      mlStock: product.stock,
      status: "synced",
      lastSyncAt: new Date().toISOString(),
    };
    patchDatabase((d) => {
      d.listings.unshift(listing);
      d.activity.unshift({
        id: `act-${Date.now()}`,
        message: "Publicación creada en Mercado Libre",
        createdAt: new Date().toISOString(),
      });
    });
    notify();
    return { ok: true, listing };
  },

  async sync(): Promise<{ updated: number; needsReview: number }> {
    await randomDelay(1000, 1500);
    let updated = 0;
    let needsReview = 0;
    patchDatabase((db) => {
      db.lastMlSyncAt = new Date().toISOString();
      db.listings.forEach((l) => {
        const product = db.products.find((p) => p.id === l.productId);
        if (!product) return;
        if (l.status === "error") {
          needsReview++;
          return;
        }
        l.stock = product.stock;
        if (l.mlStock !== product.stock) {
          l.mlStock = product.stock;
          l.status = "synced";
          updated++;
        }
      });
      db.audit.unshift({
        id: `aud-${Date.now()}`,
        user: "Sistema",
        action: "Sincronizó Mercado Libre",
        detail: `${updated} publicaciones actualizadas`,
        createdAt: new Date().toISOString(),
      });
    });
    notify();
    return { updated: updated || 3, needsReview: needsReview || 1 };
  },

  lastSyncAt(): string | undefined {
    return getDatabase().lastMlSyncAt;
  },
};
