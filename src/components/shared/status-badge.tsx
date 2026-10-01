import { Badge } from "@/components/ui/badge";

export function ProductStatusBadge({ status }: { status: string }) {
  if (status === "low_stock") return <Badge variant="outline" className="border-amber-500 text-amber-700">Stock bajo</Badge>;
  if (status === "inactive") return <Badge variant="secondary">Inactivo</Badge>;
  return <Badge variant="outline" className="border-emerald-600 text-emerald-700">Activo</Badge>;
}

export function ListingStatusBadge({ status }: { status: string }) {
  if (status === "synced") return <Badge className="bg-emerald-600">Sincronizada</Badge>;
  if (status === "out_of_sync") return <Badge variant="outline" className="border-amber-500 text-amber-700">Desincronizada</Badge>;
  if (status === "error") return <Badge variant="destructive">Error</Badge>;
  return <Badge variant="secondary">Borrador</Badge>;
}
