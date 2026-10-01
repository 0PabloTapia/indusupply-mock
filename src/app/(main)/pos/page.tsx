"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCLP } from "@/lib/format";
import { compatibilityService } from "@/services/compatibility.service";
import { salesService } from "@/services/sales.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import type { Product, SaleLine } from "@/types";

export default function PosPage() {
  const revision = useRevision();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("Atlas Copco");
  const [model, setModel] = useState("GA11");
  const [compatResults, setCompatResults] = useState<{ product: Product }[]>([]);
  const [cart, setCart] = useState<SaleLine[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    compatibilityService
      .searchByEquipment({ equipmentBrand: brand, model })
      .then((r) => setCompatResults(r.map((x) => ({ product: x.product }))));
  }, [revision, brand, model]);

  useEffect(() => {
    import("@/services/product.service").then(({ productService }) => {
      productService.list().then(setAllProducts);
    });
  }, [revision]);

  const searchHits = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [search, allProducts]);

  function addToCart(p: Product) {
    setCart((c) => {
      const existing = c.find((l) => l.productId === p.id);
      if (existing) {
        return c.map((l) =>
          l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...c,
        {
          productId: p.id,
          sku: p.sku,
          title: p.name,
          quantity: 1,
          unitPrice: p.price,
        },
      ];
    });
  }

  const total = cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  async function checkout() {
    if (!cart.length) return;
    await salesService.registerPos(cart);
    toast.success("Venta registrada · Stock actualizado · Documento solicitado");
    setCart([]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <PageHeader title="Punto de venta" description="Búsqueda por SKU o por equipo compatible." />
        <Input
          placeholder="Buscar producto, SKU, código o equipo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {searchHits.length > 0 && (
          <div className="rounded-lg border divide-y">
            {searchHits.map((p) => (
              <button
                key={p.id}
                type="button"
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted/50"
                onClick={() => addToCart(p)}
              >
                <span>{p.name}</span>
                <span className="text-muted-foreground">{formatCLP(p.price)}</span>
              </button>
            ))}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por equipo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Marca equipo</Label>
              <Select value={brand} onValueChange={(v) => v && setBrand(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {compatibilityService.equipmentBrands().map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Modelo</Label>
              <Select value={model} onValueChange={(v) => v && setModel(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {compatibilityService.models(brand).map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-2 sm:grid-cols-2">
          {compatResults.slice(0, 8).map(({ product }) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between pt-4 text-sm">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => addToCart(product)}>
                  Agregar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-base">Carrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {cart.length === 0 && <p className="text-muted-foreground">Vacío</p>}
          {cart.map((l) => (
            <div key={l.productId} className="flex justify-between gap-2">
              <span>
                {l.quantity}× {l.title}
              </span>
              <span className="tabular-nums">{formatCLP(l.quantity * l.unitPrice)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCLP(total)}</span>
          </div>
          <Button className="w-full" disabled={!cart.length} onClick={checkout}>
            Cobrar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
