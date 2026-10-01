"use client";

import { getDatabase, patchDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";
import { useAppStore } from "@/store/app-store";
import type { Sale, SaleLine } from "@/types";

function notify() {
  useAppStore.getState().bump();
}

function deductStock(lines: SaleLine[]) {
  patchDatabase((db) => {
    lines.forEach((line) => {
      const product = db.products.find((p) => p.id === line.productId);
      if (!product) return;
      product.stock = Math.max(0, product.stock - line.quantity);
      product.status =
        product.stock <= product.minStock ? "low_stock" : product.stock <= 0 ? "inactive" : "active";
      db.listings
        .filter((l) => l.productId === product.id)
        .forEach((l) => {
          l.stock = product.stock;
        });
      db.movements.unshift({
        id: `mov-${Date.now()}-${line.productId}`,
        productId: product.id,
        sku: product.sku,
        delta: -line.quantity,
        stockAfter: product.stock,
        reason: "Venta registrada",
        origin: "sale",
        user: "Sistema",
        createdAt: new Date().toISOString(),
      });
    });
  });
}

export const salesService = {
  async list(): Promise<Sale[]> {
    await randomDelay(200, 400);
    return getDatabase().sales.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async simulateMlSale(listingId: string): Promise<Sale | null> {
    await randomDelay(600, 900);
    const db = getDatabase();
    const listing = db.listings.find((l) => l.id === listingId);
    if (!listing) return null;
    const product = db.products.find((p) => p.id === listing.productId);
    if (!product) return null;
    const qty = 1;
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      channel: "mercadolibre",
      externalId: `#${98452}`,
      lines: [
        {
          productId: product.id,
          sku: product.sku,
          title: listing.title,
          quantity: qty,
          unitPrice: listing.price,
          listingId: listing.id,
        },
      ],
      total: listing.price * qty,
      status: "pending_invoice",
      createdAt: new Date().toISOString(),
      customerName: "Comprador ML",
    };
    patchDatabase((d) => {
      d.sales.unshift(sale);
      d.billing.unshift({
        id: `bill-${Date.now()}`,
        saleId: sale.id,
        status: "pending",
        total: sale.total,
        customerName: sale.customerName!,
      });
      d.labels.unshift({
        id: `label-${Date.now()}`,
        saleId: sale.id,
        productTitle: listing.title,
        equipmentLabel: listing.title.split(" para ").pop() ?? "",
        sku: product.sku,
        quantity: qty,
        orderRef: sale.externalId!,
        status: "pending",
      });
      d.activity.unshift({
        id: `act-${Date.now()}`,
        message: `Venta ML ${sale.externalId}`,
        createdAt: new Date().toISOString(),
      });
    });
    deductStock(sale.lines);
    notify();
    return sale;
  },

  async registerPos(lines: SaleLine[]): Promise<Sale> {
    await randomDelay(500, 800);
    const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      channel: "pos",
      lines,
      total,
      status: "completed",
      createdAt: new Date().toISOString(),
      customerName: "Cliente mostrador",
    };
    patchDatabase((db) => {
      db.sales.unshift(sale);
      db.activity.unshift({
        id: `act-${Date.now()}`,
        message: "Venta mesón registrada",
        createdAt: new Date().toISOString(),
      });
    });
    deductStock(lines);
    notify();
    return sale;
  },
};
