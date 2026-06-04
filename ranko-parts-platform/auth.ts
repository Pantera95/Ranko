import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import type { RolUsuarioApp } from "@/lib/roles";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Demo accounts that work in every environment, regardless of whether a real
 * DATABASE_URL is connected. Used for product walkthroughs and role-based
 * UI testing. These are checked BEFORE the DB lookup so they always win.
 *
 * To disable on a specific production environment set DISABLE_DEMO_LOGIN=1
 * — useful once the platform is in real customer-facing production.
 */
const DEMO_ACCOUNTS: Array<{
  email: string;
  password: string;
  id: string;
  name: string;
  rol: RolUsuarioApp;
}> = [
  { email: "admin@rankoparts.com",    password: "RankoAdmin2026!",    id: "demo-admin",    name: "Admin Demo",    rol: "MASTER_ADMIN" },
  { email: "vendedor@rankoparts.com", password: "RankoVendedor2026!", id: "demo-vendedor", name: "Vendedor Demo", rol: "VENDEDOR" },
  { email: "almacen@rankoparts.com",  password: "RankoAlmacen2026!",  id: "demo-almacen",  name: "Almacén Demo",  rol: "ALMACEN" },
  { email: "viewer@rankoparts.com",   password: "RankoViewer2026!",   id: "demo-viewer",   name: "Viewer Demo",   rol: "VIEWER" },
  { email: "cliente@rankoparts.com",  password: "RankoCliente2026!",  id: "demo-cliente-user", name: "Cliente Demo", rol: "CLIENTE" },
];

function matchDemoAccount(email: string, password: string) {
  if (process.env.DISABLE_DEMO_LOGIN === "1") return null;
  const m = DEMO_ACCOUNTS.find((a) => a.email === email && a.password === password);
  return m ? { id: m.id, name: m.name, email: m.email, image: null, rol: m.rol } : null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login/equipo",
  },
  providers: [
    Credentials({
      name: "Email y password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const password = parsed.data.password;

        // 1) Demo accounts always work first (unless DISABLE_DEMO_LOGIN=1).
        //    This lets the platform be walked through with role-based UI in
        //    any environment — preview, demo deploy, local dev — without
        //    requiring the real users table to be seeded.
        const demoMatch = matchDemoAccount(email, password);
        if (demoMatch) return demoMatch;

        // 2) Otherwise fall through to the real DB lookup.
        try {
          const usuario = await prisma.usuario.findUnique({ where: { email } });
          if (!usuario?.activo) return null;
          const ok = await compare(password, usuario.passwordHash);
          if (!ok) return null;

          return {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.email,
            image: usuario.avatar,
            rol: usuario.rol,
          };
        } catch {
          // DB unavailable → demo accounts are the only viable login path,
          // and we already returned above if one matched. Anything else fails.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.rol = token.rol as RolUsuarioApp;
      }

      return session;
    },
  },
});
