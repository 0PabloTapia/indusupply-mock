export type DemoTourStep = {
  id: string;
  path: string;
  title: string;
  instruction: string;
  /** data-tour attribute value to ring-highlight */
  highlight?: string;
  /** Auto-advance when user navigates to this path prefix */
  completeOnPath?: string;
  /** Auto-advance when this event is signaled (see demo-tour-store) */
  waitEvent?: string;
};

export const DEMO_TOUR_STEPS: DemoTourStep[] = [
  {
    id: "welcome",
    path: "/dashboard",
    title: "1 · Centro de operaciones",
    instruction:
      "Este dashboard concentra ventas, stock y Mercado Libre. Revisa los KPIs y la actividad reciente. Cuando puedas, pulsa **Siguiente** para buscar repuestos por equipo.",
    highlight: "demo-dashboard-kpis",
  },
  {
    id: "equipment-search",
    path: "/compatibilities",
    title: "2 · Buscar por equipo",
    instruction:
      "Confirma **Atlas Copco → Compresor → GA11** (ya vienen seleccionados). El primero de la lista, resaltado, es **Rodamiento SKF 6204** — **haz clic en el nombre** para abrir la ficha.",
    highlight: "demo-compat-skf-card",
    completeOnPath: "/products/prod-1",
  },
  {
    id: "product-compat",
    path: "/products/prod-1",
    title: "3 · Un SKU, muchas compatibilidades",
    instruction:
      "Revisa el resumen y la pestaña **Compatibilidades**: el mismo SKF sirve a varios equipos. Ahora **haz clic en \"Simular venta ML\"** (publicación Atlas Copco).",
    highlight: "demo-simulate-sale",
    waitEvent: "sale-simulated",
  },
  {
    id: "sale-flow",
    path: "/products/prod-1",
    title: "4 · Venta recibida",
    instruction:
      "Este cuadro muestra el flujo: **publicación → SKU → stock → factura → etiqueta**. Cierra el modal (X) y pulsa **Siguiente** para ver las publicaciones.",
    highlight: "demo-simulate-sale",
  },
  {
    id: "listings",
    path: "/marketplace/listings",
    title: "5 · Muchas publicaciones, un stock",
    instruction:
      "Aquí ves el mismo **SKF-6204** en varias publicaciones de Mercado Libre. Todas comparten el stock físico. **Siguiente** → facturación.",
    highlight: "demo-listings-table",
  },
  {
    id: "billing",
    path: "/billing",
    title: "6 · Factura con título de la venta",
    instruction:
      "El documento usa el **título de la publicación**, no solo el SKU. **Haz clic en \"Emitir factura\"** en la primera fila pendiente (tarda ~1 s).",
    highlight: "demo-billing-issue",
    waitEvent: "invoice-issued",
  },
  {
    id: "labels",
    path: "/shipping/labels",
    title: "7 · Etiqueta de despacho",
    instruction:
      "La etiqueta repite el mismo título del equipo. **Haz clic en \"Imprimir etiqueta\"** en el primer pedido.",
    highlight: "demo-label-print",
    waitEvent: "label-printed",
  },
  {
    id: "purchase",
    path: "/purchases/pur-48512",
    title: "8 · Compra con progreso guardado",
    instruction:
      "Factura **#48512** en curso: **23/46** líneas. Prueba **\"Procesar siguiente línea\"** una o dos veces (el progreso se guarda solo). **Finalizar tour** cuando termines.",
    highlight: "demo-purchase-progress",
  },
];
