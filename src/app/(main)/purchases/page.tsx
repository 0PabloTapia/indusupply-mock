"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { purchaseService } from "@/services/purchase.service";
import { useRevision } from "@/hooks/use-revision";
import type { PurchaseInvoice } from "@/types";

export default function PurchasesPage() {
  const revision = useRevision();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);

  useEffect(() => {
    purchaseService.list().then(setInvoices);
  }, [revision]);

  return (
    <div>
      <PageHeader title="Facturas de compra" description="Recepción de mercadería con progreso guardado automáticamente." />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => {
              const sup = purchaseService.suppliers().find((s) => s.id === inv.supplierId);
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">#{inv.invoiceNumber}</TableCell>
                  <TableCell>{sup?.name}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {inv.lines.length
                      ? `${inv.processedCount} / ${inv.lines.length} productos`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "in_progress" ? "outline" : "secondary"}>
                      {inv.status === "in_progress" ? "En curso" : inv.status === "completed" ? "Completada" : inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(inv.createdAt)}</TableCell>
                  <TableCell>
                    {inv.status === "in_progress" && (
                      <Link
                        href={`/purchases/${inv.id}`}
                        className={cn(buttonVariants({ size: "sm" }))}
                      >
                        Continuar ingreso
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
