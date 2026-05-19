import { z } from "zod";

export const publicLeadSchema = z.object({
  nombre: z.string().trim().min(2, "Indica tu nombre").max(120),
  empresa: z.string().trim().max(160).optional().or(z.literal("")),
  tipo: z
    .enum(["MINORISTA", "TALLER", "DISTRIBUIDOR_LOCAL", "DISTRIBUIDOR_REGIONAL", "VIP"])
    .default("TALLER"),
  telefono: z.string().trim().min(7, "Indica un telefono valido").max(30),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Email invalido").optional().or(z.literal("")),
  ciudad: z.string().trim().max(80).optional().or(z.literal("")),
  vehiculoMarca: z.string().trim().max(80).optional().or(z.literal("")),
  vehiculoModelo: z.string().trim().max(80).optional().or(z.literal("")),
  vehiculoAnio: z.string().trim().max(4).optional().or(z.literal("")),
  interes: z.string().trim().min(4, "Cuéntanos que necesitas").max(600),
  canal: z.enum(["B2B", "CONTACTO", "TIENDA"]).default("B2B"),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;
