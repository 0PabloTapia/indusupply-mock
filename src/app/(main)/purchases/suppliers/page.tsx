"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseService } from "@/services/purchase.service";

export default function SuppliersPage() {
  const suppliers = purchaseService.suppliers();

  return (
    <div>
      <PageHeader title="Proveedores" description="Catálogo de proveedores ficticios InduSupply." />
      <div className="grid gap-4 sm:grid-cols-2">
        {suppliers.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="text-base">{s.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>RUT {s.taxId}</p>
              <p>{s.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
