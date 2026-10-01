"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCLP } from "@/lib/format";
import { productService } from "@/services/product.service";
import { marketplaceService } from "@/services/marketplace.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import type { Compatibility, Product } from "@/types";

const STEPS = ["Producto", "Compatibilidad", "Título", "Precio", "Vista previa", "Publicar"];

export default function PublishWizardPage() {
  const revision = useRevision();
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [compat, setCompat] = useState<Compatibility[]>([]);
  const [compatId, setCompatId] = useState("");
  const [price, setPrice] = useState("");
  const [simulateError, setSimulateError] = useState(false);

  useEffect(() => {
    productService.list().then(setProducts);
  }, [revision]);

  useEffect(() => {
    if (!productId) return;
    productService.getCompatibilities(productId).then(setCompat);
  }, [productId, revision]);

  const product = products.find((p) => p.id === productId);
  const selectedCompat = compat.find((c) => c.id === compatId);

  const title = useMemo(() => {
    if (!product) return "";
    if (!selectedCompat) return product.name;
    return `${product.name} para ${selectedCompat.equipmentType} ${selectedCompat.equipmentBrand} ${selectedCompat.model}`;
  }, [product, selectedCompat]);

  useEffect(() => {
    if (product && !price) setPrice(String(Math.round(product.price * 1.25)));
  }, [product, price]);

  async function publish() {
    if (!product) return;
    const res = await marketplaceService.publish({
      productId: product.id,
      compatibilityId: compatId || undefined,
      title,
      price: Number(price),
      simulateError,
    });
    if (res.ok && res.listing) {
      toast.success(`Publicación creada · ID ML: ${res.listing.mlId}`);
      setStep(0);
    } else {
      toast.warning(res.error ?? "Error al publicar");
    }
  }

  return (
    <div>
      <PageHeader title="Crear publicación" description="Wizard de publicación Mercado Libre (mock)." />
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 ${i === step ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <Select value={productId} onValueChange={(v) => v && setProductId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.slice(0, 30).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {step === 1 && (
            <Select value={compatId} onValueChange={(v) => v && setCompatId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Compatibilidad" />
              </SelectTrigger>
              <SelectContent>
                {compat.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.equipmentBrand} {c.model} · {c.series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {step === 2 && (
            <div>
              <Label>Título generado</Label>
              <Input readOnly value={title} />
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <Label>Precio publicación</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">Imágenes: simuladas en mock (no upload real).</p>
            </div>
          )}
          {step === 4 && (
            <div className="rounded-md border p-4 text-sm space-y-1">
              <p className="font-medium">{title}</p>
              <p>{formatCLP(Number(price))} · Stock {product?.stock}</p>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="err"
                  checked={simulateError}
                  onCheckedChange={(v) => setSimulateError(v === true)}
                />
                <Label htmlFor="err">Simular error ML (atributo diámetro)</Label>
              </div>
              <Button onClick={publish}>Publicar en Mercado Libre</Button>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
            <Button disabled={step >= 5 || (step === 0 && !productId)} onClick={() => setStep((s) => s + 1)}>
              Siguiente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
