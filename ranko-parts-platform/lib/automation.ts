import { prisma } from "@/lib/db";
import type {
  AutomationData,
  AutomationLog,
  CanalPaso,
  Paso,
  SecuenciaRow,
  TipoSecuencia,
} from "@/lib/automation-config";
import { PLANTILLAS_BUILTIN } from "@/lib/automation-config";

// Re-export everything so existing imports keep working
export type {
  AutomationData,
  AutomationLog,
  CanalPaso,
  Paso,
  PlantillaPreview,
  SecuenciaRow,
  TipoSecuencia,
} from "@/lib/automation-config";
export { PLANTILLAS_BUILTIN } from "@/lib/automation-config";

// ─── Dispatch payload ─────────────────────────────────────────────────────────

export type DispatchPayload = {
  plantillaId: string;
  canal: CanalPaso;
  destinatario: string;
  variables: Record<string, string>;
};

// ─── Fallback data ────────────────────────────────────────────────────────────

function buildFallback(): AutomationData {
  const secuencias: SecuenciaRow[] = [
    {
      id: "seq-1",
      nombre: "Nurturing Lead Nuevo",
      tipo: "LEAD_NUEVO" as TipoSecuencia,
      activa: true,
      disparos: 47,
      createdAt: "2025-01-15",
      pasos: [
        { id: "p1", orden: 1, canal: "WHATSAPP", plantillaId: "tpl-lead-nuevo-wa", delayHoras: 0 },
        { id: "p2", orden: 2, canal: "EMAIL", plantillaId: "tpl-lead-nuevo-email", delayHoras: 1 },
      ],
    },
    {
      id: "seq-2",
      nombre: "Seguimiento Cotización",
      tipo: "COTIZACION_ENVIADA" as TipoSecuencia,
      activa: true,
      disparos: 31,
      createdAt: "2025-02-03",
      pasos: [
        { id: "p3", orden: 1, canal: "WHATSAPP", plantillaId: "tpl-cotizacion-wa", delayHoras: 0 },
        { id: "p4", orden: 2, canal: "EMAIL", plantillaId: "tpl-cotizacion-email", delayHoras: 2 },
      ],
    },
    {
      id: "seq-3",
      nombre: "Cobranza Factura Vencida",
      tipo: "FACTURA_VENCIDA" as TipoSecuencia,
      activa: true,
      disparos: 19,
      createdAt: "2025-02-20",
      pasos: [
        { id: "p5", orden: 1, canal: "WHATSAPP", plantillaId: "tpl-factura-vencida-wa", delayHoras: 0 },
        { id: "p6", orden: 2, canal: "EMAIL", plantillaId: "tpl-factura-vencida-email", delayHoras: 24 },
        { id: "p7", orden: 3, canal: "WHATSAPP", plantillaId: "tpl-factura-vencida-wa", delayHoras: 72 },
      ],
    },
    {
      id: "seq-4",
      nombre: "Recompra Automática",
      tipo: "RECOMPRA_PROGRAMADA" as TipoSecuencia,
      activa: false,
      disparos: 8,
      createdAt: "2025-03-10",
      pasos: [
        { id: "p8", orden: 1, canal: "WHATSAPP", plantillaId: "tpl-recompra-wa", delayHoras: 0 },
      ],
    },
    {
      id: "seq-5",
      nombre: "Bienvenida + Onboarding",
      tipo: "BIENVENIDA_CLIENTE" as TipoSecuencia,
      activa: true,
      disparos: 12,
      createdAt: "2025-03-22",
      pasos: [
        { id: "p9", orden: 1, canal: "EMAIL", plantillaId: "tpl-bienvenida-email", delayHoras: 0 },
        { id: "p10", orden: 2, canal: "WHATSAPP", plantillaId: "tpl-lead-nuevo-wa", delayHoras: 24 },
      ],
    },
  ];

  const logs: AutomationLog[] = [
    { id: "l1", secuencia: "Nurturing Lead Nuevo", canal: "WHATSAPP", destinatario: "+58 412 555-0101", estado: "ENVIADO", timestamp: "Hoy 09:14" },
    { id: "l2", secuencia: "Seguimiento Cotización", canal: "EMAIL", destinatario: "taller@demo.com", estado: "ENVIADO", timestamp: "Hoy 08:50" },
    { id: "l3", secuencia: "Cobranza Factura Vencida", canal: "WHATSAPP", destinatario: "+58 424 555-0202", estado: "FALLIDO", timestamp: "Ayer 18:32" },
    { id: "l4", secuencia: "Bienvenida + Onboarding", canal: "EMAIL", destinatario: "nuevo@demo.com", estado: "ENVIADO", timestamp: "Ayer 15:10" },
    { id: "l5", secuencia: "Nurturing Lead Nuevo", canal: "EMAIL", destinatario: "lead2@demo.com", estado: "ENVIADO", timestamp: "Ayer 11:05" },
    { id: "l6", secuencia: "Cobranza Factura Vencida", canal: "EMAIL", destinatario: "moroso@demo.com", estado: "PENDIENTE", timestamp: "Hoy 10:00" },
  ];

  return {
    secuencias,
    plantillas: PLANTILLAS_BUILTIN,
    logs,
    stats: {
      secuenciasActivas: secuencias.filter((s) => s.activa).length,
      mensajesHoy: 4,
      tasaEntrega: 87,
      pendientes: 1,
    },
    isFallback: true,
  };
}

// ─── Real data ────────────────────────────────────────────────────────────────

export async function getAutomationData(): Promise<AutomationData> {
  try {
    const rows = await prisma.secuenciaAutomatica.findMany({
      orderBy: { createdAt: "desc" },
    });

    const secuencias: SecuenciaRow[] = rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      tipo: r.tipo as TipoSecuencia,
      activa: r.activa,
      pasos: (r.pasos as Paso[]) ?? [],
      disparos: 0,
      createdAt: r.createdAt.toISOString().split("T")[0],
    }));

    return {
      secuencias,
      plantillas: PLANTILLAS_BUILTIN,
      logs: [],
      stats: {
        secuenciasActivas: secuencias.filter((s) => s.activa).length,
        mensajesHoy: 0,
        tasaEntrega: 100,
        pendientes: 0,
      },
      isFallback: false,
    };
  } catch {
    console.warn("Automation fallback activo: base de datos no disponible.");
    return buildFallback();
  }
}

// ─── Dispatch helpers ─────────────────────────────────────────────────────────

function renderPlantilla(cuerpo: string, vars: Record<string, string>): string {
  return cuerpo.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}

export async function dispatchMensaje(
  payload: DispatchPayload,
): Promise<{ ok: boolean; error?: string }> {
  const plantilla = PLANTILLAS_BUILTIN.find((p) => p.id === payload.plantillaId);
  if (!plantilla) return { ok: false, error: "Plantilla no encontrada" };

  const mensaje = renderPlantilla(plantilla.cuerpo, payload.variables);

  if (payload.canal === "EMAIL") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[Automation] RESEND_API_KEY no configurada — email simulado:",
        payload.destinatario,
      );
      return { ok: true };
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM ?? "Ranko Parts <noreply@rankoparts.com>",
        to: payload.destinatario,
        subject: plantilla.asunto
          ? renderPlantilla(plantilla.asunto, payload.variables)
          : "Ranko Parts",
        text: mensaje,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  if (payload.canal === "WHATSAPP") {
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneId = process.env.META_WHATSAPP_PHONE_ID;
    if (!token || !phoneId) {
      console.warn(
        "[Automation] META_WHATSAPP_TOKEN/PHONE_ID no configurados — WA simulado:",
        payload.destinatario,
      );
      return { ok: true };
    }
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: payload.destinatario.replace(/\D/g, ""),
            type: "text",
            text: { body: mensaje },
          }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, error: text };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  return { ok: true }; // INTERNO
}
