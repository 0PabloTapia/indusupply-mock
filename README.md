# InduSupply — Mock ERP ferretería industrial

Frontend navegable (Next.js) que demuestra el flujo operacional completo **sin backend real**:

Compra → ingreso → producto → compatibilidades → publicación ML → venta → stock → factura → etiqueta.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (refresco de UI)
- Capa `services/*` sobre fixtures + `localStorage`

## Desarrollo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) (redirige al dashboard).

## Demo sugerida (~8 min)

1. **Dashboard** — KPIs y alertas
2. **Compatibilidades** — Atlas Copco GA11
3. **Producto** SKF-6204 (`/products/prod-1`) — tabs y publicaciones
4. **Mercado Libre** — mismas SKU, muchas publicaciones
5. **Simular venta ML** desde ficha producto
6. **Facturación** — emitir documento (delay ~800 ms)
7. **Etiquetas** — título de publicación en la etiqueta
8. **Compras** → Continuar factura **#48512** (23/46 líneas)

## Arquitectura

```text
UI (app/(main)/…)
  ↓
services/*.service.ts
  ↓
lib/database.ts (localStorage)
  ↓
fixtures/seed-data.ts
```

Reemplazar implementaciones mock por clientes HTTP reales sin cambiar las pantallas.

## Licencia

Mock de demostración Qubo — datos ficticios.
