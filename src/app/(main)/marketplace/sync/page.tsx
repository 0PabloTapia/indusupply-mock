"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { timeAgo } from "@/lib/format";
import { marketplaceService } from "@/services/marketplace.service";
import { getDatabase } from "@/lib/database";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";

export default function SyncPage() {
  const revision = useRevision();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | undefined>();

  useEffect(() => {
    setLastSync(marketplaceService.lastSyncAt());
  }, [revision]);

  const listings = getDatabase().listings.slice(0, 30);

  async function syncNow() {
    setSyncing(true);
    const res = await marketplaceService.sync();
    setSyncing(false);
    setLastSync(marketplaceService.lastSyncAt());
    toast.success(`${res.updated} publicaciones actualizadas · ${res.needsReview} requiere revisión`);
  }

  return (
    <div>
      <PageHeader
        title="Sincronización Mercado Libre"
        description={`Última sincronización: ${lastSync ? timeAgo(lastSync) : "—"}`}
      >
        <Button onClick={syncNow} disabled={syncing}>
          {syncing ? "Sincronizando…" : "Sincronizar ahora"}
        </Button>
      </PageHeader>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Publicación</TableHead>
              <TableHead className="text-right">Sistema</TableHead>
              <TableHead className="text-right">Mercado Libre</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="max-w-xs truncate text-sm">{l.title.split(" para ").pop()}</TableCell>
                <TableCell className="text-right tabular-nums">{l.stock}</TableCell>
                <TableCell className="text-right tabular-nums">{l.mlStock}</TableCell>
                <TableCell>
                  {l.stock === l.mlStock && l.status !== "error" ? "✓" : "⚠"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
