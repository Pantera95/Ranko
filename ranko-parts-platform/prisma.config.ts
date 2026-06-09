import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // db push / migrate necesitan conexión directa (no pgbouncer-pooled).
    // En Supabase DIRECT_URL apunta al port 5432 sin pool. DATABASE_URL es
    // el connection-pooled (6543) que usa la app en runtime.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] ?? "",
  },
});
