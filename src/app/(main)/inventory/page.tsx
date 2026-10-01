"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ProductStatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inventoryService } from "@/services/inventory.service";
import { useRevision } from "@/hooks/use-revision";
import type { Product } from "@/types";

export default function InventoryPage() {
  const revision = useRevision();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    inventoryService.listProducts().then(setProducts);
  }, [revision]);

  const sorted = [...products].sort((a, b) => a.stock / a.minStock - b.stock / b.minStock);

  return (
    <div>
      <PageHeader title="Stock" description="Inventario único compartido por POS y Mercado Libre." />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.slice(0, 60).map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/products/${p.id}`} className="font-mono text-xs hover:underline">
                    {p.sku}
                  </Link>
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell className="text-right tabular-nums">{p.stock}</TableCell>
                <TableCell className="text-right tabular-nums">{p.minStock}</TableCell>
                <TableCell>
                  <ProductStatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
