"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardService } from "@/services/dashboard.service";
import { useRevision } from "@/hooks/use-revision";
import type { SystemAlert } from "@/types";
import { toast } from "sonner";

export default function AlertsPage() {
  const revision = useRevision();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    dashboardService.getAlerts().then(setAlerts);
  }, [revision]);

  return (
    <div>
      <PageHeader title="Alertas" description="Inconsistencias de stock, publicaciones huérfanas y duplicados." />
      <div className="space-y-4">
        {alerts.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle className="text-base">{a.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 text-sm">
              <p className="text-muted-foreground">{a.description}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.message("Acción simulada en mock")}
              >
                {a.type === "stock_mismatch"
                  ? "Corregir"
                  : a.type === "orphan_listing"
                    ? "Asociar producto"
                    : a.type === "duplicate_product"
                      ? "Revisar"
                      : "Ver"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
