import {
  AlertTriangle,
  BarChart3,
  Bot,
  Boxes,
  FileClock,
  FileText,
  Gauge,
  HandCoins,
  LayoutGrid,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

import type { RolUsuarioApp } from "@/lib/roles";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  roles?: RolUsuarioApp[];
};

export type NavGroup = { label: string; items: NavItem[] };

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: Gauge }],
  },
  {
    label: "Ventas",
    items: [
      {
        href: "/admin/crm",
        label: "CRM / Pipeline",
        icon: LayoutGrid,
        roles: ["MASTER_ADMIN", "ADMIN", "VENDEDOR"],
      },
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: Users,
        roles: ["MASTER_ADMIN", "ADMIN", "VENDEDOR"],
      },
      {
        href: "/admin/cotizaciones",
        label: "Cotizaciones",
        icon: FileText,
        roles: ["MASTER_ADMIN", "ADMIN", "VENDEDOR"],
      },
      {
        href: "/admin/facturacion",
        label: "Facturación",
        icon: Receipt,
        roles: ["MASTER_ADMIN", "ADMIN", "VENDEDOR"],
      },
    ],
  },
  {
    label: "Finanzas",
    items: [
      {
        href: "/admin/deudas",
        label: "Panel de deudas",
        icon: HandCoins,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
      {
        href: "/admin/pagos",
        label: "Pagos",
        icon: HandCoins,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
      {
        href: "/admin/alertas",
        label: "Alertas anómalas",
        icon: AlertTriangle,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { href: "/admin/catalogo", label: "Catálogo", icon: Package },
      { href: "/admin/inventario", label: "Inventario", icon: Boxes },
      { href: "/admin/ordenes", label: "Órdenes", icon: Truck },
      {
        href: "/admin/ecommerce",
        label: "E-Commerce",
        icon: ShoppingCart,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      {
        href: "/admin/reportes",
        label: "Reportes / BI",
        icon: BarChart3,
        roles: ["MASTER_ADMIN", "ADMIN", "VIEWER"],
      },
      {
        href: "/admin/automatizacion",
        label: "Automatización",
        icon: Bot,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
      {
        href: "/admin/referidos",
        label: "Referidos",
        icon: Users,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        href: "/admin/usuarios",
        label: "Usuarios",
        icon: UserCog,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
      {
        href: "/admin/logs",
        label: "Logs auditoría",
        icon: FileClock,
        roles: ["MASTER_ADMIN"],
      },
      {
        href: "/admin/configuracion",
        label: "Configuración",
        icon: Settings,
        roles: ["MASTER_ADMIN", "ADMIN"],
      },
    ],
  },
];
