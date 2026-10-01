"use client";

import { getDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import type { Product } from "@/types";

export interface EquipmentSearch {
  equipmentBrand?: string;
  equipmentType?: string;
  model?: string;
  series?: string;
}

function seriesMatches(compatSeries: string, querySeries: string): boolean {
  const q = querySeries.trim().toLowerCase();
  if (!q) return true;
  const s = compatSeries.toLowerCase();
  if (s.includes(q)) return true;
  const year = parseInt(q.replace(/\D/g, ""), 10);
  if (!Number.isNaN(year) && year >= 1900 && year <= 2100) {
    const range = s.match(/(\d{4})\s*-\s*(\d{4})/);
    if (range) {
      const start = parseInt(range[1], 10);
      const end = parseInt(range[2], 10);
      return year >= start && year <= end;
    }
  }
  return false;
}

export const compatibilityService = {
  async searchByEquipment(query: EquipmentSearch): Promise<
    { product: Product; match: string }[]
  > {
    await randomDelay(400, 800);
    const db = getDatabase();
    const matches = db.compatibilities.filter((c) => {
      if (query.equipmentBrand && c.equipmentBrand !== query.equipmentBrand) return false;
      if (query.equipmentType && c.equipmentType !== query.equipmentType) return false;
      if (query.model && c.model !== query.model) return false;
      if (query.series && !seriesMatches(c.series, query.series)) return false;
      return true;
    });
    const byProduct = new Map<string, string>();
    matches.forEach((m) => {
      byProduct.set(m.productId, `${m.equipmentBrand} ${m.model}`);
    });
    const results = [...byProduct.entries()].map(([productId, match]) => ({
      product: db.products.find((p) => p.id === productId)!,
      match,
    }));
    results.sort((a, b) => {
      if (a.product.sku === "SKF-6204") return -1;
      if (b.product.sku === "SKF-6204") return 1;
      return a.product.name.localeCompare(b.product.name);
    });
    return results.filter((r) => r.product);
  },

  equipmentBrands(): string[] {
    return [...new Set(getDatabase().compatibilities.map((c) => c.equipmentBrand))].sort();
  },

  equipmentTypes(brand?: string): string[] {
    let comps = getDatabase().compatibilities;
    if (brand) comps = comps.filter((c) => c.equipmentBrand === brand);
    return [...new Set(comps.map((c) => c.equipmentType))].sort();
  },

  models(brand?: string, type?: string): string[] {
    let comps = getDatabase().compatibilities;
    if (brand) comps = comps.filter((c) => c.equipmentBrand === brand);
    if (type) comps = comps.filter((c) => c.equipmentType === type);
    return [...new Set(comps.map((c) => c.model))].sort();
  },
};
