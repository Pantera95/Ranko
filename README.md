# Ranko SAAS — Web

Monorepo del ecosistema digital de **Ranko Parts** — plataforma de venta de repuestos automotrices 4x4, SUVs, coupés, aceites y lubricantes premium.

🌐 **Producción:** https://ranko-saas-web.vercel.app

---

## 📁 Contenido del repo

| Proyecto | Descripción | Stack |
|---|---|---|
| **[`ranko-parts-platform/`](./ranko-parts-platform/)** | E-commerce público + SaaS interno + Portal cliente | Next.js 16, Prisma, PostgreSQL, NextAuth v5 |
| `retro-quest-vault/` | Proyecto secundario (no relacionado) | — |

---

## 🚀 Ranko Parts Platform — Resumen ejecutivo

### ¿Qué es?

Una plataforma full-stack que combina **3 productos en uno**:

1. **🌐 E-commerce público** — catálogo navegable, búsqueda por compatibilidad (marca/modelo/año), consulta directa por WhatsApp
2. **🛠 SaaS interno (Admin)** — CRM, cotizaciones, facturación, inventario multi-almacén, pagos, deudas, alertas, BI
3. **👤 Portal del cliente** — vista 360 del cliente con cotizaciones, facturas, pedidos, vehículos y referidos

### Funcionalidades destacadas

- **Pipeline CRM** con kanban drag-and-drop (NUEVO → COTIZADO → VENTA_CERRADA)
- **Cotización → Factura** con conversión atómica y deducción de stock por almacén
- **Sistema de pagos** con detección automática de anomalías (referencias duplicadas, montos > saldo, facturas vencidas)
- **Verificación cliente-reportada** de pagos desde el portal (cola de aprobación admin)
- **Alertas operacionales** con CTAs deep-link (verificar pago, ver facturas vencidas, ajustar stock)
- **Inventario multi-almacén** con auto-seed al crear productos
- **Compatibilidad vehículo ↔ producto** editable desde ambos lados
- **Audit log inmutable** con firma HMAC en cada operación crítica
- **Roles**: MASTER_ADMIN, ADMIN, VENDEDOR, ALMACEN, VIEWER, CLIENTE
- **WhatsApp Business webhook** para captura inbound + auto-tracking de leads
- **Auto-deploy** desde GitHub → Vercel

### Stack técnico

```
Frontend:  Next.js 16 (App Router + Turbopack) + Tailwind v4 + TypeScript
Backend:   Next.js API Routes + NextAuth v5 (Auth.js) + Prisma 7
DB:        PostgreSQL (Supabase compatible)
Auth:      JWT + bcryptjs + role-based
Hosting:   Vercel (auto-deploy desde main)
Fuentes:   next/font/google (Syncopate + Inter + Space Mono)
Validación: Zod
```

### Sistema de diseño

Inspirado en estética industrial 4x4 / lubricantes premium:

- **Fuente display** Syncopate (kinetic, wide stance — evoca máquina/velocidad)
- **Color primario** Gold #f5c518 sobre dark stage
- **Patrones**: blueprint grids, radial halos, watermark numbering, gold glow CTAs
- **Accesible**: WCAG 2.4.7 focus rings, prefers-reduced-motion, ARIA roles

---

## 🔑 Acceso demo

5 cuentas demo funcionan sin necesidad de DB (también en producción mientras `DISABLE_DEMO_LOGIN` no esté seteada):

### Admin → [/login/equipo](https://ranko-saas-web.vercel.app/login/equipo)

| Email | Password | Rol |
|---|---|---|
| `admin@rankoparts.com` | `RankoAdmin2026!` | MASTER_ADMIN |
| `vendedor@rankoparts.com` | `RankoVendedor2026!` | VENDEDOR |
| `almacen@rankoparts.com` | `RankoAlmacen2026!` | ALMACEN |
| `viewer@rankoparts.com` | `RankoViewer2026!` | VIEWER |

### Cliente → [/login/cliente](https://ranko-saas-web.vercel.app/login/cliente)

| Email | Password | Rol |
|---|---|---|
| `cliente@rankoparts.com` | `RankoCliente2026!` | CLIENTE |

---

## 🛠 Setup rápido

```bash
git clone https://github.com/Pantera95/Ranko-SAAS---Web.git
cd Ranko-SAAS---Web/ranko-parts-platform

npm install

# Configura .env (ver ranko-parts-platform/README.md)

npx prisma generate
npm run db:push
npm run db:seed       # opcional

npm run dev
# → http://localhost:3000
```

---

## 📚 Documentación

| Archivo | Para qué sirve |
|---|---|
| **[ranko-parts-platform/README.md](./ranko-parts-platform/README.md)** | Documentación principal — setup, env vars, endpoints, deploy |
| **[ranko-parts-platform/MANUAL.md](./ranko-parts-platform/MANUAL.md)** | Manual técnico para devs — arquitectura, patrones, gotchas, cómo extender |

Lee primero el README, después el MANUAL si necesitas profundizar.

---

## 🎯 Cómo replicar este proyecto

Ver `ranko-parts-platform/README.md` § *Setup local*. En resumen:

1. **Node.js 20+** y **PostgreSQL 14+**
2. Crea cuenta en **Supabase** o **Neon** (tier gratis) para tu DB
3. Clona el repo y configura `.env`
4. `npm install && npm run db:push && npm run db:seed && npm run dev`
5. Para deploy: conecta el repo a **Vercel** y configura env vars (lista en el README)

---

## 📋 Estructura general

```
Ranko-SAAS---Web/
├── ranko-parts-platform/        # ← Aplicación principal (Next.js)
│   ├── app/                     # App Router (público + /admin + /cliente)
│   ├── components/              # React components
│   ├── lib/                     # Helpers + data fetchers
│   ├── prisma/                  # Schema + seed
│   ├── api/                     # API routes (44+ endpoints)
│   ├── auth.ts                  # NextAuth config
│   ├── proxy.ts                 # Middleware de rutas
│   ├── README.md                # 📖 Docs principales
│   └── MANUAL.md                # 🔧 Docs técnicos
│
├── retro-quest-vault/           # Proyecto secundario
└── README.md                    # ← Estás aquí
```

---

## 🤝 Contribuir

1. Fork del repo
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

**Antes de hacer push a main**:
```bash
cd ranko-parts-platform
npm run typecheck && npm run lint && npm run build
```

---

## 📜 Licencia

Proprietary © Ranko Parts 2026. All rights reserved.

---

## 🔗 Enlaces

- **App en producción**: https://ranko-saas-web.vercel.app
- **Vercel dashboard**: https://vercel.com/pantera95s-projects/ranko-saas-web
- **GitHub**: https://github.com/Pantera95/Ranko-SAAS---Web
- **Contacto WhatsApp**: +58 414-7903498
- **Instagram**: @ranko_parts
