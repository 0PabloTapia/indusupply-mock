"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCLP, formatDateTime } from "@/lib/format";
import { billingService } from "@/services/billing.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import { useDemoTourStore } from "@/store/demo-tour-store";

export default function BillingPage() {
  const revision = useRevision();
  const [docs, setDocs] = useState<Awaited<ReturnType<typeof billingService.list>>>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    billingService.list().then(setDocs);
  }, [revision]);

  async function issue(id: string) {
    setLoadingId(id);
    const res = await billingService.issueDocument(id);
    setLoadingId(null);
    toast.success(`Documento emitido · Factura #${res.number} · Estado: Aceptada`);
    useDemoTourStore.getState().signalEvent("invoice-issued");
    setDocs(await billingService.list());
  }

  return (
    <div>
      <PageHeader
        title="Facturación"
        description="Mock de emisión — Frontend → Backend Qubo → Proveedor facturación (simulado)."
      />
      <Card className="mb-6">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p>Frontend</p>
          <p className="ml-4">↓</p>
          <p>Backend Qubo</p>
          <p className="ml-4">↓</p>
          <p>Proveedor facturación</p>
        </CardContent>
      </Card>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Detalle venta</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((d, idx) => (
              <TableRow key={d.id}>
                <TableCell>{d.number ? `#${d.number}` : "Pendiente"}</TableCell>
                <TableCell>{d.customerName}</TableCell>
                <TableCell className="max-w-xs truncate text-sm">
                  {d.sale?.lines[0]?.title}
                </TableCell>
                <TableCell className="text-right">{formatCLP(d.total)}</TableCell>
                <TableCell className="text-xs">
                  {d.status}
                  {d.issuedAt && ` · ${formatDateTime(d.issuedAt)}`}
                </TableCell>
                <TableCell>
                  {d.status === "pending" && (
                    <Button
                      size="sm"
                      disabled={loadingId === d.id}
                      onClick={() => issue(d.id)}
                      data-tour={
                        d.status === "pending" &&
                        idx === docs.findIndex((x) => x.status === "pending")
                          ? "demo-billing-issue"
                          : undefined
                      }
                    >
                      {loadingId === d.id ? "Emitiendo…" : "Emitir factura"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
