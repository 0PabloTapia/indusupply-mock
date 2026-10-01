"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { auditService } from "@/services/audit.service";
import { useRevision } from "@/hooks/use-revision";
import type { AuditEntry } from "@/types";

export default function AuditPage() {
  const revision = useRevision();
  const [rows, setRows] = useState<AuditEntry[]>([]);

  useEffect(() => {
    auditService.list(40).then(setRows);
  }, [revision]);

  return (
    <div>
      <PageHeader title="Historial de cambios" description="Auditoría operativa del mock InduSupply." />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.user}</TableCell>
                <TableCell>{r.action}</TableCell>
                <TableCell>{r.detail}</TableCell>
                <TableCell>{formatDateTime(r.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
