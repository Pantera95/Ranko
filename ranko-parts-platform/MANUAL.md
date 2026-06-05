# Manual de desarrollo — Ranko Parts Platform

Documentación técnica detallada para programadores que necesiten entender, mantener o extender la plataforma. Asume que ya leíste [README.md](./README.md).

---

## 📚 Tabla de contenidos

1. [Arquitectura general](#arquitectura-general)
2. [Auth flow (NextAuth v5)](#auth-flow-nextauth-v5)
3. [Modelo de datos (Prisma)](#modelo-de-datos-prisma)
4. [Middleware de rutas (proxy.ts)](#middleware-de-rutas-proxyts)
5. [Stock deduction transaccional](#stock-deduction-transaccional)
6. [Pago lifecycle](#pago-lifecycle)
7. [Sistema de diseño UI/UX](#sistema-de-diseño-uiux)
8. [Cómo agregar una nueva sección admin](#cómo-agregar-una-nueva-sección-admin)
9. [Cómo agregar un nuevo endpoint API](#cómo-agregar-un-nuevo-endpoint-api)
10. [Cómo agregar una nueva tabla a la DB](#cómo-agregar-una-nueva-tabla-a-la-db)
11. [Patrones recurrentes](#patrones-recurrentes)
12. [Gotchas y bugs conocidos](#gotchas-y-bugs-conocidos)
13. [Convenciones de código](#convenciones-de-código)

---

## Arquitectura general

```
            ┌─────────────────────────────────────┐
            │      Browser (cliente final)         │
            │  - Públicas: home, tienda, b2b       │
            │  - Cliente portal /cliente/*         │
            │  - Admin SaaS /admin/*               │
            └──────────────┬──────────────────────┘
                           │ HTTPS
                           ▼
            ┌─────────────────────────────────────┐
            │           Vercel Edge                │
            │  ┌──────────────────────────────┐   │
            │  │ proxy.ts (middleware)         │   │
            │  │  - /admin/* → require equipo  │   │
            │  │  - /cliente/* → require CLIENTE│  │
            │  │  - /api/admin/* → 401 si no   │   │
            │  └──────────────┬───────────────┘   │
            │                 ▼                    │
            │  ┌──────────────────────────────┐   │
            │  │ Next.js App Router (Node λ)   │   │
            │  │  - Server Components          │   │
            │  │  - API Routes                 │   │
            │  │  - Auth.js callbacks          │   │
            │  └──────────────┬───────────────┘   │
            └─────────────────┼────────────────────┘
                              │
                  ┌───────────┼───────────┐
                  ▼           ▼           ▼
            ┌─────────┐ ┌──────────┐ ┌──────────┐
            │ Prisma  │ │ Auth.js  │ │  WhatsApp│
            │ → PG    │ │  JWT     │ │  webhook │
            └─────────┘ └──────────┘ └──────────┘
```

### Boundaries críticos

**Server-only**: estos archivos NO pueden importarse desde un `"use client"` component:
- `lib/db.ts` (importa `server-only`)
- `lib/admin-nav-counts.server.ts`
- Cualquier API route
- Cualquier page sin `"use client"` (server component por default)

**Client-safe**: estos sí pueden importarse desde client components:
- Types puros (interfaces, type aliases)
- `lib/utils.ts` (cn helper)
- `lib/admin-nav-counts.ts` (sólo types + pure functions)

Si confundes la separación, el bundle del cliente puede arrastrar Prisma → fallo de build con error "server-only".

### Render strategy

- **Public pages** (`/`, `/tienda`, `/b2b`, etc.): `Static` cuando es posible, `Dynamic` cuando dependen de DB.
- **Auth-protected pages**: siempre dinámicas (`force-dynamic` implícito porque usan `await auth()`).
- **Client components**: `"use client"` solo cuando se necesita: state, event handlers, browser APIs, hooks.

---

## Auth flow (NextAuth v5)

### Configuración (`auth.ts`)

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login/equipo" },
  providers: [
    Credentials({
      async authorize(rawCredentials) {
        // 1. Demo accounts siempre primero (a menos que DISABLE_DEMO_LOGIN=1)
        const demoMatch = matchDemoAccount(email, password);
        if (demoMatch) return demoMatch;

        // 2. Fall through a DB lookup
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario?.activo) return null;
        const ok = await compare(password, usuario.passwordHash);
        return ok ? mapUser(usuario) : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.rol = user.rol; }
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
```

### Flujo de login (importante por bug conocido)

**MAL** (causa hang en iOS Safari):
```tsx
"use client";
const result = await signIn("credentials", {
  email, password,
  redirect: false, // ← fetch hangea en iOS
});
```

**BIEN** (lo que tenemos):
```tsx
<form action="/api/auth/callback/credentials" method="post" onSubmit={...}>
  <input type="hidden" name="csrfToken" value={csrfToken} />
  <input type="hidden" name="callbackUrl" value="/admin" />
  <input name="email" />
  <input name="password" />
  <button type="submit">Entrar</button>
</form>
```

El CSRF token se obtiene en `useEffect`:
```tsx
useEffect(() => {
  fetch("/api/auth/csrf").then(r => r.json()).then(d => setCsrfToken(d.csrfToken));
}, []);
```

NextAuth maneja:
- Validación del CSRF
- Lookup del usuario
- Set de la cookie `__Secure-authjs.session-token`
- 302 redirect a `callbackUrl` (success) o `?error=...` (fail)

### Roles (`lib/roles.ts`)

```ts
export type RolUsuarioApp =
  | "MASTER_ADMIN"  // Acceso total
  | "ADMIN"         // Operativo completo
  | "VENDEDOR"      // Sólo CRM + ventas
  | "ALMACEN"       // Inventario + órdenes
  | "VIEWER"        // Solo lectura BI
  | "CLIENTE";      // Portal cliente

export function esRolEquipo(rol?: string): boolean {
  return rol === "MASTER_ADMIN" || rol === "ADMIN" || rol === "VENDEDOR"
      || rol === "ALMACEN" || rol === "VIEWER";
}
```

Cualquier route admin chequea con:
```ts
const session = await auth();
if (!esRolEquipo(session?.user?.rol)) {
  return Response.json({ error: "No autorizado" }, { status: 401 });
}
```

### Variables de entorno críticas

| Var | Por qué |
|---|---|
| `AUTH_SECRET` | Firma JWT, encripta cookies — sin esto NADA funciona |
| `AUTH_URL` | URL canónica para construir redirects post-login (NextAuth la usa) |
| `AUTH_TRUST_HOST` | `true` para que NextAuth confíe en `Host` header del request (necesario en Vercel) |

**Gotcha**: Si `AUTH_URL` está vacío, NextAuth usa `VERCEL_URL` (única por deploy). Eso causa 404 post-login porque las URLs por-deploy caducan. **Siempre setea `AUTH_URL` al alias estable**.

---

## Modelo de datos (Prisma)

Archivo: `prisma/schema.prisma`

### Tablas principales

```
Usuario           — usuarios del sistema (equipo + cliente)
Cliente           — cuentas comerciales (puede tener Usuario portal asociado)
  ↳ Vehiculo      — flota del cliente
  ↳ Interaccion   — timeline de actividad (llamadas, WhatsApp, etc.)
  ↳ Lead          — pipeline CRM
  ↳ Cotizacion    — propuestas comerciales
    ↳ CotizacionItem
  ↳ Factura       — facturas (1:1 con cotización si convertida)
    ↳ FacturaItem
    ↳ Pago        — registros de pago
  ↳ Orden         — despacho 1:1 con factura

Producto          — catálogo de SKUs
  ↳ ProductoCompatibilidad — qué vehículos soporta
  ↳ Inventario    — stock por almacén (unique: productoId + almacenId)

Almacen           — sucursales/bodegas

Alerta            — alertas operacionales para admin
LogFacturacion    — audit log inmutable
SecuenciaAutomatica — automation config (placeholder)
```

### Enums clave

```prisma
enum RolUsuario       { MASTER_ADMIN | ADMIN | VENDEDOR | ALMACEN | VIEWER | CLIENTE }
enum TipoCliente      { MINORISTA | TALLER | DISTRIBUIDOR_LOCAL | DISTRIBUIDOR_REGIONAL | VIP }
enum FuenteCliente    { ADS | REFERIDO | ORGANICO | DIRECTO | WHATSAPP | TIENDA_WEB }
enum TemperaturaLead  { CALIENTE | TIBIO | FRIO }
enum EstadoLead       { NUEVO | CALIFICANDO | COTIZADO | EN_NEGOCIACION | CIERRE_PENDIENTE | VENTA_CERRADA | RECOMPRA | PERDIDO }
enum EstadoCotizacion { BORRADOR | ENVIADA | ACEPTADA | RECHAZADA | VENCIDA }
enum EstadoFactura    { PENDIENTE | PARCIAL | PAGADA | VENCIDA | ANULADA }
enum EstadoPago       { PENDIENTE_VERIFICACION | CONFIRMADO | RECHAZADO | ANOMALO }
enum MetodoPago       { ZELLE | TRANSFERENCIA | EFECTIVO | CREDITO | MIXTO }
enum EstadoOrden      { CONFIRMADO | EN_PREPARACION | EN_CAMINO | ENTREGADO | CANCELADO }
enum TipoInteraccion  { LLAMADA | WHATSAPP | EMAIL | REUNION | NOTA | COTIZACION_ENVIADA | FACTURA_EMITIDA | PAGO_REGISTRADO }
enum TipoAlerta       { LEAD_SIN_ATENCION | STOCK_BAJO_MINIMO | FACTURA_VENCIDA | META_EN_RIESGO | META_ALCANZADA | PAGO_ANOMALO | DESCUENTO_EXCESIVO | ANULACIONES_REPETIDAS | DEUDA_CRITICA | RECOMPRA_PROGRAMADA }
enum PrioridadAlerta  { BAJA | MEDIA | ALTA | CRITICA }
enum AccionLog        { CREAR_FACTURA | ANULAR_FACTURA | MODIFICAR_COTIZACION | CONVERTIR_COTIZACION | REGISTRAR_PAGO | REVERTIR_PAGO | MARCAR_ANOMALIA }
enum ClasificacionABC { A | B | C }
```

### Relación cliente ↔ usuario portal

```
Usuario (rol=CLIENTE) ←──── usuarioPortalId ←──── Cliente
```

Una `Cliente` puede tener (opcionalmente) un `Usuario` portal asociado. El admin lo crea desde `/admin/clientes/[id]` → "Activar portal". El email + password establecidos ahí dan acceso a `/cliente/*`.

---

## Middleware de rutas (proxy.ts)

```ts
export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const rol = request.auth?.user?.rol;

  // /api/admin/* → 401 si no es equipo
  if (pathname.startsWith("/api/admin")) {
    if (!esRolEquipo(rol)) return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // /admin/* → redirect a /login/equipo si no autenticado, a /cliente si es CLIENTE
  if (pathname.startsWith("/admin")) {
    if (!request.auth?.user) return NextResponse.redirect(new URL("/login/equipo", request.url));
    if (!esRolEquipo(rol)) return NextResponse.redirect(new URL("/cliente", request.url));
  }

  // /cliente/* → redirect a /login/cliente si no auth, a /admin si es equipo
  if (pathname.startsWith("/cliente")) {
    if (!request.auth?.user) return NextResponse.redirect(new URL("/login/cliente", request.url));
    if (rol !== "CLIENTE") return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/cliente/:path*", "/api/admin/:path*"],
};
```

**Importante**:
- En Next 16+, el archivo se llama `proxy.ts` (no `middleware.ts` — esa convención está deprecated).
- El `matcher` define EXACTAMENTE qué rutas pasa por el middleware. **No incluyas `/login/*` o `/api/auth/*`** — esos deben ser públicos.

---

## Stock deduction transaccional

Archivo: `lib/stock-deduction.ts`

### Tres helpers principales

#### 1. `checkStockAvailability(tx, items)`

Antes de emitir factura, verifica que hay stock total suficiente. Retorna array de `StockShortage` (vacío si todo OK).

```ts
const shortages = await checkStockAvailability(tx, items);
if (shortages.length > 0) {
  throw Object.assign(new Error("insufficient_stock"), { shortages });
}
```

#### 2. `deductStockForSale(tx, items)`

**Estrategia greedy**: descuenta del almacén con más stock primero, después del siguiente, hasta cubrir la cantidad requerida. Si se queda corto (no debería si validaste con `checkStockAvailability`), throws.

```ts
await prisma.$transaction(async (tx) => {
  const shortages = await checkStockAvailability(tx, items);
  if (shortages.length) throw ...;

  const factura = await tx.factura.create(...);
  await deductStockForSale(tx, items);
  // Si algo falla aquí, todo el TX rolls back
});
```

#### 3. `restoreStockFromSale(tx, items)`

Para `ANULAR_FACTURA`. Restaura stock al almacén con MENOS cantidad actual (re-balance). Si no hay filas de inventory para ese producto, skip silencioso (warehouse staff debe reconciliar manualmente).

### Endpoints que usan stock deduction

- `POST /api/admin/facturas` → check + deduct
- `POST /api/admin/cotizaciones/[id]/convertir` → check + deduct
- `PATCH /api/admin/facturas/[id]` con `{ accion: "ANULAR" }` → restore

### Estado inicial

Cuando creas un producto con `POST /api/admin/productos`, automáticamente se crean filas en `inventario` con `cantidad: 0` para cada `almacen.activo === true`. Eso permite que el producto pueda ser vendido sin tocar la DB manualmente (suponiendo que un admin de inventario haga el ajuste vía `PATCH /api/admin/inventario/[id]`).

---

## Pago lifecycle

### Flujo end-to-end

```
1. Pago se crea (admin o cliente reporta)
   ├─ Sin anomalías → estado = CONFIRMADO + pre-aplica al saldo
   └─ Con anomalías → estado = PENDIENTE_VERIFICACION + esAnomalo=true (NO pre-aplica)

2. Admin revisa cola:
   ├─ CONFIRMAR (esAnomalo=true) → aplica al saldo, estado = CONFIRMADO
   ├─ RECHAZAR (esAnomalo=true) → no aplica
   ├─ RECHAZAR (CONFIRMADO previo) → REVERSA el saldo, estado = RECHAZADO
   └─ MARCAR_ANOMALIA (CONFIRMADO previo) → REVERSA el saldo, estado = ANOMALO

3. Factura estado recalculado tras cada cambio:
   - saldo == 0 → PAGADA
   - 0 < saldo < total → PARCIAL
   - saldo == total + vencida → VENCIDA
   - saldo == total + no vencida → PENDIENTE
```

### Detección de anomalías (en `POST /api/admin/pagos`)

```ts
const anomalias = [];
if (referencia && (await tx.pago.findFirst({ where: { referencia, estado: { not: "RECHAZADO" } } }))) {
  anomalias.push("Referencia duplicada");
}
if (monto > saldo + 0.01) anomalias.push(`Monto > saldo`);
if (factura.estado === "VENCIDA") anomalias.push("Factura vencida");

const esAnomalo = anomalias.length > 0;
const estadoPago = esAnomalo ? "PENDIENTE_VERIFICACION" : "CONFIRMADO";
```

### Pago cliente-reportado siempre PENDIENTE_VERIFICACION

```ts
// /api/cliente/facturas/[id]/reportar-pago
// SIEMPRE setea esAnomalo=true con razón "Pago reportado por cliente"
// para forzar verificación admin
```

### Audit log

Cada operación de pago crea una entrada en `LogFacturacion` con firma HMAC:
```ts
const firma = createHash("sha256")
  .update(`${userId}:${accion}:${pagoId}:${Date.now()}`)
  .digest("hex");
```

Esto permite verificar integridad histórica.

---

## Sistema de diseño UI/UX

### Filosofía: "Kinetic Motion"

Recomendado por la skill `ui-ux-pro-max` para brands automotrices. Tres fuentes con jerarquía clara:

| Función | Fuente | Por qué |
|---|---|---|
| **Display / headings** | Syncopate | Caracteres anchos, kinéticos, evocan máquina/velocidad |
| **Body text** | Inter | Legible, humanista, neutro |
| **Datos técnicos** | Space Mono | Codes, SKUs, IDs → "ficha técnica de partes" |

### Carga vía next/font (en `app/layout.tsx`)

```tsx
import { Inter, Space_Mono, Syncopate } from "next/font/google";

const inter      = Inter({ weight: ["400",...,"900"], variable: "--font-inter",  ... });
const syncopate  = Syncopate({ weight: ["400","700"], variable: "--font-syncopate", ... });
const spaceMono  = Space_Mono({ weight: ["400","700"], variable: "--font-space-mono", ... });

<html className={`${inter.variable} ${syncopate.variable} ${spaceMono.variable}`}>
```

Esto las hace self-hosted (zero CLS, sin requests a Google).

### Helpers CSS

```css
/* globals.css */
.font-display-kinetic {
  font-family: var(--font-display);
  letter-spacing: 0.02em; /* 0 en mobile < 640px */
  font-weight: 700;
}
@media (min-width: 640px) {
  .font-display-kinetic { letter-spacing: 0.04em; }
}

.font-display-kinetic--tight {
  font-family: var(--font-display);
  letter-spacing: 0; /* 0.02em en sm+ */
  font-weight: 700;
  word-break: break-word;     /* ← para que H1 grandes no desborden mobile */
  overflow-wrap: anywhere;
}

.font-mono-tech {
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

### Patrones visuales reutilizables

#### 1. Eyebrow técnico

```tsx
<p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
  <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
  SECCIÓN
</p>
```

#### 2. H1 kinetic

```tsx
<h1 className="font-display-kinetic--tight text-3xl uppercase leading-tight sm:text-4xl">
  Título
</h1>
```

#### 3. CTA gold con glow

```tsx
<button className="group inline-flex h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_24px_-8px_rgba(245,197,24,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(245,197,24,0.8)]"
        style={{ background: "var(--color-gold)" }}>
  Acción
  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
</button>
```

#### 4. Industrial backdrop

```tsx
<div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,197,24,0.08)_1px,transparent_1px),linear-gradient(rgba(245,197,24,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
<div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,197,24,0.25),transparent_60%)]" />
```

#### 5. Numbered watermark card

```tsx
<article className="relative overflow-hidden p-6 hover:-translate-y-0.5 transition-all">
  <span aria-hidden="true" className="absolute -right-2 -top-4 font-mono text-7xl font-black opacity-5"
        style={{ color: "var(--color-gold)" }}>
    01
  </span>
  {/* content */}
  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform"
       style={{ background: "var(--color-gold)" }} />
</article>
```

#### 6. Focus rings (accesibilidad)

Aplicado globalmente en `globals.css`:
```css
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-gold) !important;
  box-shadow:
    0 0 0 1px var(--color-gold),
    0 0 0 4px color-mix(in srgb, var(--color-gold) 25%, transparent) !important;
}
button:focus-visible, a:focus-visible {
  box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--color-gold) !important;
}
```

---

## Cómo agregar una nueva sección admin

Ejemplo: agregar `/admin/proveedores`.

### 1. Crear la página

```tsx
// app/admin/proveedores/page.tsx
import { getProveedoresData } from "@/lib/proveedores-admin";

export default async function AdminProveedoresPage() {
  const data = await getProveedoresData();

  return (
    <main className="p-4 sm:p-6">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono-tech inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-gold)" }}>
          <span className="block h-px w-6" style={{ background: "var(--color-gold)" }} />
          Sistema
        </p>
        <h1 className="font-display-kinetic--tight mt-3 text-3xl uppercase leading-tight sm:text-4xl">
          Proveedores
        </h1>
        <p className="mt-3 max-w-3xl leading-7" style={{ color: "var(--text-secondary)" }}>
          Descripción de la sección.
        </p>

        {/* contenido */}
      </section>
    </main>
  );
}
```

### 2. (Opcional) Loading skeleton

```tsx
// app/admin/proveedores/loading.tsx
import { AdminPageSkeleton } from "@/components/admin/Skeleton";
export default function Loading() { return <AdminPageSkeleton />; }
```

### 3. Data fetcher

```ts
// lib/proveedores-admin.ts
import { prisma } from "@/lib/db";

export type ProveedorRow = { id: string; nombre: string; /* ... */ };
export type ProveedoresData = { proveedores: ProveedorRow[]; isFallback: boolean };

const FALLBACK: ProveedorRow[] = [{ id: "demo-1", nombre: "Liqui-Moly Distrib." }];

export async function getProveedoresData(): Promise<ProveedoresData> {
  try {
    const rows = await prisma.proveedor.findMany({ select: { id: true, nombre: true } });
    return { proveedores: rows, isFallback: false };
  } catch {
    return { proveedores: FALLBACK, isFallback: true };
  }
}
```

### 4. Agregar al sidebar

```ts
// lib/admin-nav.ts
{
  href: "/admin/proveedores",
  label: "Proveedores",
  icon: Truck,
  roles: ["MASTER_ADMIN", "ADMIN"],
},
```

### 5. (Si aplica) API endpoints

Ver siguiente sección.

### 6. Verificar

```bash
npm run typecheck
npm run lint
npm run dev  # navegar a /admin/proveedores
```

---

## Cómo agregar un nuevo endpoint API

Ejemplo: `POST /api/admin/proveedores`.

```ts
// app/api/admin/proveedores/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { esRolEquipo } from "@/lib/roles";

export async function POST(request: Request) {
  // 1. Auth check
  const session = await auth();
  if (!esRolEquipo(session?.user?.rol)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  // 2. Parse + validate body
  const body = await request.json().catch(() => null);
  const nombre = (body?.nombre ?? "").trim();
  if (!nombre) {
    return Response.json({ ok: false, error: "Nombre es requerido" }, { status: 400 });
  }

  // 3. Perform DB op (typically en transaction si multi-step)
  try {
    const proveedor = await prisma.proveedor.create({
      data: { nombre },
      select: { id: true, nombre: true },
    });
    return Response.json({ ok: true, proveedor }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint")) {
      return Response.json({ ok: false, error: "Ya existe un proveedor con ese nombre" }, { status: 409 });
    }
    return Response.json({ ok: false, error: "No se pudo crear" }, { status: 503 });
  }
}
```

### Convenciones

- **Response shape**: siempre `{ ok: boolean, ... }` para los endpoints que el frontend consume
- **Errores con códigos HTTP correctos**:
  - 400 → validación falla
  - 401 → no autenticado / sin permisos
  - 403 → autenticado pero no autorizado
  - 404 → recurso no existe (o no leak existence)
  - 409 → conflict (unique constraint)
  - 422 → semánticamente correcto pero no procesable
  - 503 → DB no disponible / error temporal
- **Validar siempre** con guards antes de tocar prisma
- **Transactions** para multi-step ops (factura+stock, pago+saldo, etc.)
- **Audit log** para acciones críticas:
  ```ts
  const firma = createHash("sha256")
    .update(`${userId}:${accion}:${entidadId}:${Date.now()}`)
    .digest("hex");
  await tx.logFacturacion.create({ data: { ..., firmaDigital: firma } });
  ```

---

## Cómo agregar una nueva tabla a la DB

### 1. Editar `prisma/schema.prisma`

```prisma
model Proveedor {
  id        String   @id @default(cuid())
  nombre    String   @unique
  contacto  String?
  telefono  String?
  activo    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Aplicar el schema

**Local (sin migration history)**:
```bash
npm run db:push  # Pisa la DB con el schema nuevo
```

**Producción / con history**:
```bash
npx prisma migrate dev --name add_proveedor  # crea SQL migration file
npx prisma migrate deploy                     # aplica en prod
```

### 3. Regenerar el cliente

```bash
npx prisma generate
```

Ahora `prisma.proveedor` está disponible con types completos.

### 4. (Opcional) Agregar al seed

```ts
// prisma/seed.ts
await prisma.proveedor.upsert({
  where: { nombre: "Liqui-Moly" },
  update: {},
  create: { nombre: "Liqui-Moly", contacto: "...", ... },
});
```

```bash
npm run db:seed
```

---

## Patrones recurrentes

### Server component con fallback demo

```tsx
export default async function MyPage() {
  const data = await getMyData(); // returns { items, isFallback }

  return (
    <main>
      {data.isFallback && (
        <div style={{ borderLeft: "2px solid var(--color-gold)" }}>
          Modo demo — conecta DATABASE_URL.
        </div>
      )}
      {/* render */}
    </main>
  );
}
```

### Data fetcher con catch para fallback

```ts
export async function getMyData(): Promise<MyData> {
  try {
    const rows = await prisma.miTabla.findMany({ ... });
    return { items: rows, isFallback: false };
  } catch {
    console.warn("MyData fallback activo.");
    return { items: FALLBACK_DATA, isFallback: true };
  }
}
```

### Client component con optimistic update + rollback

```tsx
"use client";
async function toggle(id: string, current: boolean) {
  const prev = items;
  setItems((list) => list.map((i) => i.id === id ? { ...i, activo: !current } : i));
  try {
    const res = await fetch(`/api/admin/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ activo: !current }),
    });
    if (!res.ok) throw new Error();
  } catch {
    setItems(prev); // rollback
  }
}
```

### Form modal con confirm + spinner

```tsx
const [submitting, setSubmitting] = useState(false);
async function submit(e: FormEvent) {
  e.preventDefault();
  if (!confirm("¿Confirmas?")) return;
  setSubmitting(true);
  try {
    const res = await fetch(...);
    const json = await res.json();
    if (!json.ok) { setError(json.error); return; }
    router.refresh();
    onClose();
  } finally {
    setSubmitting(false);
  }
}
```

---

## Gotchas y bugs conocidos

### 1. `signIn({ redirect: false })` hangea en iOS Safari
- **Síntoma**: botón se queda en loading state después de submit
- **Causa**: Auth.js v5 beta + iOS Safari fetch promise no resuelve en 302
- **Solución**: usar `<form action="/api/auth/callback/credentials" method="post">` (lo que tenemos)

### 2. `AUTH_URL` vacío → redirect a URL por-deploy (404)
- **Síntoma**: post-login redirige a `ranko-saas-XXXX-pantera95s-projects.vercel.app/admin` que da 404
- **Causa**: NextAuth fallback a `VERCEL_URL` cuando `AUTH_URL` no está
- **Solución**: setear `AUTH_URL=https://ranko-saas-web.vercel.app` y `AUTH_TRUST_HOST=true`

### 3. `lib/db.ts` importado desde client component → fallo de build
- **Síntoma**: Turbopack error "server-only"
- **Solución**: separar types (client-safe) de la función fetch (server-only). Ver `lib/admin-nav-counts.{ts,server.ts}`

### 4. `Date.now()` en server component triggers React Compiler warning
- **Síntoma**: lint error "Cannot call impure function during render"
- **Solución**: `// eslint-disable-next-line react-compiler/react-compiler` antes de la línea
- Server components renderizan una vez por request, `Date.now()` es seguro pero el linter no lo sabe

### 5. Tailwind v4 con `@import url(...)` en globals.css desordena reglas
- **Síntoma**: build error "@import rules must precede all rules"
- **Solución**: cargar fonts vía `next/font/google` en `app/layout.tsx`, NO via @import CSS

### 6. CSS inline `style={...}` en next/font + Tailwind
- next/font expone variables CSS (`--font-syncopate`) — úsalas en `globals.css` con `font-family: var(--font-syncopate)`, no intentes hardcodear nombres

### 7. NextAuth `pages.signIn` solo acepta UN valor
- **Síntoma**: cliente login error redirige a /login/equipo (admin form)
- **Solución actual**: no usamos `pages.signIn` para el redirect en error — el form maneja el `?error=` query param manualmente

### 8. Vercel "Other" framework preset
- El proyecto se creó como "Other" en vez de "Next.js" por accidente. Funciona pero pierde Next-specific optimizations.
- **Fix opcional**: Settings → Framework Preset → Next.js, remover overrides de Build Command y Output Directory, redeploy.

---

## Convenciones de código

### Imports

```tsx
// 1. Librerías externas (npm packages)
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2 } from "lucide-react";

// 2. Aliases internos `@/...`
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Skeleton } from "@/components/admin/Skeleton";

// 3. Relative imports (raros)
import { localHelper } from "./helper";
```

### TypeScript

- **Strict mode siempre**. No `any` salvo casos justificados.
- **Discriminated unions** para responses: `{ ok: true; data: T } | { ok: false; error: string }`
- **`as const` para arrays de strings literales**: `const ESTADOS = ["A", "B"] as const`
- **Types vs interfaces**: `type` para union/intersection, `interface` para extender objetos

### Naming

- **Files**: `kebab-case.tsx` (`my-component.tsx`), excepto componentes que se exportan default → `PascalCase.tsx`
- **Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **Routes**: kebab-case (`/admin/panel-de-deudas`)

### CSS / Tailwind

- **Utility classes preferidas** sobre `<style>` blocks
- **Inline styles** sólo para CSS variables (`style={{ color: "var(--color-gold)" }}`)
- **Don't use `@apply`** — Tailwind v4 lo desincentiva
- **Mobile-first**: empezar con clases base, luego `sm:`, `md:`, `lg:`, `xl:`

### Componentes

- **Server components by default**
- `"use client"` solo cuando necesitas: state, event handlers, browser APIs, `useEffect`, hooks
- **Composition over props bloat**: si un componente tiene >7 props, considera separarlo
- **Children pattern** cuando uno wraps otro: `<Card><Card.Header>...</Card.Header></Card>`

### API routes

- **Una operación por route handler** (POST/GET/PATCH/DELETE como funciones separadas)
- **Validate first, then act** — fail fast
- **Use transactions** para multi-step DB ops
- **Audit log** para mutaciones críticas

### Git

- **Commit messages en español o inglés** — sé consistente dentro del repo
- **Tipo del commit**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`
- **Co-Authored-By trailers** cuando alguien más ayudó

---

## Útil para debugging

### Ver estado de la sesión en runtime

En cualquier server component:
```tsx
import { auth } from "@/auth";
const session = await auth();
console.log(session);
```

En cualquier API route:
```ts
const session = await auth();
console.log("Session:", session);
```

### Ver queries de Prisma en consola

Edita `lib/db.ts` para habilitar query log:
```ts
new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["warn", "error"],
});
```

### Prisma Studio (GUI para la DB)

```bash
npx prisma studio
# Abre http://localhost:5555
```

### Logs en producción (Vercel)

```bash
vercel logs <deployment-url> --follow
```

O en el dashboard: https://vercel.com/pantera95s-projects/ranko-saas-web/logs

### Tests rápidos de endpoints (curl)

```bash
# Login flow
/usr/bin/curl -s -c cookies.txt https://ranko-saas-web.vercel.app/api/auth/csrf > csrf.json
CSRF=$(python3 -c "import json; print(json.load(open('csrf.json'))['csrfToken'])")
/usr/bin/curl -i -X POST "https://ranko-saas-web.vercel.app/api/auth/callback/credentials?json=true" \
  -b cookies.txt -c cookies.txt \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=admin@rankoparts.com" \
  --data-urlencode "password=RankoAdmin2026!" \
  --data-urlencode "callbackUrl=/admin"
```

---

## Recursos externos

- **Next.js App Router** — https://nextjs.org/docs/app
- **Auth.js v5 (NextAuth v5)** — https://authjs.dev/getting-started/migrating-to-v5
- **Prisma** — https://www.prisma.io/docs/orm
- **Tailwind v4** — https://tailwindcss.com/docs/v4-beta
- **shadcn/ui** (no usamos pero patterns útiles) — https://ui.shadcn.com
- **Vercel** — https://vercel.com/docs

---

## Si necesitas ayuda

1. **Lee primero el README.md y este MANUAL.md** completos.
2. Para entender un feature específico, busca el endpoint en `app/api/...` y rastrea de ahí.
3. Para diseño UI, revisa los helpers `.font-display-kinetic*` en `globals.css` y los patrones reutilizables arriba.
4. Para auth, lee `auth.ts` y `proxy.ts` juntos — son los dos archivos que controlan todo.
5. Para data, abre `prisma/schema.prisma` y mira las relaciones.
6. Si el lint o el build falla, lee el error completo — Next.js + Prisma + NextAuth dan errores muy específicos.

**Cualquier cambio a producción debe pasar primero**:
```bash
npm run typecheck && npm run lint && npm run build
```

Solo después de los tres en verde, `git push origin main`.
