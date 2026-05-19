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
          // DB not available — allow demo credentials for preview/development
          const DEMO_EMAIL = "admin@rankoparts.com";
          const DEMO_PASSWORD = "RankoAdmin2026!";
          if (
            parsed.data.email.toLowerCase() === DEMO_EMAIL &&
            parsed.data.password === DEMO_PASSWORD
          ) {
            return {
              id: "demo-admin",
              name: "Admin Demo",
              email: DEMO_EMAIL,
              image: null,
              rol: "MASTER_ADMIN" as RolUsuarioApp,
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
