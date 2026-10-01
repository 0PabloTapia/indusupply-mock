import type { AppDatabase, Product, ProductStatus } from "@/types";

const EQUIPMENT = [
  { brand: "Atlas Copco", type: "Compresor", models: ["GA11", "GA15", "GA22"] },
  { brand: "Siemens", type: "Motor", models: ["1LE1001", "1LE1503", "1LA7134"] },
  { brand: "Pedrollo", type: "Bomba", models: ["CPm170", "PKm60", "4SR"] },
  { brand: "WEG", type: "Motor", models: ["W22", "W40", "MGF80"] },
  { brand: "Ziehl-Abegg", type: "Ventilador", models: ["FN050", "FN063", "FN080"] },
  { brand: "Donaldson", type: "Sistema filtración", models: ["P550388", "P551434"] },
  { brand: "Gates", type: "Transmisión", models: ["A42", "B85", "SPZ1250"] },
  { brand: "SKF", type: "Rodamiento aplicado", models: ["6204", "6308", "22212"] },
];

const CATEGORIES = [
  "Rodamientos",
  "Correas",
  "Filtros",
  "Sellos",
  "Herramientas",
  "Fijaciones",
  "Lubricantes",
  "Kits",
];

const BRANDS = ["SKF", "Gates", "Donaldson", "Bosch", "FAG", "NTN", "Timken", "Würth"];

function id(prefix: string, n: number) {
  return `${prefix}-${n}`;
}

function isoMinutesAgo(m: number) {
  return new Date(Date.now() - m * 60000).toISOString();
}

function productStatus(stock: number, min: number): ProductStatus {
  if (stock <= 0) return "inactive";
  if (stock <= min) return "low_stock";
  return "active";
}

export function createSeedDatabase(): AppDatabase {
  const products: Product[] = [];
  const compatibilities: ReturnType<typeof buildCompat>[] = [];
  const listings: AppDatabase["listings"] = [];
  const movements: AppDatabase["movements"] = [];

  const heroProducts = [
    { sku: "SKF-6204", name: "Rodamiento SKF 6204", brand: "SKF", mfg: "6204-2RS", cat: "Rodamientos", cost: 5800, price: 11990, stock: 24, min: 10 },
    { sku: "GAT-A42", name: "Correa Gates A42", brand: "Gates", mfg: "A42", cat: "Correas", cost: 4200, price: 8990, stock: 8, min: 12 },
    { sku: "DON-P550388", name: "Filtro hidráulico Donaldson P550388", brand: "Donaldson", mfg: "P550388", cat: "Filtros", cost: 12500, price: 18990, stock: 9, min: 8 },
    { sku: "SEL-35x52x7", name: "Retén 35x52x7", brand: "SKF", mfg: "35x52x7", cat: "Sellos", cost: 2100, price: 4590, stock: 45, min: 15 },
    { sku: "PER-M12-50", name: "Pernos hexagonales M12 x 50", brand: "Würth", mfg: "M12-50", cat: "Fijaciones", cost: 890, price: 1990, stock: 200, min: 50 },
    { sku: "BOS-DISC-115", name: 'Disco corte Bosch 4½"', brand: "Bosch", mfg: "2608602372", cat: "Herramientas", cost: 1500, price: 3290, stock: 36, min: 20 },
    { sku: "KIT-GA11", name: "Kit mantenimiento compresor Atlas Copco GA11", brand: "InduSupply", mfg: "KIT-GA11", cat: "Kits", cost: 42000, price: 74990, stock: 7, min: 3 },
    { sku: "LUB-IND-20L", name: "Lubricante industrial ISO 68 (20L)", brand: "InduSupply", mfg: "LUB-68-20", cat: "Lubricantes", cost: 28000, price: 45990, stock: 14, min: 6 },
  ];

  heroProducts.forEach((h, i) => {
    products.push({
      id: id("prod", i + 1),
      sku: h.sku,
      name: h.name,
      brand: h.brand,
      manufacturerCode: h.mfg,
      category: h.cat,
      cost: h.cost,
      price: h.price,
      stock: h.stock,
      minStock: h.min,
      status: productStatus(h.stock, h.min),
      createdAt: isoMinutesAgo(60 * 24 * (30 - i)),
    });
  });

  for (let i = 0; i < 92; i++) {
    const brand = BRANDS[i % BRANDS.length];
    const cat = CATEGORIES[i % (CATEGORIES.length - 1)];
    const sku = `${brand.slice(0, 3).toUpperCase()}-${1000 + i}`;
    const stock = 5 + (i * 7) % 80;
    const min = 8 + (i % 15);
    products.push({
      id: id("prod", i + 9),
      sku,
      name: `${cat.slice(0, -1)} ${brand} ${100 + i}`,
      brand,
      manufacturerCode: `MFG-${1000 + i}`,
      category: cat,
      cost: 2000 + (i % 20) * 500,
      price: 4500 + (i % 25) * 800,
      stock,
      minStock: min,
      oem: i % 3 === 0 ? `OEM-${8000 + i}` : undefined,
      status: productStatus(stock, min),
      createdAt: isoMinutesAgo(60 * 24 * (i % 90)),
    });
  }

  let compatIdx = 0;
  function buildCompat(productId: string, eq: (typeof EQUIPMENT)[0], model: string, series: string) {
    compatIdx++;
    return {
      id: id("compat", compatIdx),
      productId,
      equipmentBrand: eq.brand,
      equipmentType: eq.type,
      model,
      series,
      yearRange: series.includes("Todas") ? undefined : "2018-2024",
    };
  }

  const skf = products.find((p) => p.sku === "SKF-6204")!;
  const skfCompatTargets = [
    ["Atlas Copco", "Compresor", "GA11", "2018-2024"],
    ["Siemens", "Motor", "1LE1001", "Todas"],
    ["Pedrollo", "Bomba", "CPm170", "Serie B"],
    ["WEG", "Motor", "W22", "2-5 HP"],
    ["Ziehl-Abegg", "Ventilador", "FN050", "2019-2023"],
  ] as const;

  skfCompatTargets.forEach(([brand, type, model, series]) => {
    const eq = EQUIPMENT.find((e) => e.brand === brand && e.type === type)!;
    compatibilities.push(buildCompat(skf.id, eq, model, series));
  });

  products.forEach((p, pi) => {
    const count = pi < 8 ? 12 - pi : 2 + (pi % 6);
    for (let c = 0; c < count; c++) {
      const eq = EQUIPMENT[(pi + c) % EQUIPMENT.length];
      const model = eq.models[c % eq.models.length];
      compatibilities.push(
        buildCompat(p.id, eq, model, c % 2 === 0 ? "2018-2024" : "Todas"),
      );
    }
  });

  let listingIdx = 0;
  products.slice(0, 40).forEach((p) => {
    const comps = compatibilities.filter((c) => c.productId === p.id);
    const n = Math.min(comps.length, p.sku === "SKF-6204" ? 8 : 3 + (listingIdx % 4));
    for (let i = 0; i < n; i++) {
      listingIdx++;
      const comp = comps[i % comps.length];
      const title = comp
        ? `${p.name.split(" ").slice(0, 3).join(" ")} para ${comp.equipmentType} ${comp.equipmentBrand} ${comp.model}`
        : p.name;
      const outOfSync = p.sku === "GAT-A42" && i === 0;
      listings.push({
        id: id("list", listingIdx),
        mlId: `MLB-${92840000 + listingIdx}`,
        productId: p.id,
        compatibilityId: comp?.id,
        title,
        price: Math.round(p.price * 1.25),
        stock: p.stock,
        mlStock: outOfSync ? p.stock + 4 : p.stock,
        status: outOfSync ? "out_of_sync" : i % 17 === 0 ? "error" : "synced",
        lastSyncAt: isoMinutesAgo(2 + (listingIdx % 30)),
        errorMessage: i % 17 === 0 ? 'Falta atributo "diámetro"' : undefined,
      });
    }
  });

  for (let m = 0; m < 500; m++) {
    const p = products[m % products.length];
    const delta = m % 5 === 0 ? 20 : m % 3 === 0 ? -1 : m % 7 === 0 ? -2 : 1;
    movements.push({
      id: id("mov", m + 1),
      productId: p.id,
      sku: p.sku,
      delta,
      stockAfter: Math.max(0, p.stock + (delta > 0 ? 1 : -1)),
      reason:
        delta > 10
          ? "Compra factura #48512"
          : delta < 0
            ? m % 2 === 0
              ? "Venta Mercado Libre"
              : "Venta mesón"
            : "Ajuste manual",
      origin: delta > 10 ? "purchase" : delta < 0 ? "sale" : "adjustment",
      user: m % 4 === 0 ? "Pablo" : m % 4 === 1 ? "Sergio" : "Sistema",
      createdAt: isoMinutesAgo(m * 12),
    });
  }

  const suppliers = [
    { id: "sup-1", name: "Distribuidora Industrial Sur", taxId: "76.123.456-7", email: "ventas@disur.cl" },
    { id: "sup-2", name: "SKF Chile", taxId: "96.789.012-3", email: "pedidos@skf.cl" },
    { id: "sup-3", name: "Gates Andina", taxId: "77.456.789-0", email: "comercial@gates.cl" },
    { id: "sup-4", name: "Donaldson LATAM", taxId: "59.321.654-8", email: "latam@donaldson.com" },
    { id: "sup-5", name: "Bosch Professional", taxId: "78.111.222-3", email: "b2b@bosch.cl" },
    { id: "sup-6", name: "Rodamientos del Pacífico", taxId: "76.999.888-7", email: "info@rdp.cl" },
    { id: "sup-7", name: "Lubricantes Técnicos SA", taxId: "81.222.333-4", email: "ventas@lubtec.cl" },
    { id: "sup-8", name: "Importadora Würth", taxId: "79.555.666-1", email: "pedidos@wurth.cl" },
  ];

  const purchaseLines: AppDatabase["purchases"][0]["lines"] = [];
  for (let i = 0; i < 46; i++) {
    if (i < 23) {
      const p = products[i % 8];
      purchaseLines.push({
        id: id("pline", i + 1),
        code: p.manufacturerCode.replace(/-/g, ""),
        description: p.name,
        quantity: 10 + (i % 5),
        unitCost: p.cost,
        productId: p.id,
        status: "associated",
      });
    } else if (i === 25) {
      purchaseLines.push({
        id: id("pline", i + 1),
        code: "ABC991",
        description: "Retén industrial especial",
        quantity: 10,
        unitCost: 3200,
        status: "new_product",
      });
    } else {
      purchaseLines.push({
        id: id("pline", i + 1),
        code: `NEW-${i}`,
        description: `Repuesto genérico línea ${i}`,
        quantity: 5,
        unitCost: 1500 + i * 100,
        status: i % 3 === 0 ? "pending" : "associated",
        productId: products[10 + (i % 20)].id,
      });
    }
  }

  const purchases: AppDatabase["purchases"] = [
    {
      id: "pur-48512",
      supplierId: "sup-1",
      invoiceNumber: "48512",
      status: "in_progress",
      lines: purchaseLines,
      processedCount: 23,
      lastSavedAt: isoMinutesAgo(0.05),
      createdAt: isoMinutesAgo(60 * 3),
    },
  ];

  for (let i = 0; i < 19; i++) {
    purchases.push({
      id: id("pur", i + 2),
      supplierId: suppliers[i % suppliers.length].id,
      invoiceNumber: `${48000 + i}`,
      status: "completed",
      lines: [],
      processedCount: 0,
      createdAt: isoMinutesAgo(60 * 24 * (i + 1)),
      completedAt: isoMinutesAgo(60 * 24 * i),
    });
  }

  const sales: AppDatabase["sales"] = [];
  for (let i = 0; i < 200; i++) {
    const p = products[i % 15];
    const listing = listings.find((l) => l.productId === p.id);
    const qty = 1 + (i % 3);
    const unit = listing?.price ?? p.price;
    sales.push({
      id: id("sale", i + 1),
      channel: i % 3 === 0 ? "pos" : "mercadolibre",
      externalId: i % 3 !== 0 ? `#${98400 + i}` : undefined,
      lines: [
        {
          productId: p.id,
          sku: p.sku,
          title: listing?.title ?? p.name,
          quantity: qty,
          unitPrice: unit,
          listingId: listing?.id,
        },
      ],
      total: unit * qty,
      status: i < 7 ? "pending_invoice" : i < 12 ? "pending_label" : "completed",
      createdAt: isoMinutesAgo(i * 25),
      customerName: i % 3 === 0 ? "Cliente mostrador" : "Comprador ML",
    });
  }

  const kits: AppDatabase["kits"] = [
    {
      id: "kit-1",
      sku: "KIT-GA11",
      name: "Kit mantenimiento Atlas Copco GA11",
      price: 74990,
      components: [
        { productId: skf.id, sku: "SKF-6204", name: "Rodamiento SKF 6204", quantity: 2 },
        { productId: products.find((p) => p.sku === "GAT-A42")!.id, sku: "GAT-A42", name: "Correa Gates A42", quantity: 1 },
        { productId: products.find((p) => p.sku === "DON-P550388")!.id, sku: "DON-P550388", name: "Filtro Donaldson P550388", quantity: 1 },
      ],
    },
  ];

  for (let k = 2; k <= 10; k++) {
    const comps = products.slice(k * 3, k * 3 + 3);
    kits.push({
      id: id("kit", k),
      sku: `KIT-${100 + k}`,
      name: `Kit ${EQUIPMENT[k % EQUIPMENT.length].brand} ${EQUIPMENT[k % EQUIPMENT.length].models[0]}`,
      price: comps.reduce((s, p) => s + p.price, 0) * 0.9,
      components: comps.map((p) => ({
        productId: p.id,
        sku: p.sku,
        name: p.name,
        quantity: 1 + (k % 2),
      })),
    });
  }

  const alerts: AppDatabase["alerts"] = [
    {
      id: "alert-1",
      type: "low_stock",
      title: "3 productos bajo stock",
      description: "Correa Gates A42 y otros requieren reposición.",
      severity: "warning",
      createdAt: isoMinutesAgo(30),
      resolved: false,
    },
    {
      id: "alert-2",
      type: "stock_mismatch",
      title: "Correa Gates A42 desincronizada",
      description: "Sistema: 8 · Mercado Libre: 12",
      severity: "warning",
      createdAt: isoMinutesAgo(15),
      resolved: false,
    },
    {
      id: "alert-3",
      type: "orphan_listing",
      title: "Publicación MLB-285839 sin SKU",
      description: "No está asociada a ningún producto.",
      severity: "error",
      createdAt: isoMinutesAgo(120),
      resolved: false,
    },
    {
      id: "alert-4",
      type: "duplicate_product",
      title: "Posible duplicado SKF 6204",
      description: "SKF 6204 vs Rodamiento SKF 6204",
      severity: "info",
      createdAt: isoMinutesAgo(200),
      resolved: false,
    },
    {
      id: "alert-5",
      type: "pending_invoice",
      title: "1 factura electrónica pendiente",
      description: "Venta ML #98452 aguarda emisión.",
      severity: "warning",
      createdAt: isoMinutesAgo(5),
      resolved: false,
    },
  ];

  const audit: AppDatabase["audit"] = [
    { id: "aud-1", user: "Pablo", action: "Actualizó precio", detail: "SKF-6204 · $11.990 → $12.490", createdAt: isoMinutesAgo(45) },
    { id: "aud-2", user: "Sergio", action: "Ajustó stock", detail: "SKF-6204 · 21 → 20", createdAt: isoMinutesAgo(90) },
    { id: "aud-3", user: "Sistema", action: "Sincronizó Mercado Libre", detail: "Stock SKF-6204 · 20 → 20", createdAt: isoMinutesAgo(120) },
  ];

  for (let i = 0; i < 50; i++) {
    audit.push({
      id: id("aud", i + 4),
      user: i % 2 === 0 ? "Pablo" : "Sergio",
      action: i % 3 === 0 ? "Creó publicación" : "Editó producto",
      detail: `${products[i % 20].sku} · cambio ${i}`,
      createdAt: isoMinutesAgo(200 + i * 10),
    });
  }

  const activity: AppDatabase["activity"] = [
    { id: "act-1", message: "Venta ML #98452", createdAt: isoMinutesAgo(18) },
    { id: "act-2", message: "Stock actualizado SKU SKF-6204", createdAt: isoMinutesAgo(23) },
    { id: "act-3", message: "Factura proveedor ingresada", createdAt: isoMinutesAgo(39) },
    { id: "act-4", message: "Publicación actualizada", createdAt: isoMinutesAgo(66) },
  ];

  const billing: AppDatabase["billing"] = sales
    .filter((s) => s.status !== "completed")
    .slice(0, 15)
    .map((s, i) => ({
      id: id("bill", i + 1),
      saleId: s.id,
      status: "pending" as const,
      total: s.total,
      customerName: s.customerName ?? "Cliente",
    }));

  const labels: AppDatabase["labels"] = sales
    .filter((s) => s.status === "pending_label" || s.status === "pending_invoice")
    .slice(0, 8)
    .map((s, i) => ({
      id: id("label", i + 1),
      saleId: s.id,
      productTitle: s.lines[0].title,
      equipmentLabel: s.lines[0].title.includes("Atlas") ? "Atlas Copco GA11" : "Equipo industrial",
      sku: s.lines[0].sku,
      quantity: s.lines[0].quantity,
      orderRef: s.externalId ?? `#493${20 + i}`,
      status: "pending" as const,
    }));

  return {
    products,
    compatibilities,
    listings,
    sales,
    suppliers,
    purchases,
    movements,
    kits,
    alerts,
    audit,
    activity,
    billing,
    labels,
    lastMlSyncAt: isoMinutesAgo(2),
  };
}
