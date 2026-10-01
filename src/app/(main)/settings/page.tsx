"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetDatabase } from "@/lib/database";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";

export default function SettingsPage() {
  function reset() {
    resetDatabase();
    useAppStore.getState().bump();
    toast.success("Datos mock restablecidos desde seed");
  }

  return (
    <div>
      <PageHeader title="Configuración" description="Opciones del entorno demo (sin auth real)." />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Persistencia mock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Los datos viven en localStorage bajo la clave <code className="text-foreground">indusupply-mock-v1</code>.</p>
          <Button variant="destructive" onClick={reset}>
            Restablecer datos demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
