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

        if (!parsed.success) {
          return null;
        }

        try {
          const usuario = await prisma.usuario.findUnique({
            where: { email: parsed.data.email.toLowerCase() },
          });

          if (!usuario?.activo) {
            return null;
          }

          const passwordOk = await compare(parsed.data.password, usuario.passwordHash);

          if (!passwordOk) {
            return null;
          }

          return {
            id: usuario.id,
            name: usuario.nombre,
            email: usuario.email,
            image: usuario.avatar,
            rol: usuario.rol,
          };
        } catch {
          // DB not available — allow demo credentials for preview/development.
          // Each role has a fixed password so the entire platform can be
          // tested end-to-end without a live database connection.
          const DEMO_ACCOUNTS: Array<{
            email: string;
            password: string;
            id: string;
            name: string;
            rol: RolUsuarioApp;
          }> = [
            {
              email: "admin@rankoparts.com",
              password: "RankoAdmin2026!",
              id: "demo-admin",
              name: "Admin Demo",
              rol: "MASTER_ADMIN",
            },
            {
              email: "vendedor@rankoparts.com",
              password: "RankoVendedor2026!",
              id: "demo-vendedor",
              name: "Vendedor Demo",
              rol: "VENDEDOR",
            },
            {
              email: "almacen@rankoparts.com",
              password: "RankoAlmacen2026!",
              id: "demo-almacen",
              name: "Almacén Demo",
              rol: "ALMACEN",
            },
            {
              email: "viewer@rankoparts.com",
              password: "RankoViewer2026!",
              id: "demo-viewer",
              name: "Viewer Demo",
              rol: "VIEWER",
            },
            {
              email: "cliente@rankoparts.com",
              password: "RankoCliente2026!",
              id: "demo-cliente-user",
              name: "Cliente Demo",
              rol: "CLIENTE",
            },
          ];

          const match = DEMO_ACCOUNTS.find(
            (a) =>
              a.email === parsed.data.email.toLowerCase() &&
              a.password === parsed.data.password,
          );
          if (match) {
            return {
              id: match.id,
              name: match.name,
              email: match.email,
              image: null,
              rol: match.rol,
            };
          }
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
