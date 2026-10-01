"use client";

import Link from "next/link";
import { ArrowDown, CheckCircle2, FileText, Package, Store, Tag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCLP } from "@/lib/format";

export interface SaleFlowData {
  listingTitle: string;
  sku: string;
  stockBefore: number;
  stockAfter: number;
  total: number;
  saleRef: string;
}

function Step({
  icon: Icon,
  title,
  subtitle,
  done,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  done?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-lg border bg-card/80 p-3 shadow-sm">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          done ? "bg-emerald-500/15 text-emerald-700" : "bg-primary/10 text-primary",
        )}
      >
        {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
    </div>
  );
}

export function SaleFlowPanel({ data }: { data: SaleFlowData }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Nueva venta Mercado Libre</p>
        <p className="mt-1 font-medium">{data.listingTitle}</p>
        <p className="text-sm text-muted-foreground">
          Cantidad: 1 · {formatCLP(data.total)}
        </p>
      </div>
      <Step icon={Store} title="Publicación" subtitle={data.listingTitle} done />
      <ArrowDown className="mx-auto h-4 w-4 text-muted-foreground" />
      <Step icon={Package} title={`SKU ${data.sku}`} subtitle="Producto físico único" done />
      <ArrowDown className="mx-auto h-4 w-4 text-muted-foreground" />
      <Step
        icon={Package}
        title="Stock actualizado"
        subtitle={`${data.stockBefore} → ${data.stockAfter}`}
        done
      />
      <ArrowDown className="mx-auto h-4 w-4 text-muted-foreground" />
      <Step icon={FileText} title="Factura pendiente" subtitle={`Venta ${data.saleRef}`} />
      <ArrowDown className="mx-auto h-4 w-4 text-muted-foreground" />
      <Step icon={Tag} title="Etiqueta pendiente" subtitle={data.listingTitle} />
      <div className="flex flex-wrap gap-2 pt-2">
        <Link href="/billing" className={cn(buttonVariants({ size: "sm" }))}>
          Ir a facturación
        </Link>
        <Link href="/shipping/labels" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Ir a etiquetas
        </Link>
      </div>
    </div>
  );
}
