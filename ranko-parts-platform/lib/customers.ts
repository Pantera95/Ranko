import type { FuenteCliente, TemperaturaLead, TipoCliente } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type CustomerVehicle = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
};

export type CustomerRow = {
  id: string;
  nombre: string;
  empresa: string;
  tipo: TipoCliente;
  telefono: string;
  whatsapp: string;
  email: string;
  ciudad: string;
  rif: string;
  condicionPago: string;
  limiteCredito: string;
  scoring: number;
  temperatura: TemperaturaLead;
  fuente: FuenteCliente;
  vendedor: string;
  vehiculos: CustomerVehicle[];
  totalLeads: number;
  totalFacturas: number;
  bloqueado: boolean;
  activo: boolean;
  createdAt: string;
};

export type CustomersData = {
  clientes: CustomerRow[];
  metrics: {
    label: string;
    value: string;
    helper: string;
    danger?: boolean;
  }[];
  isFallback: boolean;
};

const fallbackClientes: CustomerRow[] = [
  {
    id: "demo-cliente-taller",
    nombre: "Taller Demo Caracas",
    empresa: "Taller Demo Caracas C.A.",
    tipo: "TALLER",
    telefono: "+58 414-5550001",
    whatsapp: "+58 414-5550001",
    email: "taller@demo.com",
    ciudad: "Caracas",
    rif: "J-12345678-9",
    condicionPago: "30 dias",
    limiteCredito: "$2,500.00",
    scoring: 82,
    temperatura: "CALIENTE",
    fuente: "ADS",
    vendedor: "Admin Ranko",
    vehiculos: [
      { id: "demo-v1", marca: "Jeep", modelo: "Grand Cherokee", anio: 2014 },
    ],
    totalLeads: 3,
    totalFacturas: 7,
    bloqueado: false,
    activo: true,
    createdAt: "2026-01-15",
  },
  {
    id: "demo-cliente-dist",
    nombre: "Distribuidor Oriente",
    empresa: "Auto Partes Oriente S.R.L.",
    tipo: "DISTRIBUIDOR_REGIONAL",
    telefono: "+58 281-5550002",
    whatsapp: "+58 281-5550002",
    email: "ventas@autopartsoriente.com",
    ciudad: "Lecheria",
    rif: "J-98765432-1",
    condicionPago: "15 dias",
    limiteCredito: "$8,000.00",
    scoring: 91,
    temperatura: "CALIENTE",
    fuente: "REFERIDO",
    vendedor: "Admin Ranko",
    vehiculos: [],
    totalLeads: 1,
    totalFacturas: 14,
    bloqueado: false,
    activo: true,
    createdAt: "2025-11-03",
  },
  {
    id: "demo-cliente-minorista",
    nombre: "Carlos Mendoza",
    empresa: "",
    tipo: "MINORISTA",
    telefono: "+58 412-5550003",
    whatsapp: "+58 412-5550003",
    email: "carlos@email.com",
    ciudad: "Caracas",
    rif: "",
    condicionPago: "Contado",
    limiteCredito: "$0.00",
    scoring: 55,
    temperatura: "TIBIO",
    fuente: "WHATSAPP",
    vendedor: "—",
    vehiculos: [
      { id: "demo-v2", marca: "Jeep", modelo: "Wrangler", anio: 2018 },
    ],
    totalLeads: 1,
    totalFacturas: 2,
    bloqueado: false,
    activo: true,
    createdAt: "2026-03-20",
  },
];

export async function getCustomersData(): Promise<CustomersData> {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: [{ activo: "desc" }, { scoring: "desc" }, { nombre: "asc" }],
      take: 200,
      include: {
        usuarioAsignado: { select: { nombre: true } },
        vehiculos: { select: { id: true, marca: true, modelo: true, anio: true }, take: 5 },
        _count: { select: { leads: true, facturas: true } },
      },
    });

    const rows: CustomerRow[] = clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      empresa: c.empresa ?? "",
      tipo: c.tipo,
      telefono: c.telefono,
      whatsapp: c.whatsapp ?? "",
      email: c.email ?? "",
      ciudad: c.ciudad ?? "",
      rif: c.rif ?? "",
      condicionPago: c.condicionPago ?? "Contado",
      limiteCredito: formatUsd(c.limiteCredito.toString()),
      scoring: c.scoring,
      temperatura: c.temperatura,
      fuente: c.fuente,
      vendedor: c.usuarioAsignado?.nombre ?? "—",
      vehiculos: c.vehiculos,
      totalLeads: c._count.leads,
      totalFacturas: c._count.facturas,
      bloqueado: c.bloqueado,
      activo: c.activo,
      createdAt: c.createdAt.toISOString().slice(0, 10),
    }));

    return buildCustomersData(rows, false);
  } catch {
    console.warn("Clientes fallback activo: base de datos no disponible.");
    return buildCustomersData(fallbackClientes, true);
  }
}

function buildCustomersData(clientes: CustomerRow[], isFallback: boolean): CustomersData {
  const activos = clientes.filter((c) => c.activo && !c.bloqueado).length;
  const b2b = clientes.filter(
    (c) =>
      c.tipo === "TALLER" ||
      c.tipo === "DISTRIBUIDOR_LOCAL" ||
      c.tipo === "DISTRIBUIDOR_REGIONAL",
  ).length;
  const scoringProm =
    clientes.length > 0
      ? Math.round(clientes.reduce((s, c) => s + c.scoring, 0) / clientes.length)
      : 0;
  const bloqueados = clientes.filter((c) => c.bloqueado).length;

  return {
    isFallback,
    clientes,
    metrics: [
      { label: "Clientes activos", value: String(activos), helper: "Sin bloqueo registrado" },
      { label: "Clientes B2B", value: String(b2b), helper: "Talleres y distribuidores" },
      { label: "Scoring promedio", value: String(scoringProm), helper: "Sobre 100 puntos" },
      {
        label: "Bloqueados",
        value: String(bloqueados),
        helper: "Requieren revision",
        danger: bloqueados > 0,
      },
    ],
  };
}
