"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ProductStatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productService } from "@/services/product.service";
import { getDatabase } from "@/lib/database";
import { useRevision } from "@/hooks/use-revision";
import type { Product } from "@/types";

export default function ProductsPage() {
  const revision = useRevision();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [listingsFilter, setListingsFilter] = useState("all");

  const categories = useMemo(() => productService.categories(), [revision]);
  const brands = useMemo(() => productService.brands(), [revision]);

  useEffect(() => {
    productService
      .list({
        search,
        category,
        brand,
        stock: stockFilter === "low" ? "low" : "all",
        status: statusFilter === "all" ? "all" : (statusFilter as Product["status"]),
        listings:
          listingsFilter === "with"
            ? "with"
            : listingsFilter === "without"
              ? "without"
              : "all",
      })
      .then(setProducts);
  }, [revision, search, category, brand, stockFilter, statusFilter, listingsFilter]);

  const counts = useMemo(() => {
    const db = getDatabase();
    return new Map(
      products.map((p) => [
        p.id,
        {
          compat: db.compatibilities.filter((c) => c.productId === p.id).length,
          listings: db.listings.filter((l) => l.productId === p.id).length,
        },
      ]),
    );
  }, [products, revision]);

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Catálogo técnico con stock compartido entre canales y publicaciones."
      />
      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border bg-card/60 p-4 shadow-sm">
        <Input
          placeholder="SKU, nombre, OEM, código fabricante…"
          className="max-w-sm bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={brand} onValueChange={(v) => v && setBrand(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={(v) => v && setStockFilter(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo stock</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo estado</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="low_stock">Stock bajo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={listingsFilter} onValueChange={(v) => v && setListingsFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Publicaciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="with">Con publicación</SelectItem>
            <SelectItem value="without">Sin publicación</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Compat.</TableHead>
              <TableHead className="text-right">Publ.</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.slice(0, 50).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/products/${p.id}`} className="hover:underline">
                    {p.sku}
                  </Link>
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell className="text-right tabular-nums">{p.stock}</TableCell>
                <TableCell className="text-right tabular-nums">{counts.get(p.id)?.compat ?? 0}</TableCell>
                <TableCell className="text-right tabular-nums">{counts.get(p.id)?.listings ?? 0}</TableCell>
                <TableCell>
                  <ProductStatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Mostrando {Math.min(50, products.length)} de {products.length} productos mock.
      </p>
    </div>
  );
}
