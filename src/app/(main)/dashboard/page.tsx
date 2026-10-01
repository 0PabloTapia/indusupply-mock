"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCLP, formatTime } from "@/lib/format";
import { dashboardService } from "@/services/dashboard.service";
import { useRevision } from "@/hooks/use-revision";

export default function DashboardPage() {
  const revision = useRevision();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Awaited<ReturnType<typeof dashboardService.getKpis>> | null>(null);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof dashboardService.getActivity>>>([]);
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof dashboardService.getAlerts>>>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dashboardService.getKpis(),
      dashboardService.getActivity(),
      dashboardService.getAlerts(),
    ]).then(([k, a, al]) => {
      if (cancelled) return;
      setKpis(k);
      setActivity(a);
      setAlerts(al);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  const kpiCards = kpis
    ? [
        { label: "Ventas hoy", value: formatCLP(kpis.salesToday) },
        { label: "Ventas del mes", value: formatCLP(kpis.salesMonth) },
        { label: "Pedidos pendientes", value: String(kpis.pendingOrders) },
        { label: "Stock crítico", value: String(kpis.lowStock) },
        { label: "Errores Mercado Libre", value: String(kpis.mlErrors) },
        { label: "Compras en proceso", value: String(kpis.purchasesInProgress) },
        { label: "Facturas pendientes", value: String(kpis.pendingInvoices) },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Centro de operaciones InduSupply — ventas, inventario y Mercado Libre en un solo lugar."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))
          : kpiCards.map((k) => (
              <Card key={k.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">{k.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-3 text-sm">
                {activity.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="tabular-nums text-muted-foreground">{formatTime(item.createdAt)}</span>
                    <span>{item.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Problemas detectados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              alerts.map((a) => (
                <Alert key={a.id} variant={a.severity === "error" ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">{a.title}</AlertTitle>
                  <AlertDescription className="text-xs">{a.description}</AlertDescription>
                </Alert>
              ))
            )}
            <Link href="/alerts" className="text-sm text-primary underline-offset-4 hover:underline">
              Ver todas las alertas
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
