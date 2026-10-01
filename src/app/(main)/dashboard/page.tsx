"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  FileWarning,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { DemoBanner } from "@/components/layout/demo-banner";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCLP, formatTime } from "@/lib/format";
import { dashboardService } from "@/services/dashboard.service";
import { useRevision } from "@/hooks/use-revision";

export default function DashboardPage() {
  const revision = useRevision();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof dashboardService.getKpis>> | null>(null);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof dashboardService.getActivity>>>([]);
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof dashboardService.getAlerts>>>([]);
  const [weekly, setWeekly] = useState<Awaited<ReturnType<typeof dashboardService.getWeeklySales>>>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dashboardService.getKpis(),
      dashboardService.getActivity(),
      dashboardService.getAlerts(),
      dashboardService.getWeeklySales(),
    ]).then(([k, a, al, w]) => {
      if (cancelled) return;
      setKpis(k);
      setActivity(a);
      setAlerts(al);
      setWeekly(w);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  const maxWeek = Math.max(...weekly.map((d) => d.total), 1);

  return (
    <div>
      <DemoBanner />
      <PageHeader
        title="Centro de operaciones"
        description="Ventas, inventario y Mercado Libre en una sola vista."
      />

      {loading || !kpis ? (
        <div className="grid gap-4 lg:grid-cols-4">
          <Skeleton className="h-36 lg:col-span-2 lg:row-span-2 rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4" data-tour="demo-dashboard-kpis">
          <KpiCard
            className="lg:col-span-2 lg:row-span-2 min-h-[180px] flex flex-col justify-center"
            tone="brand"
            label="Ventas hoy"
            value={formatCLP(kpis.salesToday)}
            hint={`Mes: ${formatCLP(kpis.salesMonth)}`}
            icon={TrendingUp}
          />
          <KpiCard tone="default" label="Pedidos pendientes" value={String(kpis.pendingOrders)} icon={ShoppingCart} />
          <KpiCard tone="warning" label="Stock crítico" value={String(kpis.lowStock)} icon={Package} />
          <KpiCard tone="danger" label="Errores ML" value={String(kpis.mlErrors)} icon={Store} />
          <KpiCard tone="default" label="Compras en curso" value={String(kpis.purchasesInProgress)} icon={Truck} />
          <KpiCard tone="warning" label="Facturas pendientes" value={String(kpis.pendingInvoices)} icon={FileWarning} />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Ventas últimos 7 días</CardTitle>
            <Link href="/sales" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}>
              Ver ventas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="flex h-44 items-end justify-between gap-2 pt-4">
                {weekly.map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full max-w-[3rem] rounded-t-md bg-gradient-to-t from-primary to-primary/40 transition-all"
                      style={{ height: `${Math.max(12, (d.total / maxWeek) * 100)}%` }}
                      title={formatCLP(d.total)}
                    />
                    <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { href: "/compatibilities", label: "Buscar por equipo" },
              { href: "/products/prod-1", label: "Producto SKF-6204" },
              { href: "/marketplace/listings", label: "Publicaciones ML" },
              { href: "/purchases/pur-48512", label: "Compra #48512" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:border-primary/30"
              >
                {link.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 rounded-lg border bg-card/60 px-3 py-2.5 text-sm"
                  >
                    <span className="shrink-0 tabular-nums text-xs font-medium text-primary">
                      {formatTime(item.createdAt)}
                    </span>
                    <span>{item.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Problemas detectados</CardTitle>
            <Link href="/alerts" className="text-xs font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sin alertas activas</p>
            ) : (
              alerts.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex gap-3 rounded-lg border px-3 py-3 text-sm",
                    a.severity === "error" ? "border-destructive/30 bg-destructive/5" : "border-amber-500/25 bg-amber-500/5",
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5",
                      a.severity === "error" ? "text-destructive" : "text-amber-600",
                    )}
                  />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
