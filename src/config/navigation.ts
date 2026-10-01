import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Archive,
  ClipboardList,
  FileText,
  History,
  Home,
  Layers,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  Warehouse,
} from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  children?: { title: string; href: string }[];
};

export const navigation: NavItem[] = [
  { title: "Inicio", href: "/dashboard", icon: Home },
  {
    title: "Ventas",
    icon: ShoppingCart,
    children: [
      { title: "Ventas", href: "/sales" },
      { title: "Punto de venta", href: "/pos" },
    ],
  },
  {
    title: "Productos",
    icon: Package,
    children: [
      { title: "Productos", href: "/products" },
      { title: "Compatibilidades", href: "/compatibilities" },
      { title: "Kits y packs", href: "/kits" },
    ],
  },
  {
    title: "Inventario",
    icon: Warehouse,
    children: [
      { title: "Stock", href: "/inventory" },
      { title: "Movimientos", href: "/inventory/movements" },
    ],
  },
  {
    title: "Compras",
    icon: ShoppingBag,
    children: [
      { title: "Facturas de compra", href: "/purchases" },
      { title: "Proveedores", href: "/purchases/suppliers" },
    ],
  },
  {
    title: "Mercado Libre",
    icon: Store,
    children: [
      { title: "Publicaciones", href: "/marketplace/listings" },
      { title: "Sincronización", href: "/marketplace/sync" },
      { title: "Crear publicación", href: "/marketplace/publish" },
    ],
  },
  {
    title: "Despacho",
    icon: Truck,
    children: [{ title: "Etiquetas", href: "/shipping/labels" }],
  },
  {
    title: "Facturación",
    icon: FileText,
    children: [{ title: "Documentos", href: "/billing" }],
  },
  {
    title: "Administración",
    icon: Settings,
    children: [
      { title: "Alertas", href: "/alerts" },
      { title: "Historial", href: "/audit" },
      { title: "Configuración", href: "/settings" },
    ],
  },
];

export const demoIcons = { Archive, ClipboardList, Layers, RefreshCw, Tags, AlertTriangle };
