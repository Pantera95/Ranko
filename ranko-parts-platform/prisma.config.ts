import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // db push / migrate prefieren conexión directa (DIRECT_URL en Supabase
    // apunta al port 5432 sin pgbouncer). Si no está disponible, caemos a
    // DATABASE_URL (puede ser pgbouncer-pooled — funciona para queries pero
    // no soporta DDL transaccional en algunas versiones).
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"] || "",
  },
});
