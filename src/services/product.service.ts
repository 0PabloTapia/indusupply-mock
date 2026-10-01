"use client";

import { getDatabase, patchDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";
import type { Compatibility, Product, ProductStatus } from "@/types";

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  stock?: "all" | "low" | "ok";
  status?: ProductStatus | "all";
}

function notify() {
  useAppStore.getState().bump();
}

export const productService = {
  async list(filters: ProductFilters = {}): Promise<Product[]> {
    await randomDelay(200, 500);
    let items = [...getDatabase().products];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.manufacturerCode.toLowerCase().includes(q) ||
          (p.oem?.toLowerCase().includes(q) ?? false),
      );
    }
    if (filters.category && filters.category !== "all") {
      items = items.filter((p) => p.category === filters.category);
    }
    if (filters.brand && filters.brand !== "all") {
      items = items.filter((p) => p.brand === filters.brand);
    }
    if (filters.stock === "low") {
      items = items.filter((p) => p.stock <= p.minStock);
    }
    if (filters.status && filters.status !== "all") {
      items = items.filter((p) => p.status === filters.status);
    }
    return items;
  },

  async getById(id: string): Promise<Product | undefined> {
    await randomDelay(150, 350);
    return getDatabase().products.find((p) => p.id === id);
  },

  async getCompatibilities(productId: string): Promise<Compatibility[]> {
    await randomDelay(150, 350);
    return getDatabase().compatibilities.filter((c) => c.productId === productId);
  },

  async addCompatibility(
    productId: string,
    data: Omit<Compatibility, "id" | "productId">,
  ): Promise<Compatibility> {
    await randomDelay(400, 700);
    const compat: Compatibility = {
      id: `compat-${Date.now()}`,
      productId,
      ...data,
    };
    patchDatabase((db) => {
      db.compatibilities.push(compat);
      db.audit.unshift({
        id: `aud-${Date.now()}`,
        user: "Pablo",
        action: "Agregó compatibilidad",
        detail: `${db.products.find((p) => p.id === productId)?.sku} · ${data.equipmentBrand} ${data.model}`,
        createdAt: new Date().toISOString(),
      });
    });
    notify();
    return compat;
  },

  async create(product: Omit<Product, "id" | "createdAt" | "status">): Promise<Product> {
    await randomDelay(500, 900);
    const created: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      status: product.stock <= product.minStock ? "low_stock" : "active",
      createdAt: new Date().toISOString(),
    };
    patchDatabase((db) => {
      db.products.push(created);
      db.audit.unshift({
        id: `aud-${Date.now()}`,
        user: "Sergio",
        action: "Creó producto",
        detail: created.sku,
        createdAt: new Date().toISOString(),
      });
    });
    notify();
    return created;
  },

  async countsForProduct(productId: string) {
    const db = getDatabase();
    return {
      compatibilities: db.compatibilities.filter((c) => c.productId === productId).length,
      listings: db.listings.filter((l) => l.productId === productId).length,
    };
  },

  categories(): string[] {
    return [...new Set(getDatabase().products.map((p) => p.category))].sort();
  },

  brands(): string[] {
    return [...new Set(getDatabase().products.map((p) => p.brand))].sort();
  },
};
