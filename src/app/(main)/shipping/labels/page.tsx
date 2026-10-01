"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shippingService } from "@/services/shipping.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import type { LabelJob } from "@/types";

export default function LabelsPage() {
  const revision = useRevision();
  const [labels, setLabels] = useState<LabelJob[]>([]);

  useEffect(() => {
    shippingService.pendingLabels().then(setLabels);
  }, [revision]);

  async function print(id: string) {
    const res = await shippingService.printLabel(id);
    toast.success(`Enviado a impresora ${res.printer}`);
    setLabels(await shippingService.pendingLabels());
  }

  return (
    <div>
      <PageHeader title="Etiquetas" description="Pedidos pendientes de etiquetar — título de venta preservado." />
      <div className="grid gap-4 lg:grid-cols-2">
        {labels.map((l) => (
          <Card key={l.id}>
            <CardHeader>
              <CardTitle className="text-base">Pedido {l.orderRef}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">{l.productTitle}</p>
                <p className="text-muted-foreground">Compatible {l.equipmentLabel}</p>
                <p className="text-xs mt-1">
                  SKU {l.sku} · Cantidad {l.quantity}
                </p>
              </div>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono leading-relaxed">
{`┌──────────────────────────────┐
│ ${l.productTitle.slice(0, 28).padEnd(28)} │
│ ${l.equipmentLabel.slice(0, 28).padEnd(28)} │
│ SKU: ${l.sku.padEnd(23)} │
│ Pedido: ${l.orderRef.padEnd(19)} │
│ ████████████████████████     │
└──────────────────────────────┘`}
              </pre>
              <Button onClick={() => print(l.id)}>Imprimir etiqueta</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
