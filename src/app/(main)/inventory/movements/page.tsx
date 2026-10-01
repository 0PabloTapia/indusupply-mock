"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { inventoryService } from "@/services/inventory.service";
import { useRevision } from "@/hooks/use-revision";
import type { InventoryMovement } from "@/types";

export default function MovementsPage() {
  const revision = useRevision();
  const [rows, setRows] = useState<InventoryMovement[]>([]);

  useEffect(() => {
    inventoryService.movements(80).then(setRows);
  }, [revision]);

  return (
    <div>
      <PageHeader title="Movimientos de inventario" description="Timeline de entradas, ventas y ajustes." />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movimiento</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <span className={m.delta > 0 ? "text-emerald-600" : "text-red-600"}>
                    {m.delta > 0 ? "+" : ""}
                    {m.delta}
                  </span>{" "}
                  {m.reason} · queda {m.stockAfter}
                </TableCell>
                <TableCell className="font-mono text-xs">{m.sku}</TableCell>
                <TableCell>{m.user}</TableCell>
                <TableCell>{m.origin}</TableCell>
                <TableCell>{formatDateTime(m.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
