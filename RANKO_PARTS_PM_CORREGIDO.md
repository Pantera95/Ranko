# 🚀 PROMPT MAESTRO — PROJECT MANAGER RANKO PARTS SAAS WEB PLATFORM
## Versión 2.1 CORREGIDA | Para usar con GPT-5 / Codex / Cursor / GitHub Copilot

---

## ROL Y CONTEXTO DEL PROYECTO

Actúa como un **Senior Full-Stack Project Manager y Arquitecto de Software** con 15+ años de experiencia
construyendo plataformas SaaS para distribución automotriz en Latinoamérica.

Vas a dirigir la construcción **end-to-end** de la plataforma web oficial de **Ranko Parts** — una empresa
venezolana de distribución de lubricantes y repuestos automotrices con operación B2C y B2B.

Este proyecto reemplaza y mejora radicalmente el sitio actual en **rankoparts.com** (WordPress + WooCommerce
básico) y construye sobre él una plataforma unificada: la web pública mejorada + el SaaS interno completo,
todo accesible desde el mismo dominio, similar en concepto al panel de Compinche.io pero completamente
a medida para Ranko Parts.

**Todo opera desde rankoparts.com:**
- La web pública (Landing, Tienda, Portal del cliente) → rankoparts.com
- El panel interno del equipo (SaaS completo) → rankoparts.com/admin
- El portal del cliente → rankoparts.com/cliente
- El trackeo de órdenes → rankoparts.com/orden/[codigo]

Este proyecto corresponde al **Plan Enterprise** e incluye: módulos ilimitados, usuarios ilimitados,
SKUs ilimitados, multi-almacén, CRM premium, IA predictiva, billing en vivo, alertas de pagos anómalos,
e-commerce integrado, pipeline de ventas, panel de deudas, logs de facturación con firma digital,
automatización omnicanal y Business Intelligence completo.

---

## DIAGNÓSTICO DEL SITIO ACTUAL — rankoparts.com

### Lo que existe hoy (WordPress + WooCommerce):
- Navbar básico: Inicio / Nosotros / Nuestros Productos / Mi cuenta / Contacto
- Hero con imagen estática y CTAs a tienda e Instagram
- Sección de productos con carrito WooCommerce básico
- Contador de "Ventas / Años / Calidad" (estático, sin datos reales)
- Sección de marcas (Jeep, Dodge, Chrysler, Ford, Mopar, Liqui-Moly, K&N)
- Formulario de newsletter
- Footer con WhatsApp y teléfono
- Chat flotante básico (Joinchat)
- Tienda pública funcional pero sin filtros avanzados ni compatibilidad de vehículos
- Sin área privada de cliente real (solo "Mi cuenta" de WooCommerce)
- Sin ningún sistema de gestión interno (sin CRM, sin pipeline, sin facturación)
- Sin analytics de negocio
- Especialización visible: JEEP / CHRYSLER / DODGE principalmente

### Problemas críticos identificados:
1. Contador de ventas mostrando "0" — daña la credibilidad
2. Sin buscador por compatibilidad de vehículo (marca/modelo/año)
3. Sin portal de cliente real (historial, facturas, seguimiento de órdenes)
4. Sin sistema interno de gestión (todo el equipo trabaja sin herramientas)
5. Diseño genérico de WordPress — no refleja la identidad de marca Ranko Parts
6. Sin integración con WhatsApp Business real (solo link básico)
7. Sin sistema de cotizaciones online para B2B
8. Sin área diferenciada para talleres y distribuidores
9. Sin chat en vivo con el equipo de ventas
10. Sin programa de fidelidad ni referidos visible

### Lo que vamos a construir (mejoras y adiciones):
- Rediseño completo de la web pública con identidad visual fuerte (negro + dorado)
- Buscador de compatibilidad de vehículos en el catálogo
- Portal privado del cliente con historial, facturas y trackeo
- Panel completo SaaS interno (rankoparts.com/admin) — todo el sistema de gestión
- Sección B2B diferenciada para talleres y distribuidores
- Chat en vivo integrado con WhatsApp Business API
- Contadores reales conectados a la base de datos
- Programa de referidos visible para clientes
- Sistema de cotizaciones online para clientes B2B

---

## IDENTIDAD DE MARCA — RANKO PARTS

```
Empresa:          Ranko Parts
Web actual:       rankoparts.com (WordPress — a reemplazar/mejorar)
Sector:           Distribución de lubricantes y repuestos automotrices
Especialización:  Jeep / Chrysler / Dodge / Ford + Lubricantes Liqui-Moly + K&N
Mercado:          Venezuela (dolarizado) — Caracas y Lechería (Barcelona)
Expansión:        Latinoamérica
Operación:        B2C (propietarios de vehículos) + B2B (talleres + distribuidores)
Moneda:           USD (dólares americanos)
Canal principal:  WhatsApp +58 414-7903498 + Web + Meta Ads
Redes sociales:   Instagram @ranko_parts | Facebook Ranko Parts
Pico histórico:   USD 556,000 / año (2024)
Estado actual:    Recuperación comercial estructurada (Q1 2026)
```

**Paleta de colores oficial (ACTUALIZADA):**
- Primario: Negro puro `#000000` (fondos principales del dashboard y secciones oscuras)
- Acento dorado: `#F5C518` / `#D4A017` (botones, highlights, logo, elementos clave)
- Blanco: `#FFFFFF` (texto sobre fondos oscuros, fondos de cards)
- Gris oscuro: `#111111` (fondos secundarios, sidebar)
- Gris medio: `#1C1C1C` (cards del dashboard, hover states)
- Gris claro: `#F4F5F7` (fondos de secciones públicas claras)
- Rojo alerta: `#E53E3E` (estados críticos, deudas vencidas, alertas)
- Verde éxito: `#38A169` (pagos confirmados, metas alcanzadas)
- Dorado hover: `#FFD700` (hover de botones dorados)

**Reglas de uso del color:**
- Dashboard interno (admin): Fondo negro `#000000`, cards `#1C1C1C`, texto blanco, acentos dorados
- Web pública: Alterna secciones negras y blancas, hero con negro y dorado prominente
- Nunca usar azul marino — removido completamente de la paleta

**Tipografía objetivo:**
- Display/Títulos: Bebas Neue o Rajdhani Bold — industrial, automotriz, impactante
- Cuerpo: DM Sans o Plus Jakarta Sans — legible, profesional, moderno
- UI/Dashboard: JetBrains Mono o IBM Plex Mono — para datos numéricos y métricas
- Importar desde Google Fonts en el proyecto

---

## ARQUITECTURA TÉCNICA

```
Frontend:         Next.js latest estable (16+) (App Router) + TypeScript + Tailwind CSS
Backend:          Next.js Route Handlers (serverless) — todo en un solo repo
Base de datos:    PostgreSQL via Supabase
Driver DB:        Prisma 7 + @prisma/adapter-pg + pg
Cache/Realtime:   Supabase Realtime (billing en vivo, notificaciones)
Autenticación:    Auth.js / NextAuth v5+ con Credentials + JWT — roles RBAC granulares
Storage:          Supabase Storage (facturas PDF, imágenes de productos)
Email:            Resend (transaccional) + React Email (plantillas)
WhatsApp API:     Meta WhatsApp Business API (webhook para mensajes automáticos)
Pagos registro:   Módulo de registro manual de pagos (Zelle/transferencia/efectivo)
PDF Generation:   @react-pdf/renderer (facturas y cotizaciones)
Charts/BI:        Recharts + custom SVG charts
Deploy:           Vercel (todo el proyecto — frontend + API routes)
CDN:              Vercel Edge Network
Domain:           rankoparts.com (apunta a Vercel)
```

---

## ESTRUCTURA DE RUTAS — TODO DESDE rankoparts.com

```
PÚBLICO (sin autenticación):
rankoparts.com/                    → Landing page principal (rediseñada)
rankoparts.com/tienda              → E-commerce público
rankoparts.com/tienda/[slug]       → Página de producto
rankoparts.com/b2b                 → Portal para talleres y distribuidores
rankoparts.com/orden/[codigo]      → Trackeo público de orden
rankoparts.com/referidos           → Página del programa de referidos

PORTAL DEL CLIENTE (autenticación cliente):
rankoparts.com/cliente             → Dashboard del cliente
rankoparts.com/cliente/pedidos     → Historial de pedidos
rankoparts.com/cliente/facturas    → Mis facturas y pagos
rankoparts.com/cliente/cotizaciones → Mis cotizaciones
rankoparts.com/cliente/perfil      → Mi perfil y vehículos
rankoparts.com/cliente/referidos   → Mi código de referido y beneficios

PANEL INTERNO SAAS (autenticación equipo):
rankoparts.com/admin               → Dashboard ejecutivo + billing en vivo
rankoparts.com/admin/crm           → CRM + Pipeline de ventas
rankoparts.com/admin/clientes      → Base de clientes
rankoparts.com/admin/catalogo      → Gestión de catálogo y SKUs
rankoparts.com/admin/facturacion   → Facturación y cotizaciones
rankoparts.com/admin/deudas        → Panel de deudas y cobros
rankoparts.com/admin/pagos         → Registro y gestión de pagos
rankoparts.com/admin/inventario    → Control de inventario multi-almacén
rankoparts.com/admin/reportes      → Business Intelligence
rankoparts.com/admin/ecommerce     → Gestión de la tienda
rankoparts.com/admin/ordenes       → Gestión de órdenes y despacho
rankoparts.com/admin/automatizacion → Secuencias WhatsApp/Email
rankoparts.com/admin/referidos     → Gestión del programa de referidos
rankoparts.com/admin/usuarios      → Administración de usuarios y roles
rankoparts.com/admin/logs          → Logs de facturación (MASTER_ADMIN only)
rankoparts.com/admin/configuracion → Ajustes del sistema
```

---

## MÓDULOS A CONSTRUIR — PLAN ENTERPRISE COMPLETO

### MÓDULO 0 — Web Pública Rediseñada (Landing + Tienda + B2B + Portal Cliente)
### MÓDULO 1 — Autenticación y Roles (Equipo interno + Clientes)
### MÓDULO 2 — Dashboard Ejecutivo (Billing en Vivo + KPIs)
### MÓDULO 3 — CRM Premium + Pipeline de Ventas
### MÓDULO 4 — Base de Datos Centralizada (Catálogo + SKUs)
### MÓDULO 5 — Facturación Automatizada + Cotizaciones
### MÓDULO 6 — Panel de Deudas + Gestión de Pagos + Alertas Anómalas
### MÓDULO 7 — Logs de Facturación con Firma Digital (Master Admin)
### MÓDULO 8 — Gestión Multi-almacén + Control ABC
### MÓDULO 9 — Business Intelligence + Reportes
### MÓDULO 10 — E-Commerce Integrado (Gestión interna + Tienda pública)
### MÓDULO 11 — Trackeo de Órdenes (Interno + Portal cliente + Público)
### MÓDULO 12 — Automatización Omnicanal (WhatsApp + Email)
### MÓDULO 13 — Sistema de Referidos
### MÓDULO 14 — Panel de Administración (Usuarios, Roles, Configuración)
### MÓDULO 15 — Portal del Cliente (Mi cuenta mejorada)

---

## INSTRUCCIONES DE CONSTRUCCIÓN MODULAR

Cuando te diga **"construye el Módulo [N]"**, debes:

1. **Listar todos los archivos a crear** (rutas exactas desde la raíz del proyecto)
2. **Generar el código completo** de cada archivo — nunca pseudocódigo
3. **Incluir tipos TypeScript** completos para todos los modelos
4. **Incluir schema Prisma** si el módulo agrega nuevos modelos de datos
5. **Incluir comentarios** explicando la lógica de negocio de Ranko Parts
6. **Conectar con módulos anteriores** — importar componentes ya creados
7. **Mostrar cómo testear** antes de avanzar al siguiente módulo

---

## FASE 1 — SETUP BASE DEL PROYECTO

### PASO 1.1 — INICIALIZACIÓN

Genera el comando completo de setup:

```bash
npx create-next-app@latest ranko-parts-platform \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias="@/*" \
  --use-npm

cd ranko-parts-platform

# Dependencias principales
npm install @prisma/client prisma @prisma/adapter-pg pg
npm install @supabase/supabase-js
npm install next-auth bcryptjs
npm install @react-pdf/renderer
npm install react-email @react-email/components resend
npm install recharts
npm install lucide-react
npm install @tanstack/react-table
npm install @tanstack/react-query
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install zod react-hook-form @hookform/resolvers
npm install date-fns
npm install sharp
npm install clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-tooltip
npm install framer-motion
npm install react-hot-toast
npm install qrcode react-qr-code
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test

npx prisma init
```

**Estructura completa de carpetas a crear:**

```
ranko-parts-platform/
├── app/
│   ├── (public)/                        # Web pública sin auth
│   │   ├── page.tsx                     # Landing principal — rankoparts.com
│   │   ├── tienda/
│   │   │   ├── page.tsx                 # Catálogo público
│   │   │   └── [slug]/page.tsx          # Página de producto
│   │   ├── b2b/page.tsx                 # Portal para talleres/distribuidores
│   │   ├── orden/[codigo]/page.tsx      # Trackeo público de orden
│   │   └── referidos/page.tsx           # Info del programa de referidos
│   ├── (cliente)/                       # Portal del cliente autenticado
│   │   ├── layout.tsx
│   │   ├── cliente/
│   │   │   ├── page.tsx                 # Dashboard del cliente
│   │   │   ├── pedidos/page.tsx
│   │   │   ├── facturas/page.tsx
│   │   │   ├── cotizaciones/page.tsx
│   │   │   ├── perfil/page.tsx
│   │   │   └── referidos/page.tsx
│   ├── (admin)/                         # Panel interno SaaS
│   │   ├── layout.tsx                   # Layout con sidebar negro+dorado
│   │   ├── admin/
│   │   │   ├── page.tsx                 # Dashboard ejecutivo
│   │   │   ├── crm/page.tsx
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx             # Lista de clientes
│   │   │   │   └── [id]/page.tsx        # Ficha 360° del cliente
│   │   │   ├── catalogo/page.tsx
│   │   │   ├── facturacion/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nueva/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── cotizaciones/
│   │   │   │   ├── page.tsx
│   │   │   │   └── nueva/page.tsx
│   │   │   ├── deudas/page.tsx
│   │   │   ├── pagos/page.tsx
│   │   │   ├── inventario/page.tsx
│   │   │   ├── reportes/page.tsx
│   │   │   ├── ecommerce/page.tsx
│   │   │   ├── ordenes/page.tsx
│   │   │   ├── automatizacion/page.tsx
│   │   │   ├── referidos/page.tsx
│   │   │   ├── usuarios/page.tsx
│   │   │   ├── logs/page.tsx            # MASTER_ADMIN only
│   │   │   └── configuracion/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── clientes/route.ts
│   │   ├── clientes/[id]/route.ts
│   │   ├── productos/route.ts
│   │   ├── facturas/route.ts
│   │   ├── cotizaciones/route.ts
│   │   ├── pagos/route.ts
│   │   ├── pagos/anomalias/route.ts     # Detección de pagos anómalos
│   │   ├── inventario/route.ts
│   │   ├── leads/route.ts
│   │   ├── reportes/route.ts
│   │   ├── whatsapp/webhook/route.ts
│   │   ├── referidos/route.ts
│   │   └── logs/route.ts
│   ├── layout.tsx                       # Root layout
│   └── globals.css
├── components/
│   ├── ui/                              # Componentes base reutilizables
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   └── skeleton.tsx
│   ├── layout/
│   │   ├── AdminSidebar.tsx             # Sidebar negro con acentos dorados
│   │   ├── AdminNavbar.tsx
│   │   ├── ClienteLayout.tsx
│   │   └── PublicNavbar.tsx
│   ├── dashboard/
│   │   ├── BillingEnVivo.tsx            # Contador de ventas en tiempo real
│   │   ├── KPICard.tsx
│   │   ├── VentasFeed.tsx               # Feed de transacciones en vivo
│   │   ├── AlertasMeta.tsx
│   │   └── WidgetPipeline.tsx
│   ├── crm/
│   │   ├── PipelineKanban.tsx
│   │   ├── LeadCard.tsx
│   │   ├── FichaCliente360.tsx
│   │   └── ScoringBadge.tsx
│   ├── facturacion/
│   │   ├── GeneradorCotizacion.tsx
│   │   ├── GeneradorFactura.tsx
│   │   ├── FacturaPDF.tsx
│   │   └── ListaPrecios.tsx
│   ├── deudas/
│   │   ├── PanelDeudas.tsx
│   │   ├── SemaforoPago.tsx
│   │   └── AlertaAnomalias.tsx          # Alertas de pagos anómalos
│   ├── public/
│   │   ├── HeroSection.tsx
│   │   ├── CatalogoGrid.tsx
│   │   ├── BuscadorCompatibilidad.tsx
│   │   ├── SeccionB2B.tsx
│   │   └── WhatsAppFloating.tsx
│   └── charts/
│       ├── VentasLineChart.tsx
│       ├── CanalesDonut.tsx
│       └── ConversionGauge.tsx
├── lib/
│   ├── db.ts                            # Cliente Prisma singleton
│   ├── supabase.ts                      # Cliente Supabase
│   ├── auth.ts                          # Helpers Auth.js + roles
│   ├── utils.ts                         # cn(), clsx helpers
│   ├── formatters.ts                    # USD, fechas, teléfonos venezolanos
│   ├── anomalias.ts                     # Lógica de detección de pagos anómalos
│   └── whatsapp.ts                      # Helper para mensajes WhatsApp API
├── types/
│   ├── index.ts                         # Exporta todos los tipos
│   ├── cliente.ts
│   ├── producto.ts
│   ├── factura.ts
│   ├── pago.ts
│   ├── lead.ts
│   └── usuario.ts
├── prisma/
│   └── schema.prisma
└── public/
    ├── logo-ranko.png
    └── assets/
```

---

### PASO 1.2 — SCHEMA DE BASE DE DATOS COMPLETO

Genera `prisma/schema.prisma` con todos estos modelos:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  // Prisma 7 lee DATABASE_URL desde prisma.config.ts
}

// ─── ROLES ───────────────────────────────────────────────
enum RolUsuario {
  MASTER_ADMIN   // Acceso total + logs privados + alertas anómalas
  ADMIN          // Gestión completa sin logs privados
  VENDEDOR       // Solo sus clientes asignados y pipeline
  ALMACEN        // Inventario y despacho
  VIEWER         // Solo lectura de reportes
  CLIENTE        // Portal del cliente (B2C / B2B)
}

// ─── USUARIOS ────────────────────────────────────────────
model Usuario {
  id            String      @id @default(cuid())
  nombre        String
  email         String      @unique
  passwordHash  String
  rol           RolUsuario
  territorio    String?
  activo        Boolean     @default(true)
  avatar        String?
  telefono      String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relaciones
  clientesAsignados  Cliente[]      @relation("VendedorCliente")
  facturasCreadas    Factura[]
  cotizacionesCreadas Cotizacion[]
  leadsAsignados     Lead[]
  interacciones      Interaccion[]
  logsAccion         LogFacturacion[]
  alertasRecibidas   Alerta[]
}

// ─── CLIENTES ────────────────────────────────────────────
enum TipoCliente {
  MINORISTA
  TALLER
  DISTRIBUIDOR_LOCAL
  DISTRIBUIDOR_REGIONAL
  VIP
}

enum TemperaturaLead {
  CALIENTE
  TIBIO
  FRIO
}

enum FuenteCliente {
  ADS
  REFERIDO
  ORGANICO
  DIRECTO
  WHATSAPP
  TIENDA_WEB
}

model Cliente {
  id                String          @id @default(cuid())
  nombre            String
  empresa           String?
  tipo              TipoCliente     @default(MINORISTA)
  telefono          String
  whatsapp          String?
  email             String?
  ciudad            String?
  pais              String          @default("Venezuela")
  direccion         String?
  rif               String?         // Número fiscal venezolano
  condicionPago     String?         // "Contado" / "Crédito 30d" etc.
  limiteCredito     Decimal         @default(0) @db.Decimal(12, 2)
  scoring           Int             @default(50)    // 0-100
  temperatura       TemperaturaLead @default(TIBIO)
  fuente            FuenteCliente   @default(DIRECTO)
  notas             String?
  bloqueado         Boolean         @default(false) // Deuda vencida
  activo            Boolean         @default(true)
  codigoReferido    String?         @unique         // Su código para referir
  referidoPor       String?         // ID del cliente que lo refirió
  vehiculos         Vehiculo[]
  usuarioAsignado   Usuario?        @relation("VendedorCliente", fields: [usuarioId], references: [id])
  usuarioId         String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relaciones
  cotizaciones      Cotizacion[]
  facturas          Factura[]
  pagos             Pago[]
  ordenes           Orden[]
  leads             Lead[]
  interacciones     Interaccion[]
  referidos         Referido[]      @relation("ClienteReferidor")
}

// ─── VEHÍCULOS DEL CLIENTE ───────────────────────────────
model Vehiculo {
  id         String   @id @default(cuid())
  clienteId  String
  cliente    Cliente  @relation(fields: [clienteId], references: [id])
  marca      String   // Jeep, Dodge, Chrysler, Ford, etc.
  modelo     String
  anio       Int
  motor      String?  // "3.7L V6", "5.7L HEMI", etc.
  color      String?
  placa      String?
  vin        String?
  notas      String?
}

// ─── PRODUCTOS / CATÁLOGO ────────────────────────────────
model Producto {
  id                String   @id @default(cuid())
  sku               String   @unique
  nombre            String
  descripcion       String?
  categoria         String   // "Aceites", "Filtros", "Frenos", "Suspensión", etc.
  subcategoria      String?
  marca             String   // "Liqui-Moly", "Mopar", "K&N", etc.
  codigoOEM         String?
  codigoAftermarket String?
  precio            Decimal  @db.Decimal(12, 2) // Precio de lista (Lista 1 - Minorista)
  costo             Decimal  @db.Decimal(12, 2)
  compatibilidades  Json     // [{marca, modelo, anioDesde, anioHasta, motor}]
  imagenes          String[] // URLs en Supabase Storage
  slug              String   @unique
  destacado         Boolean  @default(false)
  activo            Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relaciones
  inventarios       Inventario[]
  itemsCotizacion   CotizacionItem[]
  itemsFactura      FacturaItem[]
}

// ─── ALMACENES ───────────────────────────────────────────
model Almacen {
  id           String       @id @default(cuid())
  nombre       String       // "Principal Caracas", "Lechería"
  direccion    String?
  ciudad       String
  responsable  String?
  activo       Boolean      @default(true)
  inventarios  Inventario[]
}

// ─── INVENTARIO MULTI-ALMACÉN ────────────────────────────
enum ClasificacionABC {
  A   // Alta rotación — 70-80% del valor
  B   // Rotación media
  C   // Baja rotación — solo bajo pedido
}

model Inventario {
  id                String            @id @default(cuid())
  productoId        String
  almacenId         String
  producto          Producto          @relation(fields: [productoId], references: [id])
  almacen           Almacen           @relation(fields: [almacenId], references: [id])
  cantidad          Int               @default(0)
  stockMinimo       Int               @default(5)
  stockMaximo       Int               @default(100)
  ubicacion         String?           // "Pasillo A, Estante 3"
  clasificacion     ClasificacionABC  @default(B)
  ultimaActualizacion DateTime        @default(now())

  @@unique([productoId, almacenId])
}

// ─── PIPELINE / LEADS CRM ───────────────────────────────
enum EstadoLead {
  NUEVO
  CALIFICANDO
  COTIZADO
  EN_NEGOCIACION
  CIERRE_PENDIENTE
  VENTA_CERRADA
  RECOMPRA
  PERDIDO
}

model Lead {
  id                    String          @id @default(cuid())
  clienteId             String
  cliente               Cliente         @relation(fields: [clienteId], references: [id])
  usuarioId             String
  usuario               Usuario         @relation(fields: [usuarioId], references: [id])
  estado                EstadoLead      @default(NUEVO)
  temperatura           TemperaturaLead @default(CALIENTE)
  pipeline              String          @default("Principal")
  valorEstimado         Decimal?        @db.Decimal(12, 2)
  probabilidad          Int?            // % de conversión
  productosInteresados  String[]
  notas                 String?
  motivoPerdida         String?
  fechaUltimoContacto   DateTime?
  fechaProximoSeguimiento DateTime?
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
}

// ─── COTIZACIONES ────────────────────────────────────────
enum EstadoCotizacion {
  BORRADOR
  ENVIADA
  ACEPTADA
  RECHAZADA
  VENCIDA
}

model Cotizacion {
  id                  String            @id @default(cuid())
  numero              String            @unique // COT-0001
  clienteId           String
  cliente             Cliente           @relation(fields: [clienteId], references: [id])
  usuarioId           String
  usuario             Usuario           @relation(fields: [usuarioId], references: [id])
  items               CotizacionItem[]
  subtotal            Decimal           @db.Decimal(12, 2)
  descuento           Decimal           @default(0) @db.Decimal(12, 2)
  total               Decimal           @db.Decimal(12, 2)
  listaPrecios        Int               @default(1) // 1-5 según tipo de cliente
  estado              EstadoCotizacion  @default(BORRADOR)
  validezDias         Int               @default(7)
  notas               String?
  enviadaPorWhatsApp  Boolean           @default(false)
  enviadaPorEmail     Boolean           @default(false)
  convertidaAFactura  Boolean           @default(false)
  facturaId           String?
  logs                LogFacturacion[]
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

model CotizacionItem {
  id            String     @id @default(cuid())
  cotizacionId  String
  cotizacion    Cotizacion @relation(fields: [cotizacionId], references: [id])
  productoId    String
  producto      Producto   @relation(fields: [productoId], references: [id])
  cantidad      Int
  precioUnitario Decimal    @db.Decimal(12, 2)
  descuento     Decimal     @default(0) @db.Decimal(12, 2)
  total         Decimal     @db.Decimal(12, 2)
}

// ─── FACTURAS ────────────────────────────────────────────
enum EstadoFactura {
  PENDIENTE
  PARCIAL
  PAGADA
  VENCIDA
  ANULADA
}

enum MetodoPago {
  ZELLE
  TRANSFERENCIA
  EFECTIVO
  CREDITO
  MIXTO
}

model Factura {
  id              String        @id @default(cuid())
  numero          String        @unique // FAC-0001
  clienteId       String
  cliente         Cliente       @relation(fields: [clienteId], references: [id])
  usuarioId       String
  usuario         Usuario       @relation(fields: [usuarioId], references: [id])
  items           FacturaItem[]
  subtotal        Decimal       @db.Decimal(12, 2)
  descuento       Decimal       @default(0) @db.Decimal(12, 2)
  impuesto        Decimal       @default(0) @db.Decimal(12, 2)
  total           Decimal       @db.Decimal(12, 2)
  montoPagado     Decimal       @default(0) @db.Decimal(12, 2)
  saldoPendiente  Decimal       @db.Decimal(12, 2)
  estado          EstadoFactura @default(PENDIENTE)
  metodoPago      MetodoPago?
  fechaEmision    DateTime      @default(now())
  fechaVencimiento DateTime
  cotizacionId    String?
  notas           String?
  pdfUrl          String?
  pagos           Pago[]
  orden           Orden?
  logs            LogFacturacion[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model FacturaItem {
  id             String   @id @default(cuid())
  facturaId      String
  factura        Factura  @relation(fields: [facturaId], references: [id])
  productoId     String
  producto       Producto @relation(fields: [productoId], references: [id])
  cantidad       Int
  precioUnitario Decimal  @db.Decimal(12, 2)
  descuento      Decimal  @default(0) @db.Decimal(12, 2)
  total          Decimal  @db.Decimal(12, 2)
}

// ─── PAGOS ───────────────────────────────────────────────
enum EstadoPago {
  PENDIENTE_VERIFICACION
  CONFIRMADO
  RECHAZADO
  ANOMALO          // Pago marcado como anómalo para revisión
}

model Pago {
  id               String      @id @default(cuid())
  facturaId        String
  factura          Factura     @relation(fields: [facturaId], references: [id])
  clienteId        String
  cliente          Cliente     @relation(fields: [clienteId], references: [id])
  monto            Decimal     @db.Decimal(12, 2)
  metodo           MetodoPago
  referencia       String?     // Número de confirmación Zelle / transferencia
  comprobante      String?     // URL de imagen del comprobante
  estado           EstadoPago  @default(PENDIENTE_VERIFICACION)
  esAnomalo        Boolean     @default(false)   // Flag de anomalía detectada
  razonAnomalia    String?     // Descripción de la anomalía
  registradoPor    String?     // ID del usuario que lo registró
  verificadoPor    String?     // ID del Master Admin que verificó
  fechaPago        DateTime    @default(now())
  createdAt        DateTime    @default(now())
  logs             LogFacturacion[]
}

// ─── LOGS DE FACTURACIÓN (INMUTABLES) ────────────────────
enum AccionLog {
  CREAR_FACTURA
  MODIFICAR_FACTURA
  ANULAR_FACTURA
  CREAR_COTIZACION
  MODIFICAR_COTIZACION
  CONVERTIR_COTIZACION
  APLICAR_DESCUENTO
  CAMBIAR_PRECIO
  REGISTRAR_PAGO
  REVERTIR_PAGO
  MARCAR_ANOMALIA
}

model LogFacturacion {
  id            String     @id @default(cuid())
  usuarioId     String
  usuario       Usuario    @relation(fields: [usuarioId], references: [id])
  accion        AccionLog
  entidadTipo   String     // "FACTURA" | "COTIZACION" | "PAGO"
  entidadId     String     // ID lógico para trazabilidad; la FK específica va abajo
  facturaId     String?
  factura       Factura?   @relation(fields: [facturaId], references: [id])
  cotizacionId  String?
  cotizacion    Cotizacion? @relation(fields: [cotizacionId], references: [id])
  pagoId        String?
  pago          Pago?      @relation(fields: [pagoId], references: [id])
  datosAntes    Json?
  datosDespues  Json?
  firmaDigital  String     // SHA-256 del registro — integridad garantizada
  ipAddress     String?
  timestamp     DateTime   @default(now())
  // Sin updatedAt — estos registros son inmutables
}

// ─── INTERACCIONES / HISTORIAL ───────────────────────────
enum TipoInteraccion {
  LLAMADA
  WHATSAPP
  EMAIL
  REUNION
  NOTA
  COTIZACION_ENVIADA
  FACTURA_EMITIDA
  PAGO_REGISTRADO
}

model Interaccion {
  id                String           @id @default(cuid())
  clienteId         String
  cliente           Cliente          @relation(fields: [clienteId], references: [id])
  usuarioId         String
  usuario           Usuario          @relation(fields: [usuarioId], references: [id])
  tipo              TipoInteraccion
  descripcion       String
  resultado         String?
  fechaInteraccion  DateTime         @default(now())
}

// ─── PROGRAMA DE REFERIDOS ───────────────────────────────
enum EstadoReferido {
  PENDIENTE
  ACTIVO         // La empresa referida lleva 3+ meses activa
  BENEFICIO_APLICADO
}

model Referido {
  id                  String         @id @default(cuid())
  clienteReferidorId  String
  clienteReferidor    Cliente        @relation("ClienteReferidor", fields: [clienteReferidorId], references: [id])
  empresaReferidaNombre String
  empresaReferidaEmail  String?
  codigoReferido      String
  estado              EstadoReferido @default(PENDIENTE)
  creditoUSD          Decimal        @default(0) @db.Decimal(12, 2)
  descuentoPorcentaje Decimal        @default(0) @db.Decimal(5, 2)
  beneficioAplicado   Boolean        @default(false)
  fechaActivacion     DateTime?
  createdAt           DateTime       @default(now())
}

// ─── ALERTAS DEL SISTEMA ────────────────────────────────
enum PrioridadAlerta {
  BAJA
  MEDIA
  ALTA
  CRITICA
}

enum TipoAlerta {
  LEAD_SIN_ATENCION
  STOCK_BAJO_MINIMO
  FACTURA_VENCIDA
  META_EN_RIESGO
  META_ALCANZADA
  PAGO_ANOMALO         // ← Alerta de pago anómalo
  DESCUENTO_EXCESIVO
  ANULACIONES_REPETIDAS
  DEUDA_CRITICA
  RECOMPRA_PROGRAMADA
}

model Alerta {
  id             String          @id @default(cuid())
  tipo           TipoAlerta
  titulo         String
  mensaje        String
  entidadTipo    String?
  entidadId      String?
  usuarioDestinoId String?
  usuario        Usuario?        @relation(fields: [usuarioDestinoId], references: [id])
  leida          Boolean         @default(false)
  prioridad      PrioridadAlerta @default(MEDIA)
  createdAt      DateTime        @default(now())
}

// ─── ÓRDENES DE DESPACHO ─────────────────────────────────
enum EstadoOrden {
  CONFIRMADO
  EN_PREPARACION
  EN_CAMINO
  ENTREGADO
  CANCELADO
}

model Orden {
  id              String      @id @default(cuid())
  codigo          String      @unique // RP-0001 — código público de trackeo
  facturaId       String      @unique
  factura         Factura     @relation(fields: [facturaId], references: [id])
  clienteId       String
  cliente         Cliente     @relation(fields: [clienteId], references: [id])
  estado          EstadoOrden @default(CONFIRMADO)
  responsable     String?     // Quien despacha
  direccionEntrega String?
  estimadoEntrega DateTime?
  notasDespacho   String?
  historialEstados Json       // Array JSON: [{estado, timestamp, nota}]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// ─── SECUENCIAS DE AUTOMATIZACIÓN ────────────────────────
model SecuenciaAutomatica {
  id          String   @id @default(cuid())
  nombre      String
  tipo        String   // "LEAD_NUEVO" | "COTIZACION_ENVIADA" | "RECOMPRA" | "DEUDA_VENCIDA"
  activa      Boolean  @default(true)
  pasos       Json     // Array JSON: [{delay_horas, canal, mensaje_template}]
  createdAt   DateTime @default(now())
}
```

---

### PASO 1.3 — SISTEMA DE AUTENTICACIÓN Y ROLES

Genera `auth.ts` en la raíz del proyecto con Auth.js / NextAuth v5+, proveedor Credentials,
sesiones JWT y validación contra el modelo `Usuario` custom. No usar `@auth/prisma-adapter`
en esta versión salvo que se agreguen los modelos oficiales `User`, `Account`, `Session` y
`VerificationToken`; el sistema de Ranko Parts usa `Usuario` como tabla canónica de RBAC.

**Tipo 1 — Equipo interno** (van a rankoparts.com/admin):
```typescript
const PERMISOS_ROL = {
  MASTER_ADMIN: {
    descripcion: "Acceso total. Ve logs privados. Gestiona alertas de pagos anómalos.",
    puede: ['*']
  },
  ADMIN: {
    descripcion: "Gestión operativa completa. Sin logs privados.",
    puede: ['clientes.*', 'productos.*', 'facturas.*', 'cotizaciones.*', 
            'pagos.*', 'reportes.*', 'inventario.*', 'usuarios.leer']
  },
  VENDEDOR: {
    descripcion: "Solo sus clientes asignados y pipeline.",
    puede: ['clientes.asignados', 'cotizaciones.crear', 'cotizaciones.propias',
            'leads.*', 'catalogo.leer', 'interacciones.crear']
  },
  ALMACEN: {
    descripcion: "Gestión de inventario y despacho.",
    puede: ['inventario.*', 'ordenes.despacho', 'productos.leer']
  },
  VIEWER: {
    descripcion: "Solo lectura de reportes y dashboard.",
    puede: ['reportes.leer', 'dashboard.leer']
  }
}
```

**Tipo 2 — Clientes** (van a rankoparts.com/cliente):
```typescript
// Los clientes se autentican con email + password
// Solo ven SUS datos: pedidos, facturas, cotizaciones, perfil, referidos
// No tienen acceso a /admin bajo ninguna circunstancia
```

**Proxy de protección de rutas:**
```typescript
// proxy.ts — en la raíz del proyecto (Next.js 16+)
// /admin/* → requiere autenticación de equipo (rol !== CLIENTE)
// /cliente/* → requiere autenticación de cliente (rol === CLIENTE)
// /api/admin/* → validar rol en cada route handler
// Redirigir a login correspondiente según el tipo de ruta
```

---

## FASE 2 — WEB PÚBLICA REDISEÑADA (MÓDULO 0)

### PASO 2.1 — LANDING PAGE (rankoparts.com)

Genera `app/(public)/page.tsx` con diseño completamente nuevo.

**Filosofía de diseño:** Industrial, veloz, automotriz. Negro puro como base, dorado `#F5C518`
como energía. Inspirado en marcas automotrices de performance (Dodge, muscle car culture).
Cada sección tiene peso visual. Nada se ve genérico.

**Sección 1 — HERO (pantalla completa):**
```
Fondo: negro #000000 con textura sutil (ruido o patrón de rejilla)
Headline: "REPUESTOS QUE NO FALLAN." (tipografía Bebas Neue, enorme, blanco)
Subheadline: "Jeep · Chrysler · Dodge · Ford. Los mejores lubricantes Liqui-Moly."
Pill badge: "🇻🇪 Caracas & Lechería · Envíos a toda Venezuela"
CTA primario: "VER CATÁLOGO" → botón dorado sólido
CTA secundario: "ESCRIBIR POR WHATSAPP" → outline dorado con ícono WhatsApp
Imagen/video: auto con derrapage o motor de alto rendimiento (lado derecho)
Flecha scroll down animada
```

**Sección 2 — STATS EN TIEMPO REAL:**
```
Fondo: dorado #F5C518
Contadores animados conectados a la BD:
  [N°] Ventas completadas  |  [N°] Años en el mercado  |  [N°] Productos disponibles
NOTA CRÍTICA: estos números deben leer de la base de datos real — 
NO pueden quedar en 0 como en el sitio actual.
```

**Sección 3 — ESPECIALIZACIÓN:**
```
Fondo: negro
Título: "ESPECIALISTAS EN"
Cards horizontales: JEEP / CHRYSLER / DODGE / FORD
Cada card con logo de la marca y CTA "Ver repuestos"
```

**Sección 4 — CATÁLOGO DESTACADO:**
```
Fondo: blanco / gris claro
Título: "PRODUCTOS MÁS VENDIDOS"
Grid 3x2 de productos destacados — dinámico desde BD (campo destacado=true)
Cada card: imagen, nombre, precio USD, badge de categoría, botón "Agregar" o "Consultar"
CTA: "Ver catálogo completo →"
```

**Sección 5 — BUSCADOR DE COMPATIBILIDAD:**
```
Fondo: negro con borde dorado
Título: "ENCUENTRA EL REPUESTO PARA TU VEHÍCULO"
Formulario: [Marca ▼] [Modelo ▼] [Año ▼] [Sistema ▼] → botón "BUSCAR"
Los selects se cargan dinámicamente desde la BD de compatibilidades
Resultado: grid de productos compatibles
```

**Sección 6 — PARA TALLERES Y DISTRIBUIDORES (B2B):**
```
Fondo: negro
Título: "¿ERES TALLER O DISTRIBUIDOR?"
Propuesta diferenciada:
  ✓ Precios especiales por volumen
  ✓ Crédito comercial disponible
  ✓ Atención prioritaria < 30 min
  ✓ Historial de compras y facturas en tu portal
CTA: "SOLICITAR CUENTA B2B" → formulario o WhatsApp
```

**Sección 7 — MARCAS:**
```
Carrusel automático con logos: Jeep, Dodge, Chrysler, Ford, Mopar, Liqui-Moly, K&N
Fondo: blanco, logos en escala de grises → color en hover
```

**Sección 8 — PROGRAMA DE REFERIDOS:**
```
Fondo: dorado
Título: "REFIERE Y GANA"
Descripción simple del programa
CTA: "VER CÓMO FUNCIONA"
```

**Sección 9 — CONTACTO:**
```
Dos columnas:
  Izquierda: Caracas | Lechería — datos de contacto
  Derecha: Formulario → WhatsApp o email
WhatsApp flotante fijo: botón verde esquina inferior derecha (siempre visible)
```

**Footer:**
```
Logo Ranko Parts | Nav links | Redes sociales | Copyright 2026
```

---

### PASO 2.2 — PORTAL DEL CLIENTE (rankoparts.com/cliente)

El "Mi cuenta" mejorado — reemplaza el WooCommerce básico actual.

**Dashboard del cliente:**
```
Header: "Bienvenido, [Nombre]" | Última visita | Botón "Cerrar sesión"

Cards resumen:
  [Mis pedidos activos]  [Facturas pendientes $USD]  [Mis puntos de referido]

Secciones:
  → Mis pedidos recientes (con estado y trackeo)
  → Mis facturas (estado de pago, descargar PDF)
  → Mis cotizaciones pendientes
  → Mi código de referido (compartir)
  → Mis vehículos registrados
  → Productos recomendados basados en mi historial
```

---

## FASE 3 — DASHBOARD EJECUTIVO ADMIN (MÓDULO 2)

### PASO 3.1 — LAYOUT DEL ADMIN (rankoparts.com/admin)

Genera `app/(admin)/layout.tsx` — el shell del panel interno.

**Sidebar izquierdo (colapsable):**
```
Fondo: negro puro #000000
Logo Ranko Parts en la parte superior (dorado)
Ancho expandido: 260px | Colapsado: 68px (solo íconos)

Navegación agrupada:
  ─ OVERVIEW ─
  📊 Dashboard
  
  ─ VENTAS ─
  👥 CRM / Pipeline
  👤 Clientes
  📋 Cotizaciones
  🧾 Facturación
  
  ─ FINANZAS ─
  💰 Panel de Deudas
  💳 Pagos
  ⚠️  Alertas Anómalas      ← (MASTER_ADMIN y ADMIN only)
  
  ─ OPERACIONES ─
  📦 Inventario
  🚚 Órdenes / Despacho
  🛒 E-Commerce
  
  ─ INTELIGENCIA ─
  📈 Reportes / BI
  🤖 Automatización
  
  ─ SISTEMA ─
  🔗 Referidos
  👤 Usuarios
  🔒 Logs Auditoría      ← (MASTER_ADMIN ONLY — visible solo para ese rol)
  ⚙️  Configuración

Footer del sidebar: avatar del usuario logueado + nombre + rol + botón logout
```

**Navbar superior:**
```
Izquierda: Botón colapsar sidebar | Breadcrumb de navegación
Centro: Buscador global (clientes, facturas, productos por ID o nombre)
Derecha: 
  🔔 Campana de notificaciones (badge con número de alertas sin leer)
  💬 Indicador de leads sin atender
  Avatar del usuario
```

### PASO 3.2 — BILLING EN VIVO (rankoparts.com/admin)

Genera `app/(admin)/admin/page.tsx` — el dashboard principal.

**Bloque superior — KPIs en tiempo real (Supabase Realtime):**
```tsx
// 4 cards en grid horizontal — actualización en tiempo real
<KPICard label="HOY"         value={ventasHoy}    delta="+12%" trend="up" />
<KPICard label="ESTA SEMANA" value={ventasSemana}  delta="+8%"  trend="up" />
<KPICard label="ESTE MES"    value={ventasMes}     delta="+34%" trend="up" />
<KPICard label="META DEL MES" value={metaMes} progreso={61} />
```

Estilo de los KPI cards:
- Fondo `#1C1C1C`, borde izquierdo dorado `#F5C518`
- Número grande en blanco (JetBrains Mono)
- Delta en verde si positivo, rojo si negativo
- La card de META muestra barra de progreso dorada

**Bloque centro — Feed de ventas en vivo:**
```tsx
// Se actualiza en tiempo real con Supabase Realtime
// Cada nueva factura aparece en la parte superior con animación slide-in
// Máximo 10 filas visibles, scroll para ver más
[timestamp] [N° Factura] [Cliente] [Producto/Descripción] [$ Monto]
```

**Bloque derecho — Desglose por canal (dona animada):**
```
B2C vs B2B vs Distribuidor
Recharts PieChart con colores: dorado / blanco / gris
```

**Alertas de meta:**
```tsx
// Toast automático al alcanzar 50%, 80%, 100%
// Alerta roja si proyección del mes < 70% de la meta
```

**Fila inferior — Widgets del dashboard:**
```
Widget 1: Pipeline activo — N leads por etapa (barra horizontal)
Widget 2: ⚠️ Leads sin atender > 2h — contador rojo urgente
Widget 3: 📦 Stock bajo mínimo — N productos en alerta
Widget 4: 💰 Facturas vencidas hoy — monto total
Widget 5: 🔝 Top 5 productos del mes
Widget 6: 🔝 Top 5 clientes del mes
Widget 7: Tasa de conversión semanal (gauge circular)
Widget 8: ⚠️ Pagos anómalos pendientes de revisión — (ADMIN+)
```

---

## FASE 4 — CRM PREMIUM (MÓDULO 3)

### PASO 4.1 — PIPELINE KANBAN (rankoparts.com/admin/crm)

Genera el pipeline de ventas visual con drag & drop (usando @dnd-kit/core).

**Columnas configurables:**
```
[NUEVO] → [CALIFICANDO] → [COTIZADO] → [EN NEGOCIACIÓN] → [CIERRE PENDIENTE] → [✓ CERRADO]
```

Cada tarjeta de lead muestra:
- Nombre del cliente + tipo badge (B2C / Taller / Distribuidor)
- Valor estimado en USD (prominente, JetBrains Mono)
- Temperatura: 🔴 Caliente / 🟡 Tibio / 🔵 Frío
- Avatar del vendedor asignado
- Tiempo en esta etapa ("hace 2h", "3 días")
- ⚠️ Borde rojo si lleva > 48h sin actividad
- Próxima acción programada

Barra de métricas encima del Kanban:
```
Total en pipeline: $XX,XXX USD | Leads totales: N | Conversión: XX% | Ciclo promedio: X días
```

### PASO 4.2 — FICHA DE CLIENTE 360° (rankoparts.com/admin/clientes/[id])

5 pestañas completas:

**Pestaña Resumen:**
- Header: nombre, empresa, tipo, ciudad, scoring visual (barra 0-100 con color)
- Semáforo de crédito: 🟢 Al día / 🟡 Atención / 🔴 Bloqueado
- KPIs rápidos: Total comprado lifetime | Ticket promedio | Última compra | Frecuencia
- Próxima acción recomendada
- Botones rápidos: Nueva cotización | Registrar pago | Enviar WhatsApp | Agendar seguimiento

**Pestaña Historial Comercial:**
- Tabla de cotizaciones + facturas ordenadas por fecha
- Monto acumulado por período (barras mensuales)
- Productos más comprados

**Pestaña Comunicaciones:**
- Timeline de interacciones (WhatsApp, Email, Llamada, Nota, etc.)
- Formulario inline para agregar nueva interacción

**Pestaña Vehículos:**
- Listado de vehículos registrados
- Botón "Agregar vehículo"
- Por cada vehículo: productos compatibles recomendados

**Pestaña Deudas:**
- Facturas pendientes con antigüedad (0-30 / 31-60 / 61-90 / +90 días)
- Total adeudado en USD
- Botón "Enviar recordatorio WhatsApp" (dispara secuencia automática)
- Botón "Bloquear cliente" (requiere ADMIN+)

---

## FASE 5 — FACTURACIÓN AUTOMATIZADA (MÓDULO 5)

### PASO 5.1 — GENERADOR DE COTIZACIONES

Flujo en `app/(admin)/admin/cotizaciones/nueva/page.tsx`:

1. **Buscar cliente** — autocomplete con nombre/teléfono/empresa
2. **Lista de precios automática** según tipo de cliente:
   ```
   Lista 1 (Minorista):             precio base 100%
   Lista 2 (Taller):                precio base − 8%
   Lista 3 (Distribuidor Local):    precio base − 15%
   Lista 4 (Distribuidor Regional): precio base − 20%
   Lista 5 (VIP):                   precio especial configurado por ADMIN
   ```
3. **Agregar productos** — búsqueda por SKU / nombre / código OEM / compatibilidad
4. **Aplicar descuentos adicionales** — con límite por rol:
   - Vendedor: máximo 5% adicional sin aprobación
   - Admin: hasta 15%
   - Master Admin: sin límite
5. **Preview del documento** con logo Ranko Parts (negro + dorado)
6. **Acciones:** Guardar borrador | Enviar por WhatsApp | Enviar por Email | Convertir a Factura

### PASO 5.2 — GENERADOR DE FACTURAS PDF

Genera `components/facturacion/FacturaPDF.tsx` con @react-pdf/renderer:

**Diseño del PDF:**
```
Header: Logo Ranko Parts (dorado/negro) | "FACTURA" en grande | N° FAC-XXXX
Datos Ranko Parts: RIF, dirección Caracas/Lechería, WhatsApp
Datos cliente: Nombre, empresa, RIF, dirección
Tabla de productos: SKU | Descripción | Cant. | Precio Unit. | Descuento | Total
Totales: Subtotal | Descuento total | Impuesto | TOTAL USD (prominente)
Métodos de pago: Zelle / Transferencia / datos bancarios
QR code: link rankoparts.com/orden/[codigo] para trackeo
Footer: Términos, gracias, Instagram @ranko_parts
```

---

## FASE 6 — PANEL DE DEUDAS + ALERTAS ANÓMALAS (MÓDULO 6)

### PASO 6.1 — PANEL DE DEUDAS (rankoparts.com/admin/deudas)

**Cards resumen superiores:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ CARTERA TOTAL │ │   0 – 30d   │ │   31 – 60d  │ │   +90d 🔴   │
│   $24,800    │ │   $12,400   │ │    $8,200   │ │   $4,200    │
│  42 facturas │ │  21 clientes│ │ 14 clientes │ │ 7 URGENTES  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Tabla de deudas:**
- Columnas: Cliente | Empresa | Tipo | Total adeudado | Facturas | Antigüedad | Semáforo | Acciones
- Filtros: Por antigüedad / vendedor / tipo de cliente / zona / estado
- Semáforo: 🟢 0-30d / 🟡 31-60d / 🔴 +60d
- Acciones por fila:
  - "📱 WhatsApp" → abre modal con mensaje pre-armado
  - "👁 Ver facturas" → lista de facturas de ese cliente
  - "💳 Registrar pago" → formulario de pago
  - "🚫 Bloquear" → requiere ADMIN+

**Bloqueo automático:**
Cuando el saldo vencido de un cliente supera el umbral configurado en Settings,
el sistema bloquea automáticamente la creación de nuevas cotizaciones para ese cliente
y muestra alerta al vendedor al intentar crear una.

### PASO 6.2 — GESTIÓN DE PAGOS (rankoparts.com/admin/pagos)

**Registro manual de pago:**
```
1. Buscar factura (por número o por cliente)
2. Ingresar: Monto | Método (Zelle/Transferencia/Efectivo) | Referencia | Subir comprobante
3. Sistema verifica automáticamente:
   → ¿El monto coincide con el saldo pendiente? → Pago completo ✅
   → ¿El monto es menor? → Pago parcial ⚠️ (actualiza saldo)
   → ¿La referencia ya fue registrada antes? → POSIBLE DUPLICADO 🚨
4. Registro en logs con timestamp
5. Notificación automática al cliente (opcional)
```

### PASO 6.3 — ALERTAS DE PAGOS ANÓMALOS (rankoparts.com/admin/pagos — sección alertas)

**¿Cuándo se genera una alerta de pago anómalo?**
El sistema en `lib/anomalias.ts` evalúa cada pago registrado contra estas reglas:

```typescript
const REGLAS_ANOMALIA = [
  {
    id: 'MONTO_INUSUAL',
    descripcion: 'Monto significativamente mayor o menor al promedio del cliente',
    umbral: '200% del ticket promedio del cliente O menos del 10% del saldo',
    prioridad: 'ALTA'
  },
  {
    id: 'REFERENCIA_DUPLICADA',
    descripcion: 'Número de referencia Zelle/transferencia ya registrado antes',
    umbral: 'Coincidencia exacta del campo referencia',
    prioridad: 'CRITICA'
  },
  {
    id: 'CLIENTE_CON_HISTORIAL_FRAUDE',
    descripcion: 'Cliente con pagos rechazados previos intenta registrar pago',
    umbral: '1 pago rechazado en últimos 90 días',
    prioridad: 'ALTA'
  },
  {
    id: 'PAGO_FUERA_HORARIO',
    descripcion: 'Pago registrado fuera del horario laboral habitual',
    umbral: 'Antes de 7am o después de 10pm hora Venezuela',
    prioridad: 'MEDIA'
  },
  {
    id: 'MULTIPLES_PAGOS_MISMO_DIA',
    descripcion: 'Mismo cliente con más de 3 pagos registrados en el mismo día',
    umbral: 'N > 3 pagos/día por cliente',
    prioridad: 'MEDIA'
  },
  {
    id: 'DESCUENTO_FUERA_RANGO',
    descripcion: 'Descuento aplicado supera el límite del rol del vendedor',
    umbral: '>5% para Vendedor, >15% para Admin sin aprobación MASTER',
    prioridad: 'ALTA'
  }
]
```

**Dashboard de alertas anómalas** (visible para ADMIN y MASTER_ADMIN):
```
Tabla de alertas activas:
  Timestamp | Tipo de anomalía | Cliente | Monto | Registrado por | Estado | Acciones

Acciones por alerta:
  ✅ "Aprobar — es correcto" → limpia la alerta, confirma el pago
  ❌ "Rechazar pago" → revierte el pago, notifica al equipo
  👁 "Investigar" → marca para revisión, escala a MASTER_ADMIN

Notificación push/email automática al MASTER_ADMIN para anomalías CRITICAS.
```

---

## FASE 7 — LOGS DE FACTURACIÓN MASTER ADMIN (MÓDULO 7)

Genera `app/(admin)/admin/logs/page.tsx` — visible exclusivamente para MASTER_ADMIN.

**Características de los logs:**
- Registro **inmutable** — ningún usuario puede editar ni borrar logs
- Firma digital SHA-256 en cada entrada (garantía criptográfica de integridad)
- Cada log incluye: usuario, IP, timestamp exacto, datos antes/después (diff)

**Acciones registradas automáticamente:**
```
CREAR/MODIFICAR/ANULAR_FACTURA
CREAR/MODIFICAR/CONVERTIR_COTIZACION
APLICAR_DESCUENTO (monto %, usuario que aprobó)
CAMBIAR_PRECIO (precio anterior vs nuevo)
REGISTRAR/REVERTIR_PAGO
MARCAR_ANOMALIA
```

**Alertas automáticas al MASTER_ADMIN:**
- Descuento > 15% aplicado sin aprobación
- Más de 2 anulaciones el mismo día por el mismo usuario
- Factura modificada > 24h después de emitida
- Precio cambiado después de enviar cotización al cliente

**Filtros del panel de logs:**
- Por usuario | Por acción | Por fecha/rango | Por documento | Por monto involucrado

**Exportación:**
- CSV firmado digitalmente para auditoría contable externa

---

## FASE 8 — INVENTARIO MULTI-ALMACÉN (MÓDULO 8)

Genera el panel de inventario con:

**Vista principal:**
```
Tabs: [Todos los almacenes] [Caracas] [Lechería]
Tabla: SKU | Producto | Stock actual | Mínimo | Máximo | Clasificación ABC | Estado | Acciones
Badges de estado: 🟢 OK / 🟡 Bajo mínimo / 🔴 Agotado
```

**Clasificación ABC automática** (recalculada mensualmente):
```
A: Productos que representan 70-80% del valor vendido → control diario, stock alto siempre
B: 15-25% del valor → revisión semanal
C: 5% del valor → solo bajo pedido, sin stock fijo
```

**Alertas de reorden:**
Cuando stock < stockMinimo → alerta automática al equipo de almacén + widget en dashboard

**Transferencias entre almacenes:**
- Formulario: Producto | Origen | Destino | Cantidad | Motivo
- Registro en log de movimientos con timestamp y responsable

---

## FASE 9 — BUSINESS INTELLIGENCE (MÓDULO 9)

Genera `app/(admin)/admin/reportes/page.tsx` con todos los reportes:

**Reportes disponibles:**

```
1. P&L MENSUAL (Estado de Resultados)
   Ingresos totales | COGS | Utilidad Bruta | Gastos operativos | EBITDA | Margen %
   → Exportar PDF ejecutivo

2. VENTAS POR PERÍODO
   Por día/semana/mes | Por vendedor | Por zona (Caracas/Lechería/Online)
   Por categoría de producto | Por tipo de cliente

3. ANÁLISIS DE CARTERA
   Distribución por tipo de cliente | CLV estimado | Segmentación RFM
   (Recency, Frequency, Monetary)

4. ROTACIÓN DE INVENTARIO
   Días de inventario por producto | Productos en riesgo de vencimiento
   Sugerencia de reorden basada en histórico

5. PIPELINE Y CONVERSIÓN
   Tasa de conversión por etapa | Por vendedor | Por fuente de lead
   Tiempo promedio de ciclo de venta

6. RECOMPRA Y RETENCIÓN
   Clientes recurrentes | Frecuencia de recompra | Tasa de abandono
   Clientes en riesgo de churn (sin compra en 90+ días)

7. ROI DE MARKETING
   Inversión en ads vs leads generados vs ventas cerradas

8. FORECAST 30/60/90 DÍAS
   Proyección basada en pipeline actual + histórico
```

Todos los reportes con:
- Gráficos interactivos (Recharts)
- Exportar PDF ejecutivo
- Exportar Excel detallado
- Programar envío automático por email

---

## FASE 10 — E-COMMERCE (MÓDULO 10)

### Gestión interna (rankoparts.com/admin/ecommerce):
- Gestionar productos destacados, precios, stock visible
- Ver pedidos online con estado y asignar a almacén para despacho
- Configurar banners, promociones y ofertas

### Tienda pública (rankoparts.com/tienda):
Mejoras sobre la tienda WooCommerce actual:
- **Buscador de compatibilidad** (Marca/Modelo/Año/Sistema) — el gran diferenciador
- Filtros por categoría, marca, precio, disponibilidad
- Cards de producto con: imagen, nombre, precio USD, badge de stock, botón WhatsApp
- Página de producto: galería, compatibilidades, descripción técnica, productos relacionados
- Carrito y checkout: datos comprador + método de pago (Zelle/Transferencia/Efectivo)
- Confirmación automática por WhatsApp al cliente

---

## FASE 11 — TRACKEO DE ÓRDENES (MÓDULO 11)

**Vista pública** (rankoparts.com/orden/RP-0001):
```
Timeline visual:
✅ Pedido confirmado — [fecha/hora]
📦 En preparación  — [fecha/hora]
🚚 En camino       — [fecha/hora] — estimado: hoy 2-5pm
⏳ Entregado       — pendiente

Sin login requerido — acceso por código único
```

**Notificaciones WhatsApp automáticas al cambiar estado:**
```
"✅ Tu pedido #RP-0891 de Ranko Parts fue confirmado. Lo tendrás listo en 24h."
"📦 Tu pedido está siendo preparado. Te avisamos cuando salga."
"🚚 ¡Tu pedido va en camino! Estimado de entrega: hoy entre 2-5pm."
"✅ Tu pedido fue entregado. ¡Gracias por confiar en Ranko Parts! @ranko_parts"
```

**Panel interno de despacho** (rankoparts.com/admin/ordenes):
- Todas las órdenes activas con estado actual
- Filtro por estado | almacén | fecha | responsable
- Botón "Actualizar estado" con campo de nota
- Alerta si una orden lleva > 8h sin actualización

---

## FASE 12 — AUTOMATIZACIÓN OMNICANAL (MÓDULO 12)

Genera el motor de secuencias en `app/(admin)/admin/automatizacion/page.tsx`:

**4 secuencias pre-configuradas (editables desde el panel):**

```
SECUENCIA 1 — LEAD NUEVO (WhatsApp)
  → T+0:    Mensaje bienvenida + calificación automática
  → T+2h:   Si no respondió → Seguimiento suave
  → T+24h:  Segundo seguimiento con valor adicional
  → T+48h:  Último contacto — cierre o archivar

SECUENCIA 2 — COTIZACIÓN ENVIADA
  → T+0:    Confirmación de envío
  → T+3d:   Recordatorio + oferta de resolver dudas
  → T+7d:   Alternativa de producto o ajuste de precio
  → T+14d:  Archivar en CRM si no hay respuesta

SECUENCIA 3 — RECOMPRA (basada en historial)
  → T+90d post-compra: "Es momento de tu próximo cambio de aceite"
              (mensaje personalizado con nombre del producto comprado)
  → T+7d:   Recordatorio si no respondió

SECUENCIA 4 — DEUDA VENCIDA
  → Día 1:  Recordatorio amable con monto exacto
  → Día 7:  Segundo aviso — menciona política de crédito
  → Día 15: Aviso de suspensión de crédito
  → Día 30: Alerta al equipo para gestión manual directa
```

**Panel de gestión:**
- Activar/pausar cada secuencia
- Editar mensajes template con variables ({nombre}, {producto}, {monto}, {fecha})
- Ver métricas: enviados / abiertos / respondidos / conversiones
- Historial de mensajes enviados por cliente

---

## FASE 13 — SISTEMA DE REFERIDOS (MÓDULO 13)

**Para el cliente** (rankoparts.com/cliente/referidos):
```
Mi código único: RANKO-[XXXXX]
Copiar link: rankoparts.com/?ref=RANKO-XXXXX
Mis referidos: tabla con estado de cada empresa que referí
Mis beneficios: meses de descuento ganados, créditos disponibles
```

**Panel interno** (rankoparts.com/admin/referidos):
- Lista de todos los referidos activos y pendientes
- Validar activación (3 meses completados)
- Aplicar beneficio automáticamente en la siguiente factura del cliente referidor
- Métricas: total referidos / tasa de activación / valor generado por el programa

---

## INSTRUCCIONES GENERALES DE CODEX

### Estilo de código:
- TypeScript estricto (`strict: true` en tsconfig)
- Componentes funcionales + hooks custom — sin class components
- Separar lógica (hooks) de presentación (componentes UI)
- Manejo de errores en todos los endpoints (try/catch + respuestas tipadas)
- Loading states + skeleton loaders en todos los componentes con datos
- Error boundaries en secciones críticas

### Design System (aplicar en TODO el proyecto):
```css
/* Variables CSS globales en globals.css */
:root {
  --color-base:        #000000;   /* Negro puro — fondos del admin */
  --color-surface:     #111111;   /* Superficies del sidebar */
  --color-card:        #1C1C1C;   /* Cards del dashboard */
  --color-gold:        #F5C518;   /* Acento primario dorado */
  --color-gold-hover:  #FFD700;   /* Hover del dorado */
  --color-gold-muted:  #D4A017;   /* Dorado más oscuro */
  --color-white:       #FFFFFF;
  --color-gray-light:  #F4F5F7;   /* Fondos secciones públicas */
  --color-danger:      #E53E3E;
  --color-success:     #38A169;
  --color-border:      #2A2A2A;   /* Bordes en el admin oscuro */
  
  --font-display: 'Bebas Neue', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

### Sidebar del Admin — especificaciones de diseño:
```
- Fondo: var(--color-surface) → #111111
- Items hover: var(--color-card) → #1C1C1C con borde izquierdo dorado
- Item activo: borde izquierdo dorado 3px + texto dorado + fondo #1C1C1C
- Texto normal: #888888 (gris)
- Texto hover/activo: #FFFFFF (blanco)
- Ícono activo: color dorado #F5C518
- Badge de notificación: fondo rojo #E53E3E, texto blanco
- Footer del sidebar: separador, avatar, nombre, rol en dorado, logout
```

### Tablas — especificaciones:
- Todas las tablas con: sorting por columna, filtro global, paginación (20/página)
- Fondo de header: #111111 | Filas: #000000 y #0A0A0A alternadas
- Hover de fila: #1C1C1C
- Usar @tanstack/react-table para todas las tablas del admin

### Responsividad:
- Mobile-first para la web pública (clientes acceden desde el móvil)
- El admin puede priorizar desktop pero debe ser funcional en tablet
- WhatsApp floating button visible en todas las páginas públicas

### Seguridad:
- Proxy/Auth.js en todas las rutas /admin/* y /cliente/*
- Validación de rol en cada API route (no confiar solo en el frontend)
- Sanitización con Zod en todos los inputs del usuario
- Rate limiting en endpoints públicos (cotizaciones, contacto)
- Logs de todas las acciones sensibles (automático via middleware)

---

## ORDEN DE CONSTRUCCIÓN

```
Semana 1-2:   Setup + Schema BD + Auth (2 tipos de usuario) + Layout Admin
Semana 3-4:   Landing Page rediseñada + Portal del cliente básico
Semana 5-6:   Dashboard Ejecutivo + Billing en Vivo (Supabase Realtime)
Semana 7-8:   CRM + Pipeline Kanban + Ficha Cliente 360°
Semana 9-10:  Facturación + Cotizaciones + PDF Generation
Semana 11:    Panel de Deudas + Gestión de Pagos + Alertas Anómalas
Semana 12:    Logs de Facturación (Master Admin)
Semana 13:    Inventario Multi-almacén + ABC
Semana 14:    E-Commerce (Tienda pública mejorada + gestión interna)
Semana 15:    Trackeo de Órdenes (interno + portal cliente + público)
Semana 16:    Business Intelligence + Reportes
Semana 17:    Automatización WhatsApp/Email
Semana 18:    Sistema de Referidos + Portal Cliente completo
Semana 19:    Panel de Admin (usuarios, roles, configuración)
Semana 20:    QA completo + Deploy a rankoparts.com + migración de datos de WooCommerce
```

---

## COMANDO PARA COMENZAR

Una vez que hayas procesado todo este contexto, responde SOLO con:

**"✅ Contexto Ranko Parts cargado. Sistema: Next.js latest estable (16+) + TypeScript + Supabase + Prisma.
Paleta: Negro #000000 + Dorado #F5C518. 16 módulos identificados. 20 semanas de construcción.
Listo para el Paso 1.1 — ¿Arrancamos con el setup inicial del proyecto?"**

Luego espera mi confirmación. Construimos módulo por módulo — código completo y funcional,
nunca pseudocódigo, nunca placeholders. Cada módulo conecta con los anteriores.

---

*Documento generado para uso exclusivo de Ranko Parts — Plan Enterprise SaaS*
*Referencia: PROP-RP-2026-001 | Versión 2.0 | Mayo 2026 | Confidencial*
