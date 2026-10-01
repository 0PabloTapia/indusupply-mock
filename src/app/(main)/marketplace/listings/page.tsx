"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ListingStatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCLP } from "@/lib/format";
import { getDatabase } from "@/lib/database";
import { marketplaceService } from "@/services/marketplace.service";
import { useRevision } from "@/hooks/use-revision";
import type { MarketplaceListing } from "@/types";

export default function ListingsPage() {
  const revision = useRevision();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);

  useEffect(() => {
    marketplaceService.getListings().then(setListings);
  }, [revision]);

  return (
    <div>
      <PageHeader
        title="Publicaciones Mercado Libre"
        description="Muchas publicaciones → un único SKU físico con stock compartido."
      >
        <Link href="/marketplace/publish" className={cn(buttonVariants())}>
          Crear publicación
        </Link>
      </PageHeader>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Publicación</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.slice(0, 50).map((l) => {
              const sku = getDatabase().products.find((p) => p.id === l.productId)?.sku;
              return (
                <TableRow key={l.id}>
                  <TableCell className="max-w-md truncate text-sm">{l.title}</TableCell>
                  <TableCell className="font-mono text-xs">{sku}</TableCell>
                  <TableCell className="text-right">{formatCLP(l.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{l.stock}</TableCell>
                  <TableCell>
                    <ListingStatusBadge status={l.status} />
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
