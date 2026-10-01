"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { timeAgo } from "@/lib/format";
import { purchaseService } from "@/services/purchase.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import type { PurchaseInvoice, PurchaseLine } from "@/types";

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const revision = useRevision();
  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [processed, setProcessed] = useState(0);
  const [savedAt, setSavedAt] = useState<string | undefined>();

  const load = useCallback(() => {
    purchaseService.getById(id).then((inv) => {
      if (!inv) return;
      setInvoice(inv);
      setLines(inv.lines);
      setProcessed(inv.processedCount);
      setSavedAt(inv.lastSavedAt);
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load, revision]);

  useEffect(() => {
    if (!invoice || invoice.status === "completed") return;
    const t = setInterval(() => {
      purchaseService.saveProgress(id, processed, lines).then(() => {
        setSavedAt(new Date().toISOString());
      });
    }, 8000);
    return () => clearInterval(t);
  }, [id, invoice, lines, processed]);

  if (!invoice) return <p className="text-muted-foreground">Cargando…</p>;

  const supplier = purchaseService.suppliers().find((s) => s.id === invoice.supplierId);
  const pct = lines.length ? (processed / lines.length) * 100 : 0;

  async function markNext() {
    const next = Math.min(processed + 1, lines.length);
    setProcessed(next);
    await purchaseService.saveProgress(id, next, lines);
    setSavedAt(new Date().toISOString());
    toast.message("Progreso guardado");
  }

  async function createFromNewLine(lineId: string) {
    await purchaseService.createProductFromLine(id, lineId, {
      sku: "ABC991",
      name: "Retén industrial especial",
      brand: "SKF",
      category: "Sellos",
      cost: 3200,
      price: 5990,
      minStock: 10,
    });
    toast.success("Producto creado y línea asociada");
    load();
  }

  async function complete() {
    const res = await purchaseService.complete(id);
    toast.success(
      `Stock actualizado · ${res.productsCreated} productos creados · ${res.stockUpdated} líneas procesadas`,
    );
    load();
  }

  return (
    <div>
      <PageHeader
        title="Nueva recepción de mercadería"
        description={`Proveedor: ${supplier?.name ?? ""} · Factura #${invoice.invoiceNumber}`}
      >
        {invoice.status !== "completed" && (
          <>
            <Button variant="outline" onClick={markNext}>
              Procesar siguiente línea
            </Button>
            <Button onClick={complete}>Confirmar recepción</Button>
          </>
        )}
      </PageHeader>

      {invoice.status !== "completed" && (
        <div className="mb-6 space-y-2 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-emerald-700">
            ✓ Progreso guardado {savedAt ? timeAgo(savedAt) : "recién"}
          </p>
          <p className="text-sm font-medium">
            Factura {invoice.invoiceNumber} — {processed} / {lines.length} productos procesados
          </p>
          <Progress value={pct} className="h-2" />
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, idx) => (
              <TableRow key={line.id} className={idx < processed ? "bg-muted/20" : undefined}>
                <TableCell className="font-mono text-xs">{line.code}</TableCell>
                <TableCell>{line.description}</TableCell>
                <TableCell className="text-right">{line.quantity}</TableCell>
                <TableCell>
                  <Badge variant={line.status === "new_product" ? "destructive" : "outline"}>
                    {line.status === "associated"
                      ? "Asociado"
                      : line.status === "new_product"
                        ? "Producto nuevo"
                        : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {line.status === "new_product" && (
                    <Button size="sm" variant="secondary" onClick={() => createFromNewLine(line.id)}>
                      Crear producto
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
