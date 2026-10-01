export type ProductStatus = "active" | "low_stock" | "inactive";

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  manufacturerCode: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  oem?: string;
  status: ProductStatus;
  createdAt: string;
}

export interface Compatibility {
  id: string;
  productId: string;
  equipmentBrand: string;
  equipmentType: string;
  model: string;
  series: string;
  yearRange?: string;
  notes?: string;
}

export interface MarketplaceListing {
  id: string;
  mlId: string;
  productId: string;
  compatibilityId?: string;
  title: string;
  price: number;
  stock: number;
  mlStock: number;
  status: "synced" | "out_of_sync" | "error" | "draft";
  lastSyncAt?: string;
  errorMessage?: string;
}

export type SaleChannel = "mercadolibre" | "pos" | "web";

export interface SaleLine {
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  listingId?: string;
}

export interface Sale {
  id: string;
  channel: SaleChannel;
  externalId?: string;
  lines: SaleLine[];
  total: number;
  status: "pending_invoice" | "pending_label" | "completed" | "processing";
  createdAt: string;
  customerName?: string;
}

export interface Supplier {
  id: string;
  name: string;
  taxId: string;
  email: string;
}

export type PurchaseLineStatus = "associated" | "new_product" | "pending";

export interface PurchaseLine {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unitCost: number;
  productId?: string;
  status: PurchaseLineStatus;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  invoiceNumber: string;
  status: "draft" | "in_progress" | "completed";
  lines: PurchaseLine[];
  processedCount: number;
  lastSavedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  sku: string;
  delta: number;
  stockAfter: number;
  reason: string;
  origin: string;
  user: string;
  createdAt: string;
}

export interface KitComponent {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
}

export interface Kit {
  id: string;
  sku: string;
  name: string;
  price: number;
  components: KitComponent[];
}

export type AlertType =
  | "stock_mismatch"
  | "low_stock"
  | "orphan_listing"
  | "duplicate_product"
  | "pending_invoice";

export interface SystemAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  severity: "warning" | "error" | "info";
  createdAt: string;
  resolved: boolean;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  createdAt: string;
}

export interface BillingDocument {
  id: string;
  saleId: string;
  number?: string;
  status: "pending" | "issued" | "accepted" | "rejected";
  total: number;
  customerName: string;
  issuedAt?: string;
}

export interface LabelJob {
  id: string;
  saleId: string;
  productTitle: string;
  equipmentLabel: string;
  sku: string;
  quantity: number;
  orderRef: string;
  status: "pending" | "printed";
}

export interface AppDatabase {
  products: Product[];
  compatibilities: Compatibility[];
  listings: MarketplaceListing[];
  sales: Sale[];
  suppliers: Supplier[];
  purchases: PurchaseInvoice[];
  movements: InventoryMovement[];
  kits: Kit[];
  alerts: SystemAlert[];
  audit: AuditEntry[];
  activity: ActivityItem[];
  billing: BillingDocument[];
  labels: LabelJob[];
  lastMlSyncAt?: string;
}
