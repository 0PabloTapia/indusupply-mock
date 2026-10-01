"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCLP, formatDateTime } from "@/lib/format";
import { salesService } from "@/services/sales.service";
import { useRevision } from "@/hooks/use-revision";
import type { Sale } from "@/types";

export default function SalesPage() {
  const revision = useRevision();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    salesService.list().then(setSales);
  }, [revision]);

  return (
    <div>
      <PageHeader title="Ventas" description="Ventas multicanal con título de publicación preservado en el flujo." />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Canal</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.slice(0, 40).map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Badge variant="outline">{s.channel === "mercadolibre" ? "ML" : "POS"}</Badge>
                </TableCell>
                <TableCell>{s.externalId ?? s.id}</TableCell>
                <TableCell className="max-w-xs truncate text-sm">{s.lines[0]?.title}</TableCell>
                <TableCell className="text-right">{formatCLP(s.total)}</TableCell>
                <TableCell className="text-xs">{s.status}</TableCell>
                <TableCell>{formatDateTime(s.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
