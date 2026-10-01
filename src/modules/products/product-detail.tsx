"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductStatusBadge } from "@/components/shared/status-badge";
import { SaleFlowPanel, type SaleFlowData } from "@/components/shared/sale-flow-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListingStatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCLP, formatDateTime } from "@/lib/format";
import { productService } from "@/services/product.service";
import { getDatabase } from "@/lib/database";
import { salesService } from "@/services/sales.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import { useDemoTourStore } from "@/store/demo-tour-store";
import type { Compatibility, Product } from "@/types";

export function ProductDetail({ id }: { id: string }) {
  const revision = useRevision();
  const [product, setProduct] = useState<Product | null>(null);
  const [compat, setCompat] = useState<Compatibility[]>([]);
  const [saleFlow, setSaleFlow] = useState<SaleFlowData | null>(null);
  const [compatForm, setCompatForm] = useState({
    equipmentBrand: "",
    equipmentType: "",
    model: "",
    series: "",
    notes: "",
  });

  useEffect(() => {
    productService.getById(id).then((p) => setProduct(p ?? null));
    productService.getCompatibilities(id).then(setCompat);
  }, [id, revision]);

  if (!product) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const db = getDatabase();
  const listings = db.listings.filter((l) => l.productId === id);
  const movements = db.movements.filter((m) => m.productId === id).slice(0, 15);
  const history = db.audit.filter((a) => a.detail.includes(product.sku)).slice(0, 20);

  async function simulateSale() {
    const listing = listings.find((l) => l.title.includes("Atlas Copco"));
    if (!listing) {
      toast.error("No hay publicación demo Atlas Copco");
      return;
    }
    const result = await salesService.simulateMlSale(listing.id);
    if (result) {
      useDemoTourStore.getState().signalEvent("sale-simulated");
      setSaleFlow({
        listingTitle: result.listingTitle,
        sku: product!.sku,
        stockBefore: result.stockBefore,
        stockAfter: result.stockAfter,
        total: result.sale.total,
        saleRef: result.sale.externalId ?? result.sale.id,
      });
      productService.getById(id).then((p) => setProduct(p ?? null));
    }
  }

  async function addCompat() {
    if (!compatForm.equipmentBrand || !compatForm.model) {
      toast.error("Completa marca y modelo");
      return;
    }
    await productService.addCompatibility(id, compatForm);
    setCompatForm({ equipmentBrand: "", equipmentType: "", model: "", series: "", notes: "" });
    productService.getCompatibilities(id).then(setCompat);
    toast.success("Compatibilidad agregada");
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
        <Button onClick={simulateSale} data-tour="demo-simulate-sale">
          Simular venta ML
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Stock", value: String(product.stock) },
          { label: "Precio", value: formatCLP(product.price) },
          { label: "Compatibilidades", value: String(compat.length) },
          { label: "Publicaciones ML", value: String(listings.length) },
        ].map((s) => (
          <Card key={s.label} className="border-border/80 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="compat">Compatibilidades</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="listings">Publicaciones</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card className="border-border/80 shadow-sm">
            <CardContent className="grid gap-3 pt-6 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">SKU:</span> <span className="font-medium">{product.sku}</span></p>
              <p><span className="text-muted-foreground">Marca:</span> {product.brand}</p>
              <p><span className="text-muted-foreground">Código fabricante:</span> {product.manufacturerCode}</p>
              <p><span className="text-muted-foreground">Categoría:</span> {product.category}</p>
              <p><span className="text-muted-foreground">Costo:</span> {formatCLP(product.cost)}</p>
              <p><span className="text-muted-foreground">Precio:</span> {formatCLP(product.price)}</p>
              <p><span className="text-muted-foreground">Estado:</span> <ProductStatusBadge status={product.status} /></p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compat" className="mt-4 space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Agregar compatibilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["equipmentBrand", "Marca equipo"],
                  ["equipmentType", "Tipo de equipo"],
                  ["model", "Modelo"],
                  ["series", "Serie / año"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    value={compatForm[key]}
                    onChange={(e) => setCompatForm({ ...compatForm, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Button onClick={addCompat}>Guardar compatibilidad</Button>
              </div>
            </CardContent>
          </Card>
          <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
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
          <p className="mb-3 text-sm text-muted-foreground">
            Stock compartido con {listings.length} publicaciones Mercado Libre.
          </p>
          <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Movimiento</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <span className={m.delta > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                        {m.delta > 0 ? "+" : ""}
                        {m.delta}
                      </span>{" "}
                      {m.reason} · queda {m.stockAfter}
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
          {listings.length === 0 ? (
            <EmptyState
              icon={History}
              title="Sin publicaciones"
              description="Crea una publicación en Mercado Libre para este SKU."
            >
              <Link href="/marketplace/publish" className={cn(buttonVariants({ size: "sm" }))}>
                Crear publicación
              </Link>
            </EmptyState>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Publicación</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="max-w-md">{l.title}</TableCell>
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
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {history.length === 0 ? (
            <EmptyState icon={History} title="Sin cambios registrados" description="Las acciones sobre este SKU aparecerán aquí." />
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="rounded-lg border bg-card px-4 py-3 text-sm">
                  <p className="font-medium">{h.user} · {h.action}</p>
                  <p className="text-muted-foreground">{h.detail}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(h.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!saleFlow} onOpenChange={(open) => !open && setSaleFlow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Venta recibida</DialogTitle>
          </DialogHeader>
          {saleFlow && <SaleFlowPanel data={saleFlow} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
