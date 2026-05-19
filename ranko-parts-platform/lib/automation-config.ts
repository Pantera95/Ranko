// ─── Types and static constants (NO server imports — safe for client components) ─

export type TipoSecuencia =
  | "LEAD_NUEVO"
  | "COTIZACION_ENVIADA"
  | "FACTURA_VENCIDA"
  | "RECOMPRA_PROGRAMADA"
  | "BIENVENIDA_CLIENTE"
  | "PAGO_RECIBIDO";

export type CanalPaso = "WHATSAPP" | "EMAIL" | "INTERNO";

export type Paso = {
  id: string;
  orden: number;
  canal: CanalPaso;
  plantillaId: string;
  delayHoras: number;
  condicion?: string;
};

export type SecuenciaRow = {
  id: string;
  nombre: string;
  tipo: TipoSecuencia;
  activa: boolean;
  pasos: Paso[];
  disparos: number;
  createdAt: string;
};

export type PlantillaPreview = {
  id: string;
  tipo: TipoSecuencia;
  canal: CanalPaso;
  nombre: string;
  asunto?: string;
  cuerpo: string;
  variables: string[];
};

export type AutomationLog = {
  id: string;
  secuencia: string;
  canal: CanalPaso;
  destinatario: string;
  estado: "ENVIADO" | "FALLIDO" | "PENDIENTE";
  timestamp: string;
};

export type AutomationData = {
  secuencias: SecuenciaRow[];
  plantillas: PlantillaPreview[];
  logs: AutomationLog[];
  stats: {
    secuenciasActivas: number;
    mensajesHoy: number;
    tasaEntrega: number;
    pendientes: number;
  };
  isFallback: boolean;
};

// ─── Built-in templates ───────────────────────────────────────────────────────

export const PLANTILLAS_BUILTIN: PlantillaPreview[] = [
  {
    id: "tpl-lead-nuevo-wa",
    tipo: "LEAD_NUEVO",
    canal: "WHATSAPP",
    nombre: "Lead nuevo — WhatsApp",
    cuerpo:
      "Hola {{nombre}} 👋 Soy de Ranko Parts. Vi tu interes en {{producto}} y quiero ayudarte a conseguirlo al mejor precio. ¿Tienes 2 minutos?",
    variables: ["nombre", "producto"],
  },
  {
    id: "tpl-lead-nuevo-email",
    tipo: "LEAD_NUEVO",
    canal: "EMAIL",
    nombre: "Lead nuevo — Email",
    asunto: "Ranko Parts — Recibimos tu consulta sobre {{producto}}",
    cuerpo:
      "Hola {{nombre}},\n\nGracias por contactar a Ranko Parts. Hemos recibido tu consulta sobre {{producto}} y un asesor te responderá en menos de 2 horas.\n\nMientras tanto, puedes revisar nuestro catálogo en línea.\n\nSaludos,\nEquipo Ranko Parts",
    variables: ["nombre", "producto"],
  },
  {
    id: "tpl-cotizacion-wa",
    tipo: "COTIZACION_ENVIADA",
    canal: "WHATSAPP",
    nombre: "Cotización enviada — WhatsApp",
    cuerpo:
      "Hola {{nombre}}, te enviamos la cotización {{numero}} por ${{total}} USD. Válida hasta el {{vencimiento}}. ¿La revisas y me confirmas? 🔧",
    variables: ["nombre", "numero", "total", "vencimiento"],
  },
  {
    id: "tpl-cotizacion-email",
    tipo: "COTIZACION_ENVIADA",
    canal: "EMAIL",
    nombre: "Cotización enviada — Email",
    asunto: "Tu cotización {{numero}} — Ranko Parts",
    cuerpo:
      "Hola {{nombre}},\n\nAdjuntamos tu cotización {{numero}} por un total de ${{total}} USD.\n\nEsta cotización es válida hasta el {{vencimiento}}. Para aceptarla o solicitar modificaciones, responde este correo o escríbenos por WhatsApp.\n\nSaludos,\nEquipo Ranko Parts",
    variables: ["nombre", "numero", "total", "vencimiento"],
  },
  {
    id: "tpl-factura-vencida-wa",
    tipo: "FACTURA_VENCIDA",
    canal: "WHATSAPP",
    nombre: "Factura vencida — WhatsApp",
    cuerpo:
      "Hola {{nombre}} 👋 Te recuerdo que la factura {{factura}} por ${{monto}} USD venció el {{fecha}}. Escríbenos para coordinar el pago y evitar recargos. ¡Gracias!",
    variables: ["nombre", "factura", "monto", "fecha"],
  },
  {
    id: "tpl-factura-vencida-email",
    tipo: "FACTURA_VENCIDA",
    canal: "EMAIL",
    nombre: "Factura vencida — Email",
    asunto: "Recordatorio de pago — Factura {{factura}}",
    cuerpo:
      "Estimado {{nombre}},\n\nEsta es una notificación de pago pendiente.\n\n• Factura: {{factura}}\n• Monto: ${{monto}} USD\n• Fecha de vencimiento: {{fecha}}\n\nPor favor realiza el pago a la brevedad para evitar recargos por mora.\n\nContacta a tu ejecutivo de cuenta por cualquier consulta.\n\nSaludos,\nRanko Parts — Administración",
    variables: ["nombre", "factura", "monto", "fecha"],
  },
  {
    id: "tpl-recompra-wa",
    tipo: "RECOMPRA_PROGRAMADA",
    canal: "WHATSAPP",
    nombre: "Recompra programada — WhatsApp",
    cuerpo:
      "Hola {{nombre}} 🔧 Hace {{dias}} días compraste {{producto}}. Según el ciclo de uso típico, podrías necesitar reposición pronto. ¿Te preparo un precio especial?",
    variables: ["nombre", "dias", "producto"],
  },
  {
    id: "tpl-bienvenida-email",
    tipo: "BIENVENIDA_CLIENTE",
    canal: "EMAIL",
    nombre: "Bienvenida cliente — Email",
    asunto: "Bienvenido a Ranko Parts, {{nombre}}",
    cuerpo:
      "Hola {{nombre}},\n\nTe damos la bienvenida a Ranko Parts. Tu cuenta ha sido activada con éxito.\n\n🔑 Tu código de referido es: {{codigoReferido}}\n💳 Límite de crédito: ${{limiteCredito}} USD\n\nPuedes acceder a tu portal en cualquier momento para revisar pedidos, facturas y cotizaciones.\n\nSaludos,\nEquipo Ranko Parts",
    variables: ["nombre", "codigoReferido", "limiteCredito"],
  },
  {
    id: "tpl-pago-recibido-wa",
    tipo: "PAGO_RECIBIDO",
    canal: "WHATSAPP",
    nombre: "Pago recibido — WhatsApp",
    cuerpo:
      "✅ Hola {{nombre}}, confirmamos la recepción de tu pago de ${{monto}} USD para la factura {{factura}}. ¡Gracias por tu confianza en Ranko Parts!",
    variables: ["nombre", "monto", "factura"],
  },
];
