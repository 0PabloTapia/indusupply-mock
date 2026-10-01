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
      if (query.series && !c.series.toLowerCase().includes(query.series.toLowerCase())) return false;
      return true;
    });
    const byProduct = new Map<string, string>();
    matches.forEach((m) => {
      byProduct.set(m.productId, `${m.equipmentBrand} ${m.model}`);
    });
    return [...byProduct.entries()].map(([productId, match]) => ({
      product: db.products.find((p) => p.id === productId)!,
      match,
    }));
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
