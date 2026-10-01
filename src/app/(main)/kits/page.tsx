"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCLP } from "@/lib/format";
import { kitService } from "@/services/kit.service";
import { getDatabase } from "@/lib/database";
import { useRevision } from "@/hooks/use-revision";

export default function KitsPage() {
  const revision = useRevision();
  const [kits, setKits] = useState<Awaited<ReturnType<typeof kitService.list>>>([]);

  useEffect(() => {
    kitService.list().then(setKits);
  }, [revision]);

  return (
    <div>
      <PageHeader
        title="Kits y packs"
        description="Stock del kit calculado por componente disponible (mínimo de unidades posibles)."
      />
      <div className="space-y-4">
        {kits.map(({ kit, kitStock }) => {
          const db = getDatabase();
          return (
            <Card key={kit.id}>
              <CardHeader>
                <CardTitle className="text-base flex justify-between gap-4">
                  <span>{kit.name}</span>
                  <span className="text-muted-foreground font-normal">{formatCLP(kit.price)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium text-emerald-700">Stock kit = {kitStock}</p>
                <ul className="space-y-1 text-muted-foreground">
                  {kit.components.map((c) => {
                    const p = db.products.find((x) => x.id === c.productId);
                    const avail = p ? Math.floor(p.stock / c.quantity) : 0;
                    return (
                      <li key={c.sku}>
                        {c.quantity} × {c.name} — disponibles: {p?.stock ?? 0} / {c.quantity} = {avail} kits
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
