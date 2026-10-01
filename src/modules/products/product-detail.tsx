"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ProductStatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListingStatusBadge } from "@/components/shared/status-badge";
import { formatCLP, formatDateTime } from "@/lib/format";
import { productService } from "@/services/product.service";
import { getDatabase } from "@/lib/database";
import { salesService } from "@/services/sales.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import type { Compatibility, Product } from "@/types";

export function ProductDetail({ id }: { id: string }) {
  const revision = useRevision();
  const [product, setProduct] = useState<Product | null>(null);
  const [compat, setCompat] = useState<Compatibility[]>([]);

  useEffect(() => {
    productService.getById(id).then((p) => setProduct(p ?? null));
    productService.getCompatibilities(id).then(setCompat);
  }, [id, revision]);

  if (!product) {
    return <p className="text-muted-foreground">Cargando producto…</p>;
  }

  const db = getDatabase();
  const listings = db.listings.filter((l) => l.productId === id);
  const movements = db.movements.filter((m) => m.productId === id).slice(0, 15);

  async function simulateSale() {
    const listing = listings.find((l) => l.title.includes("Atlas Copco"));
    if (!listing) {
      toast.error("No hay publicación demo Atlas Copco");
      return;
    }
    const sale = await salesService.simulateMlSale(listing.id);
    if (sale) {
      toast.success(`Venta ML · Stock ${product!.sku} actualizado`);
    }
  }

  return (
    <div>
      <PageHeader title={product.name} description={`SKU ${product.sku} · ${product.brand}`}>
        <Link
          href="/marketplace/listings"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Ver publicaciones
        </Link>
        <Button onClick={simulateSale}>Simular venta ML (demo)</Button>
      </PageHeader>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="compat">Compatibilidades</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="listings">Publicaciones</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardContent className="grid gap-2 pt-6 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">SKU:</span> {product.sku}</p>
              <p><span className="text-muted-foreground">Marca:</span> {product.brand}</p>
              <p><span className="text-muted-foreground">Código fabricante:</span> {product.manufacturerCode}</p>
              <p><span className="text-muted-foreground">Categoría:</span> {product.category}</p>
              <p><span className="text-muted-foreground">Costo:</span> {formatCLP(product.cost)}</p>
              <p><span className="text-muted-foreground">Precio:</span> {formatCLP(product.price)}</p>
              <p><span className="text-muted-foreground">Stock:</span> {product.stock}</p>
              <p><span className="text-muted-foreground">Estado:</span> <ProductStatusBadge status={product.status} /></p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compat" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Serie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compat.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.equipmentBrand}</TableCell>
                    <TableCell>{c.equipmentType}</TableCell>
                    <TableCell>{c.model}</TableCell>
                    <TableCell>{c.series}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Stock compartido con {listings.length} publicaciones Mercado Libre.
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movimiento</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {m.delta > 0 ? "+" : ""}
                      {m.delta} · {m.reason} · queda {m.stockAfter}
                    </TableCell>
                    <TableCell>{m.user}</TableCell>
                    <TableCell>{formatDateTime(m.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publicación</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="max-w-md truncate">{l.title}</TableCell>
                    <TableCell className="text-right">{formatCLP(l.price)}</TableCell>
                    <TableCell className="text-right">{l.stock}</TableCell>
                    <TableCell>
                      <ListingStatusBadge status={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <p className="text-sm text-muted-foreground">
            Cambios recientes en auditoría relacionados con este SKU (ver{" "}
            <Link href="/audit" className="underline">Historial</Link>).
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
