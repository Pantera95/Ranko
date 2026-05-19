import { createHmac } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// ─── Meta WhatsApp Cloud API Webhook ─────────────────────────────────────────
//
// 1. Verification: Meta sends GET with hub.challenge, hub.verify_token
// 2. Events:       Meta sends POST with messages array (text, status, etc.)
//
// Set WHATSAPP_WEBHOOK_VERIFY_TOKEN and META_APP_SECRET in env vars.
// ─────────────────────────────────────────────────────────────────────────────

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "ranko-webhook-dev";
const APP_SECRET = process.env.META_APP_SECRET ?? "";

// ── Webhook verification (GET) ────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.info("[WhatsApp Webhook] Verificación exitosa");
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// ── Event processing (POST) ───────────────────────────────────────────────────

type WaTextMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: "text";
  text: { body: string };
};

type WaStatusUpdate = {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
};

type WaContact = { profile: { name: string }; wa_id: string };

type WaChange = {
  value: {
    messaging_product: string;
    metadata: { phone_number_id: string };
    contacts?: WaContact[];
    messages?: WaTextMessage[];
    statuses?: WaStatusUpdate[];
  };
  field: string;
};

type WaPayload = {
  object: string;
  entry: Array<{
    id: string;
    changes: WaChange[];
  }>;
};

export async function POST(req: Request) {
  // ── Signature verification ─────────────────────────────────────────────────
  if (APP_SECRET) {
    const rawBody = await req.text();
    const sig = req.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
    if (sig !== expected) {
      console.warn("[WhatsApp Webhook] Firma inválida");
      return new Response("Forbidden", { status: 403 });
    }
    // parse from raw body since we already consumed the stream
    const payload = JSON.parse(rawBody) as WaPayload;
    return handlePayload(payload);
  }

  // ── No secret configured (dev mode) ───────────────────────────────────────
  const payload = (await req.json()) as WaPayload;
  return handlePayload(payload);
}

async function handlePayload(payload: WaPayload): Promise<Response> {
  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const { messages, contacts, statuses } = change.value;

      // ── Inbound messages ─────────────────────────────────────────────────
      if (messages?.length) {
        for (const msg of messages) {
          if (msg.type !== "text") continue;
          const name = contacts?.find((c) => c.wa_id === msg.from)?.profile.name ?? msg.from;
          console.info(`[WhatsApp] Mensaje de ${name} (${msg.from}): ${msg.text.body}`);
          await handleInboundMessage(msg, name);
        }
      }

      // ── Delivery status updates ──────────────────────────────────────────
      if (statuses?.length) {
        for (const st of statuses) {
          console.info(`[WhatsApp] Status ${st.status} para mensaje ${st.id}`);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleInboundMessage(msg: WaTextMessage, name: string): Promise<void> {
  const body = msg.text.body.trim().toLowerCase();

  try {
    // Auto-qualify: if the client has a NUEVO lead → advance to CALIFICANDO
    if (body.includes("si") || body.includes("sí") || body.includes("interesado")) {
      const clienteWithLead = await prisma.cliente.findFirst({
        where: { OR: [{ telefono: { contains: msg.from.slice(-10) } }, { whatsapp: { contains: msg.from.slice(-10) } }] },
        include: { leads: { where: { estado: "NUEVO" }, orderBy: { createdAt: "desc" }, take: 1 } },
      });

      if (clienteWithLead?.leads[0]) {
        const lead = clienteWithLead.leads[0];
        await prisma.lead.update({
          where: { id: lead.id },
          data: { estado: "CALIFICANDO" },
        });
        console.info(`[WhatsApp] Lead ${lead.id} avanzado → CALIFICANDO por respuesta inbound`);
      }
    }

    // Create an Interaccion log if we can resolve the cliente
    const cliente = await prisma.cliente.findFirst({
      where: { OR: [{ telefono: { contains: msg.from.slice(-10) } }, { whatsapp: { contains: msg.from.slice(-10) } }] },
      select: { id: true },
    });

    if (cliente) {
      // Find a system user to log the interaction against
      const systemUser = await prisma.usuario.findFirst({
        where: { rol: "ADMIN" },
        select: { id: true },
      });

      if (systemUser) {
        await prisma.interaccion.create({
          data: {
            clienteId: cliente.id,
            usuarioId: systemUser.id,
            tipo: "WHATSAPP",
            descripcion: `Mensaje inbound: "${msg.text.body.slice(0, 200)}"`,
            resultado: "Recibido",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[WhatsApp] Error procesando mensaje inbound:", err);
  }

  void name; // consumed above
}
