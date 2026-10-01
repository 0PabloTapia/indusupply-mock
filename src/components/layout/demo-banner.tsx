"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoTourStore } from "@/store/demo-tour-store";

export function DemoBanner() {
  const start = useDemoTourStore((s) => s.start);

  return (
    <div
      data-tour="demo-dashboard-banner"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Demo InduSupply · recorrido guiado</p>
          <p className="text-xs text-muted-foreground">
            Te llevamos paso a paso: equipo → producto → venta ML → factura → etiqueta → compra
          </p>
        </div>
      </div>
      <Button size="sm" onClick={start}>
        Iniciar recorrido
      </Button>
    </div>
  );
}
