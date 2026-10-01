"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { alertsService } from "@/services/alerts.service";
import { useRevision } from "@/hooks/use-revision";
import type { SystemAlert } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const revision = useRevision();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function reload() {
    setAlerts(await alertsService.list());
  }

  useEffect(() => {
    reload();
  }, [revision]);

  async function handleAction(alert: SystemAlert) {
    setBusy(alert.id);
    try {
      switch (alert.type) {
        case "stock_mismatch":
          await alertsService.fixStockMismatch();
          toast.success("Stock sincronizado con Mercado Libre");
          break;
        case "orphan_listing":
          await alertsService.associateOrphanListing();
          toast.success("Publicación asociada a SKF-6204");
          break;
        case "duplicate_product":
          await alertsService.reviewDuplicate();
          toast.success("Duplicado revisado");
          break;
        case "low_stock":
          await alertsService.acknowledgeLowStock();
          toast.message("Alerta de stock archivada");
          break;
        case "pending_invoice":
          await alertsService.acknowledgePendingInvoice();
          toast.message("Recordatorio archivado — emite la factura en Facturación");
          break;
      }
      await reload();
    } finally {
      setBusy(null);
    }
  }

  const actionLabel = (type: SystemAlert["type"]) => {
    switch (type) {
      case "stock_mismatch":
        return "Corregir";
      case "orphan_listing":
        return "Asociar producto";
      case "duplicate_product":
        return "Revisar";
      default:
        return "Entendido";
    }
  };

  return (
    <div>
      <PageHeader title="Alertas" description="Problemas detectados — acciones que actualizan el mock en vivo." />
      {alerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Todo en orden"
          description="No hay alertas pendientes. Sigue operando o restablece el demo en Configuración."
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => (
            <Card
              key={a.id}
              className={cn(
                "border shadow-sm",
                a.severity === "error" ? "border-destructive/30" : "border-amber-500/30",
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4",
                      a.severity === "error" ? "text-destructive" : "text-amber-600",
                    )}
                  />
                  {a.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">{a.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === a.id}
                  onClick={() => handleAction(a)}
                >
                  {busy === a.id ? "Procesando…" : actionLabel(a.type)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
