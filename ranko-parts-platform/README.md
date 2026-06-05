# Ranko Parts Platform

E-commerce + SaaS interno para venta de repuestos automotrices 4x4, SUVs, coupés, aceites y lubricantes premium. Construido con Next.js 16 App Router, Prisma, PostgreSQL y NextAuth v5.

**Producción:** https://ranko-saas-web.vercel.app

---

## 📋 Tabla de contenidos

1. [Stack técnico](#stack-técnico)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Setup local](#setup-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Cuentas demo](#cuentas-demo)
6. [Funcionalidades](#funcionalidades)
7. [Endpoints API](#endpoints-api)
8. [Sistema de diseño](#sistema-de-diseño)
9. [Deploy a Vercel](#deploy-a-vercel)
10. [Troubleshooting](#troubleshooting)

Para detalles técnicos profundos y cómo se construyó cada feature, ver [MANUAL.md](./MANUAL.md).

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16.2** (App Router + Turbopack) |
| Lenguaje | **TypeScript 5** (strict mode) |
| Estilos | **Tailwind CSS v4** (con `@import "tailwindcss"`) |
| Auth | **NextAuth v5 beta (Auth.js)** — credentials provider + JWT |
| ORM | **Prisma 7** |
| DB | **PostgreSQL** (Supabase / Neon compatible) |
| Validación | **Zod** |
| Hashing | **bcryptjs** (12 rounds) |
| Iconos | **lucide-react** |
| Fuentes | **next/font/google** — Syncopate + Inter + Space Mono |
| DnD | **@dnd-kit** (CRM pipeline kanban) |
| Hosting | **Vercel** (auto-deploy desde GitHub `main`) |
| Storage | URLs externas para imágenes de producto (S3/CDN del cliente) |

---

## Estructura del proyecto

```
ranko-parts-platform/
├── app/                              # Next.js App Router
│   ├── (público)                     # Sin auth required
│   │   ├── page.tsx                  # Home con hero kinetic
│   │   ├── tienda/page.tsx           # Catálogo público
│   │   ├── tienda/[slug]/page.tsx    # PDP con gallery + spec band
│   │   ├── b2b/page.tsx              # Form para cuentas B2B
│   │   ├── referidos/page.tsx        # Programa de referidos
│   │   ├── orden/[codigo]/page.tsx   # Tracking público
│   │   ├── login/{equipo,cliente}/   # Auth pages
│   │   └── login/cliente/recuperar/  # Self-service password reset
│   │
│   ├── admin/                        # SaaS interno (rol ≠ CLIENTE)
│   │   ├── layout.tsx                # Sidebar + mobile menu con badges
│   │   ├── page.tsx                  # Dashboard ejecutivo
│   │   ├── clientes/{,[id]}/         # CRM
│   │   ├── cotizaciones/{,[id],nueva}/
│   │   ├── facturacion/{,[id],nueva}/
│   │   ├── pagos/                    # Verificación de pagos
│   │   ├── deudas/                   # Cartera por aging
│   │   ├── alertas/                  # Alertas operacionales
│   │   ├── catalogo/{,[id],nuevo}/   # Productos + imágenes + compatibilidades
│   │   ├── inventario/               # Stock por almacén
│   │   ├── ordenes/{,[id]}/          # Despacho
│   │   ├── usuarios/                 # Gestión del equipo
│   │   ├── logs/                     # Auditoría
│   │   ├── reportes/                 # BI
│   │   ├── ecommerce/                # Productos en tienda online
│   │   ├── crm/                      # Pipeline kanban
│   │   ├── automatizacion/           # Reglas automáticas
│   │   ├── referidos/                # Métricas del programa
│   │   └── configuracion/            # Feature flags
│   │
│   ├── cliente/                      # Portal cliente (rol CLIENTE)
│   │   ├── layout.tsx                # Nav con badges
│   │   ├── page.tsx                  # Resumen + action cards
│   │   ├── cotizaciones/page.tsx     # Aceptar/rechazar quotes
│   │   ├── facturas/page.tsx         # Reportar pagos
│   │   ├── pedidos/page.tsx          # Tracking
│   │   ├── perfil/page.tsx           # Self-service edit
│   │   └── referidos/page.tsx        # Código + lista referidos
│   │
│   ├── api/                          # API routes
│   │   ├── auth/[...nextauth]/       # NextAuth handler
│   │   ├── admin/                    # CRUD admin (requiere rol equipo)
│   │   ├── cliente/                  # Self-service cliente
│   │   ├── catalog/                  # Catálogo público
│   │   ├── leads/                    # Form B2B + capture
│   │   ├── webhooks/whatsapp/        # Meta WhatsApp Business
│   │   └── health/                   # Healthcheck
│   │
│   ├── globals.css                   # Tailwind + design system
│   ├── layout.tsx                    # Root layout + fonts
│   ├── error.tsx / not-found.tsx     # Error boundaries
│   └── orden/[codigo]/page.tsx       # Public tracking
│
├── components/
│   ├── admin/                        # UI exclusiva de /admin
│   ├── auth/                         # LoginForm, etc.
│   ├── crm/                          # PipelineKanban
│   ├── layout/                       # AdminSidebar, ClienteNav, etc.
│   ├── providers/                    # ThemeProvider
│   └── public/                       # UI compartida pública
│
├── lib/
│   ├── db.ts                         # Prisma singleton (server-only)
│   ├── roles.ts                      # Roles + permisos
│   ├── stock-deduction.ts            # Transactional helpers
│   ├── admin-nav-counts.ts           # Badges types (client-safe)
│   ├── admin-nav-counts.server.ts    # Badge counts fetch (server-only)
│   ├── rate-limit.ts                 # In-memory rate limiter
│   ├── *-admin.ts                    # Data fetchers por sección
│   └── client-portal.ts              # Portal cliente data
│
├── prisma/
│   ├── schema.prisma                 # Modelo de datos completo
│   └── seed.ts                       # Datos demo iniciales
│
├── auth.ts                           # NextAuth config + demo accounts
├── proxy.ts                          # Middleware de auth/rutas
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config / postcss.config
```

---

## Setup local

### Requisitos previos

- **Node.js 20+** (LTS)
- **npm** 10+
- **PostgreSQL** 14+ corriendo local o accesible vía URL
  - Recomendado: Supabase o Neon (free tier)

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/Pantera95/Ranko-SAAS---Web.git
cd Ranko-SAAS---Web/ranko-parts-platform

# 2. Instalar deps
npm install

# 3. Configurar variables de entorno
cp .env.example .env  # si existe; si no, crea uno (ver sección siguiente)

# 4. Generar Prisma client + aplicar schema a la DB
npx prisma generate
npm run db:push

# 5. (Opcional) Cargar datos demo
npm run db:seed

# 6. Iniciar el dev server
npm run dev
```

App corre en **http://localhost:3000**

### Scripts disponibles

```bash
npm run dev          # Next dev con Turbopack
npm run build        # prisma generate + next build
npm start            # next start (producción)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:push      # Aplica el schema a la DB (no migration)
npm run db:migrate   # Crea migration files
npm run db:seed      # Carga datos demo
npm run db:studio    # Abre Prisma Studio
```

---

## Variables de entorno

Crea un archivo `.env` (NUNCA commitearlo) con estas variables:

```bash
# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
DIRECT_URL="postgresql://user:pass@host:5432/dbname?schema=public"
# DIRECT_URL es opcional; sólo necesario si usas connection pooler de Supabase

# NextAuth / Auth.js
AUTH_SECRET="tu-secret-largo-aleatorio-min-32-chars"
AUTH_URL="https://tu-dominio.com"          # En local: http://localhost:3000
AUTH_TRUST_HOST="true"                     # Importante en preview deploys / proxies

# WhatsApp Business integration (opcional)
WHATSAPP_WEBHOOK_VERIFY_TOKEN="token-personalizado"
META_APP_SECRET="secret-de-meta"
NEXT_PUBLIC_WHATSAPP_NUMBER="584147903498"

# URL pública (para CTAs, share links, OG tags)
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"

# Desactivar cuentas demo en producción real (opcional)
# DISABLE_DEMO_LOGIN=1
```

### Generar `AUTH_SECRET`

```bash
openssl rand -base64 32
```

---

## Cuentas demo

Cuando no hay DATABASE_URL o cuando `DISABLE_DEMO_LOGIN` NO está en `1`, estas credenciales funcionan en cualquier entorno:

### Admin → `/login/equipo`

| Email | Password | Rol |
|---|---|---|
| `admin@rankoparts.com` | `RankoAdmin2026!` | `MASTER_ADMIN` |
| `vendedor@rankoparts.com` | `RankoVendedor2026!` | `VENDEDOR` |
| `almacen@rankoparts.com` | `RankoAlmacen2026!` | `ALMACEN` |
| `viewer@rankoparts.com` | `RankoViewer2026!` | `VIEWER` |

### Cliente Portal → `/login/cliente`

| Email | Password | Rol |
|---|---|---|
| `cliente@rankoparts.com` | `RankoCliente2026!` | `CLIENTE` |

**Para desactivarlas en producción**: setea `DISABLE_DEMO_LOGIN=1` en Vercel y redeploy.

---

## Funcionalidades

### 🌐 Públicas

- **Landing page** con hero kinetic, pilares numerados, stat band, productos destacados, CTA B2B, footer dorado
- **Catálogo público** (`/tienda`) con filtros por categoría/marca/modelo/año/sistema
- **PDP** (`/tienda/[slug]`) con gallery de imágenes, spec band, compatibilidades, CTA WhatsApp
- **B2B signup** con form rate-limited (4 req/min por IP)
- **Programa de referidos** público
- **Tracking de orden público** (`/orden/[codigo]`) sin auth — solo con código

### 👤 Cliente Portal

- **Resumen** con KPIs + action cards con badges (cotizaciones pendientes, facturas vencidas, pedidos activos)
- **Cotizaciones** — ver propuestas, **aceptar/rechazar** desde portal, ver historial
- **Facturas** — ver estado de cuenta, **reportar pagos** (Zelle/Transferencia/etc) con validación admin
- **Pedidos** — tracking en tiempo real
- **Perfil** — editar contacto (whatsapp, email, dirección), gestionar **vehículos propios**, cambiar contraseña, ver código de referido
- **Recuperar contraseña** — formulario público, rate-limited, registra solicitud como Interaccion para el vendedor

### 🛠 Admin SaaS

#### CRM
- Pipeline visual (kanban con DnD por etapa: NUEVO → CALIFICANDO → ... → VENTA_CERRADA)
- Cards con deep-link a cliente + crear cotización rápida
- Clientes 360: edición completa, scoring, vehículos, interacciones timeline, asignación de vendedor
- Lead capture (público + admin) sin sobrescribir cliente identity

#### Cotizaciones
- Builder con line items, descuentos, validez
- Lifecycle: BORRADOR → ENVIADA → ACEPTADA/RECHAZADA → conversión a factura
- WhatsApp send que marca `enviadaPorWhatsApp` + auto-avanza BORRADOR→ENVIADA
- Reabrir desde estados terminales (con audit)
- Bloqueado tras conversión a factura

#### Facturación
- Builder desde cero o desde cotización aceptada
- **Stock se decrementa atómicamente** al emitir factura (greedy desde almacén con más stock)
- Anular factura: requiere pagos pendientes rechazados primero, **restaura stock**
- Aging buckets (corriente, 31-60, 61-90, +90, crítica)
- Deep-link desde alertas, cliente detail, deudas

#### Pagos
- Registro manual (admin) o reportado por cliente (portal)
- Auto-detección de anomalías: referencia duplicada, monto > saldo, factura vencida
- Pagos limpios → auto-CONFIRMADO + aplican al saldo
- Pagos anómalos / cliente-reportados → cola PENDIENTE_VERIFICACION
- Acciones admin: CONFIRMAR / RECHAZAR / MARCAR_ANOMALIA, con reverso correcto del saldo
- Audit log firmado HMAC para cada acción

#### Inventario
- Multi-almacén
- Auto-seed de filas cuando se crea un nuevo producto
- POST upsert manual para almacén nuevo
- Stock low alerts en sidebar admin

#### Catálogo
- Productos con: SKU, marca, categoría, precio, costo, imagenes[], compatibilidades
- Panel de imágenes con drag-to-reorder, URL paste, preview
- Compatibilidades editable (marca/modelo/año range/motor/sistema)

#### Usuarios
- Roles: MASTER_ADMIN, ADMIN, VENDEDOR, ALMACEN, VIEWER, CLIENTE
- Reset password admin-initiated con modal
- Cambio de rol inline en tabla
- Auto-protección: no puede desactivarse a sí mismo

#### Alertas
- Tipos: PAGO_ANOMALO, FACTURA_VENCIDA, DEUDA_CRITICA, STOCK_BAJO, CLIENTE_INACTIVO
- Severidad: CRITICA / ALTA / MEDIA / BAJA
- Deep-link CTA por tipo (verificar pago, ver facturas del cliente, etc.)
- Sidebar badges con counts en tiempo real

#### Logs auditoría
- Entidad + acción + datos antes/después + firma HMAC
- Read-only desde admin
- Click en ID abre el record referenciado

#### Reportes / BI
- Ventas por mes, top SKUs, embudo de leads, segmentación de clientes
- Charts con `recharts` (ya integrado pero scope futuro)

#### Configuración
- Feature flags (e-commerce, notificaciones, automatizaciones, portal, inventario, seguridad)
- Persistidos en `localStorage` (placeholder; pendiente persistencia DB)

---

## Endpoints API

### Auth
- `GET/POST /api/auth/[...nextauth]` — handler de NextAuth (csrf, signin, signout, session, callback)

### Públicos
- `GET /api/health` — healthcheck
- `GET /api/catalog?categoria=&marca=&modelo=&anio=&sistema=` — productos filtrados
- `POST /api/leads` — capture de lead público (rate-limited)
- `POST /api/cliente/password/solicitar-reset` — request reset (rate-limited)
- `POST /api/webhooks/whatsapp` + GET (verification) — Meta WhatsApp

### Admin (require rol equipo)
| Endpoint | Métodos | Descripción |
|---|---|---|
| `/api/admin/clientes` | POST | Crear cliente con codigoReferido auto |
| `/api/admin/clientes/[id]` | PATCH | Editar cliente, asignar vendedor, bloquear |
| `/api/admin/clientes/[id]/portal` | POST, DELETE | Activar/revocar acceso portal |
| `/api/admin/clientes/[id]/vehiculos` | POST | Agregar vehículo |
| `/api/admin/clientes/[id]/vehiculos/[vid]` | DELETE | Eliminar vehículo |
| `/api/admin/clientes/[id]/interacciones` | POST | Registrar interacción |
| `/api/admin/clientes/[id]/interacciones/[id]` | PATCH, DELETE | Editar/eliminar interacción |
| `/api/admin/cotizaciones/[id]` | GET, PATCH | Ver, cambiar estado, notas, flags |
| `/api/admin/cotizaciones/[id]/convertir` | POST | A factura (decrement stock) |
| `/api/admin/facturas` | POST | Crear factura (stock check + deduction) |
| `/api/admin/facturas/[id]` | PATCH | ANULAR (restaura stock, bloquea con pagos activos) |
| `/api/admin/pagos` | POST | Registrar pago |
| `/api/admin/pagos/[id]` | PATCH | CONFIRMAR / RECHAZAR / MARCAR_ANOMALIA |
| `/api/admin/productos` | POST | Crear producto con auto-seed inventory |
| `/api/admin/productos/[id]` | GET, PATCH | Editar (incluye `imagenes[]`) |
| `/api/admin/productos/[id]/compatibilidades` | POST | Agregar compat. |
| `/api/admin/productos/[id]/compatibilidades/[cid]` | DELETE | Eliminar |
| `/api/admin/inventario` | POST | Upsert stock row |
| `/api/admin/inventario/[id]` | PATCH | Ajustar cantidad |
| `/api/admin/ordenes/[id]` | PATCH | AVANZAR / CANCELAR estado |
| `/api/admin/usuarios` | POST | Crear usuario |
| `/api/admin/usuarios/[id]` | PATCH | Editar (rol, activo, password, nombre, etc.) |
| `/api/admin/leads` | POST | Capture admin (no sobrescribe cliente) |
| `/api/admin/leads/[id]/stage` | PATCH | Mover en pipeline |
| `/api/admin/alertas` | GET, PATCH | Listar + mark all read |
| `/api/admin/alertas/[id]` | PATCH | Mark single read |
| `/api/admin/search?q=` | GET | Búsqueda global (clientes/productos/cotizaciones/facturas) |
| `/api/admin/health` | GET | Healthcheck con DB |

### Cliente Portal (require rol CLIENTE)
| Endpoint | Métodos | Descripción |
|---|---|---|
| `/api/cliente/perfil` | PATCH | Editar whatsapp/email/ciudad/dirección |
| `/api/cliente/password` | POST | Cambiar contraseña |
| `/api/cliente/vehiculos` | POST | Agregar vehículo propio |
| `/api/cliente/vehiculos/[vid]` | DELETE | Eliminar vehículo propio |
| `/api/cliente/cotizaciones/[id]/responder` | POST | Aceptar/Rechazar cotización |
| `/api/cliente/facturas/[id]/reportar-pago` | POST | Reportar pago (cola verificación) |

---

## Sistema de diseño

Documentado en detalle en [MANUAL.md](./MANUAL.md). Resumen:

### Tipografía — "Kinetic Motion"

| Variable CSS | Fuente | Uso |
|---|---|---|
| `var(--font-display)` | **Syncopate** (wide, kinetic) | Headings, hero |
| `var(--font-body)` | **Inter** | Body text |
| `var(--font-mono)` | **Space Mono** | SKUs, IDs, números |

### Helpers CSS (definidos en `globals.css`)

```css
.font-display-kinetic         /* H2 con tracking 0.04em (sm+) */
.font-display-kinetic--tight  /* H1 con tracking 0.02em (sm+), word-break para mobile */
.font-mono-tech               /* labels técnicas, tracking 0.06em uppercase */
.animate-shimmer              /* gold shimmer para skeletons */
```

### Paleta

```css
--color-gold: #f5c518         /* Acento principal */
--color-gold-hover: #e0b115
--color-success: #16a34a
--color-danger:  #dc2626
--bg-base:       #f4f5f7 / #000  /* light / dark */
--bg-surface:    #fff / #111
--bg-card:       #fff / #1c1c1c
--bg-elevated:   #f7f7f9 / #27272a
--text-primary / --text-secondary / --text-muted
--border / --border-strong / --border-subtle
```

### Focus rings (WCAG 2.4.7)

- `input/select/textarea:focus` → gold border + glow halo
- `button/a:focus-visible` → gold outline ring

### Motion

- Hover: lift (-translate-y-1), bottom-bar slide (scale-x), gold border, glow shadow
- `prefers-reduced-motion: reduce` → shimmer freeze

---

## Deploy a Vercel

### Setup inicial

1. Conectar tu repo GitHub a Vercel:
   - https://vercel.com → New Project → Import `Pantera95/Ranko-SAAS---Web`
2. **Root Directory**: `ranko-parts-platform`
3. **Framework Preset**: Next.js
4. Variables de entorno (Production):
   - `DATABASE_URL` + `DIRECT_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` = `https://tu-dominio.vercel.app` o tu custom domain
   - `AUTH_TRUST_HOST` = `true`
   - `NEXT_PUBLIC_APP_URL` (igual que AUTH_URL)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - (opcional) `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `META_APP_SECRET`
   - (opcional para producción real) `DISABLE_DEMO_LOGIN=1`

### Auto-deploy

Cada `git push origin main` dispara un deploy automático. Preview deploys aparecen para otras ramas.

### Custom domain

```bash
vercel domains add tu-dominio.com
# Luego en el dashboard → Settings → Domains → Add
```

### CLI útil

```bash
vercel login                          # auth
vercel link --project ranko-saas-web  # vincular dir local
vercel ls ranko-saas-web              # listar deploys
vercel inspect <url>                  # inspeccionar deploy
vercel deploy --prod                  # forzar deploy prod
vercel env ls production              # ver env vars
vercel env pull .env.production       # descargar
```

---

## Troubleshooting

### Login se queda en "ENTRANDO..." infinitamente

Bug conocido de Auth.js v5 beta con `signIn({ redirect: false })` en iOS Safari. **Solución implementada**: el LoginForm hace un POST nativo del form (no usa el helper JS). Si vuelves a editar el form, no introduzcas `signIn()` client-side.

### Después del login redirige a una URL `ranko-saas-XXXXX-pantera95s-projects.vercel.app` (404)

NextAuth usa `AUTH_URL` para construir redirects. Si está vacío, usa `VERCEL_URL` que es por-deploy. **Solución**: setea `AUTH_URL` al alias estable + `AUTH_TRUST_HOST=true`.

### El stock no se decrementa al emitir factura

Verifica que el producto tenga filas en `inventario` (auto-creadas al crear producto). Si fue creado vía DB seed antes de tu cambio, usa `POST /api/admin/inventario` para crear las filas manualmente.

### Demo accounts no funcionan en producción

Asegúrate que `DISABLE_DEMO_LOGIN` NO esté seteada en Vercel (o esté en cualquier valor distinto de `1`).

### Modo demo / "fallback" en todas las páginas

Significa que `DATABASE_URL` no está configurada o no responde. Verifica conexión a Postgres.

### Páginas se desbordan en móvil

Los headings hero usan `font-display-kinetic--tight` que en mobile (< 640px) usa `letter-spacing: 0` y `word-break: break-word`. Si introduces un H1 nuevo, hereda este comportamiento — pero verifica que el `text-{size}` mobile no sea > `text-4xl` para títulos largos.

### TypeScript errors después de `npm install`

Re-genera el cliente Prisma:
```bash
npx prisma generate
```

### Build falla en Vercel pero local OK

Asegúrate que el repo no tenga `.env` commiteado (`.gitignore` lo cubre). Vercel usa sus propias env vars. Verifica `vercel env ls production`.

---

## Licencia

Proprietary © Ranko Parts 2026. All rights reserved.

---

## Recursos adicionales

- **Manual de desarrollo:** [MANUAL.md](./MANUAL.md) — explica cómo se construyó cada feature
- **Next.js docs:** https://nextjs.org/docs
- **Prisma docs:** https://www.prisma.io/docs
- **Auth.js v5:** https://authjs.dev
- **Tailwind v4:** https://tailwindcss.com/docs/v4-beta
