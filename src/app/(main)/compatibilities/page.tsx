"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCLP } from "@/lib/format";
import { compatibilityService } from "@/services/compatibility.service";
import { productService } from "@/services/product.service";
import { useRevision } from "@/hooks/use-revision";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function CompatibilitiesPage() {
  const revision = useRevision();
  const [brand, setBrand] = useState("Atlas Copco");
  const [type, setType] = useState("Compresor");
  const [model, setModel] = useState("GA11");
  const [series, setSeries] = useState("");
  const [results, setResults] = useState<{ product: Product; match: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [form, setForm] = useState({
    equipmentBrand: "",
    equipmentType: "",
    model: "",
    series: "",
    notes: "",
  });

  const brands = compatibilityService.equipmentBrands();

  useEffect(() => {
    compatibilityService
      .searchByEquipment({ equipmentBrand: brand, equipmentType: type, model, series })
      .then(setResults);
  }, [revision, brand, type, model, series]);

  async function addCompat() {
    if (!selectedProduct) return;
    await productService.addCompatibility(selectedProduct, form);
    toast.success("Compatibilidad agregada");
    setForm({ equipmentBrand: "", equipmentType: "", model: "", series: "", notes: "" });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Compatibilidades"
        description="¿Qué equipo buscas? Un repuesto puede servir a varias máquinas."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buscador por equipo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label>Marca</Label>
            <Select value={brand} onValueChange={(v) => v && setBrand(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Equipo</Label>
            <Select value={type} onValueChange={(v) => v && setType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {compatibilityService.equipmentTypes(brand).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Modelo</Label>
            <Select value={model} onValueChange={(v) => v && setModel(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {compatibilityService.models(brand, type).map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Serie / año</Label>
            <Input value={series} onChange={(e) => setSeries(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium">{results.length} productos compatibles</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-tour="demo-compat-results">
          {results.slice(0, 12).map(({ product, match }) => (
            <Card
              key={product.id}
              data-tour={product.sku === "SKF-6204" ? "demo-compat-skf-card" : undefined}
              className={
                product.sku === "SKF-6204"
                  ? "border-2 border-primary/50 bg-primary/10 shadow-md ring-1 ring-primary/20"
                  : undefined
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Link
                    href={product.sku === "SKF-6204" ? "/products/prod-1" : `/products/${product.id}`}
                    className="font-medium text-primary hover:underline"
                    data-tour={product.sku === "SKF-6204" ? "demo-skf-product-link" : undefined}
                  >
                    {product.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>{product.sku} · Stock {product.stock}</p>
                <p className="mt-1">{formatCLP(product.price)} · {match}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar compatibilidad a un producto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Producto (ID mock)</Label>
            <Input
              placeholder="prod-1 o buscar en productos"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            />
          </div>
          {(["equipmentBrand", "equipmentType", "model", "series"] as const).map((key) => (
            <div key={key}>
              <Label>{key}</Label>
              <Input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button onClick={addCompat}>Agregar compatibilidad</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
