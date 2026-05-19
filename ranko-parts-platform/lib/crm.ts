import { EstadoLead, TemperaturaLead } from "@prisma/client";

import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/formatters";

export type PipelineLead = {
  id: string;
  cliente: string;
  empresa?: string | null;
  tipo: string;
  ciudad?: string | null;
  valor: string;
  temperatura: TemperaturaLead;
  vendedor: string;
  updatedAt: string;
  notas?: string | null;
};

export type PipelineStage = {
  id: EstadoLead;
  title: string;
  description: string;
  leads: PipelineLead[];
};

export type CrmPipelineData = {
  stages: PipelineStage[];
  metrics: {
    label: string;
    value: string;
    helper: string;
  }[];
  isFallback: boolean;
};

const stageMeta: Record<EstadoLead, { title: string; description: string }> = {
  NUEVO: { title: "Nuevo", description: "Entradas web, WhatsApp y referidos" },
  CALIFICANDO: { title: "Calificando", description: "Validando necesidad y compatibilidad" },
  COTIZADO: { title: "Cotizado", description: "Propuesta enviada" },
  EN_NEGOCIACION: { title: "Negociacion", description: "Ajustes de precio, stock o entrega" },
  CIERRE_PENDIENTE: { title: "Cierre", description: "Pago, aprobacion o despacho pendiente" },
  VENTA_CERRADA: { title: "Cerrado", description: "Venta ganada" },
  RECOMPRA: { title: "Recompra", description: "Seguimiento programado" },
  PERDIDO: { title: "Perdido", description: "Sin avance comercial" },
};

const orderedStages: EstadoLead[] = [
  EstadoLead.NUEVO,
  EstadoLead.CALIFICANDO,
  EstadoLead.COTIZADO,
  EstadoLead.EN_NEGOCIACION,
  EstadoLead.CIERRE_PENDIENTE,
  EstadoLead.VENTA_CERRADA,
];

const fallbackLeads: PipelineLead[] = [
  {
    id: "demo-lead-b2b-1",
    cliente: "Taller Demo Caracas",
    empresa: "Taller Demo Caracas",
    tipo: "TALLER",
    ciudad: "Caracas",
    valor: "$1,200.00",
    temperatura: TemperaturaLead.CALIENTE,
    vendedor: "Sin asignar",
    updatedAt: "hoy",
    notas: "Aceites Liqui-Moly y filtros K&N para flota Jeep.",
  },
  {
    id: "demo-lead-b2b-2",
    cliente: "Distribuidor Oriente",
    empresa: "Distribuidor Oriente",
    tipo: "DISTRIBUIDOR_LOCAL",
    ciudad: "Lecheria",
    valor: "$3,800.00",
    temperatura: TemperaturaLead.TIBIO,
    vendedor: "Sin asignar",
    updatedAt: "ayer",
    notas: "Interesado en Mopar y frenos para Jeep Grand Cherokee.",
  },
  {
    id: "demo-lead-b2c-1",
    cliente: "Cliente Wrangler",
    tipo: "MINORISTA",
    ciudad: "Caracas",
    valor: "$320.00",
    temperatura: TemperaturaLead.FRIO,
    vendedor: "Sin asignar",
    updatedAt: "2 dias",
    notas: "Consulta por filtro K&N.",
  },
];

export async function getCrmPipelineData(): Promise<CrmPipelineData> {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        estado: { in: orderedStages },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
      include: {
        cliente: true,
        usuario: true,
      },
    });

    const mappedLeads: PipelineLead[] = leads.map((lead) => ({
      id: lead.id,
      cliente: lead.cliente.nombre,
      empresa: lead.cliente.empresa,
      tipo: lead.cliente.tipo,
      ciudad: lead.cliente.ciudad,
      valor: formatUsd(lead.valorEstimado?.toString() ?? "0"),
      temperatura: lead.temperatura,
      vendedor: lead.usuario?.nombre ?? "Sin asignar",
      updatedAt: formatRelativeDate(lead.updatedAt),
      notas: lead.notas,
    }));

    return {
      isFallback: false,
      stages: buildStages(mappedLeads, leads.map((lead) => ({ id: lead.id, estado: lead.estado }))),
      metrics: [
        { label: "Leads activos", value: String(leads.length), helper: "Pipeline principal" },
        {
          label: "Valor estimado",
          value: formatUsd(
            leads.reduce((total, lead) => total + Number(lead.valorEstimado ?? 0), 0),
          ),
          helper: "Suma ponderable del pipeline",
        },
        {
          label: "Sin vendedor",
          value: String(leads.filter((lead) => !lead.usuarioId).length),
          helper: "Requieren asignacion",
        },
      ],
    };
  } catch {
    console.warn("CRM fallback activo: base de datos no disponible.");

    return {
      isFallback: true,
      stages: buildStages(
        fallbackLeads,
        fallbackLeads.map((lead, index) => ({
          id: lead.id,
          estado:
            index === 0
              ? EstadoLead.NUEVO
              : index === 1
                ? EstadoLead.COTIZADO
                : EstadoLead.CALIFICANDO,
        })),
      ),
      metrics: [
        { label: "Leads activos", value: String(fallbackLeads.length), helper: "Modo demo" },
        { label: "Valor estimado", value: "$5,320.00", helper: "Modo demo" },
        { label: "Sin vendedor", value: String(fallbackLeads.length), helper: "Modo demo" },
      ],
    };
  }
}

function buildStages(
  leads: PipelineLead[],
  leadStages: { id: string; estado: EstadoLead }[],
): PipelineStage[] {
  return orderedStages.map((stage) => ({
    id: stage,
    title: stageMeta[stage].title,
    description: stageMeta[stage].description,
    leads: leads.filter((lead) => leadStages.find((item) => item.id === lead.id)?.estado === stage),
  }));
}

function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / 3_600_000));

  if (diffHours < 1) {
    return "ahora";
  }

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return `${Math.floor(diffHours / 24)}d`;
}

export const crmStageIds = orderedStages;
