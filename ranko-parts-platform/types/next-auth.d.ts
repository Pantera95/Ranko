import type { DefaultSession } from "next-auth";
import type { RolUsuarioApp } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: RolUsuarioApp;
    } & DefaultSession["user"];
  }

  interface User {
    rol: RolUsuarioApp;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: RolUsuarioApp;
  }
}
