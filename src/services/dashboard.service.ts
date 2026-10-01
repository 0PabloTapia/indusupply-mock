"use client";

import { getDatabase } from "@/lib/database";
import { randomDelay } from "@/lib/delay";

export const dashboardService = {
  async getKpis() {
    await randomDelay(300, 600);
    const db = getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const salesToday = db.sales.filter((s) => new Date(s.createdAt) >= today);
    const salesMonth = db.sales.filter((s) => {
      const d = new Date(s.createdAt);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    return {
      salesToday: salesToday.reduce((a, s) => a + s.total, 0),
      salesMonth: salesMonth.reduce((a, s) => a + s.total, 0),
      pendingOrders: db.sales.filter((s) => s.status !== "completed").length,
      lowStock: db.products.filter((p) => p.stock <= p.minStock).length,
      mlErrors: db.listings.filter((l) => l.status === "error" || l.status === "out_of_sync").length,
      purchasesInProgress: db.purchases.filter((p) => p.status === "in_progress").length,
      pendingInvoices: db.billing.filter((b) => b.status === "pending").length,
    };
  },

  async getActivity() {
    await randomDelay(200, 400);
    return getDatabase().activity.slice(0, 10);
  },

  async getAlerts() {
    await randomDelay(200, 400);
    return getDatabase().alerts.filter((a) => !a.resolved);
  },

  async getWeeklySales() {
    await randomDelay(150, 300);
    const db = getDatabase();
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    return days.map((label, i) => {
      const total = db.sales
        .filter((_, idx) => idx % 7 === i)
        .reduce((s, sale) => s + sale.total, 0);
      return { label, total: total || 120000 + i * 45000 };
    });
  },
};
