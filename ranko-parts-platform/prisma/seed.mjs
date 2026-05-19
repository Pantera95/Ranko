import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@rankoparts.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "RankoAdmin2026!";
const clientEmail = process.env.SEED_CLIENT_EMAIL || "cliente@rankoparts.com";
const clientPassword = process.env.SEED_CLIENT_PASSWORD || "RankoCliente2026!";

async function main() {
  const [adminPasswordHash, clientPasswordHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(clientPassword, 12),
  ]);

  const masterAdmin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      nombre: "Master Admin Ranko",
      rol: "MASTER_ADMIN",
      activo: true,
      passwordHash: adminPasswordHash,
    },
    create: {
      nombre: "Master Admin Ranko",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      rol: "MASTER_ADMIN",
      telefono: "+58 414-7903498",
      territorio: "Venezuela",
    },
  });

  const clienteUsuario = await prisma.usuario.upsert({
    where: { email: clientEmail },
    update: {
      nombre: "Cliente Demo Ranko",
      rol: "CLIENTE",
      activo: true,
      passwordHash: clientPasswordHash,
    },
    create: {
      nombre: "Cliente Demo Ranko",
      email: clientEmail,
      passwordHash: clientPasswordHash,
      rol: "CLIENTE",
      telefono: "+58 414-7903498",
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: { codigoReferido: "RANKO-DEMO" },
    update: {
      nombre: "Cliente Demo",
      email: clientEmail,
      usuarioId: masterAdmin.id,
      usuarioPortalId: clienteUsuario.id,
    },
    create: {
      nombre: "Cliente Demo",
      empresa: "Taller Demo Caracas",
      tipo: "TALLER",
      telefono: "+58 414-7903498",
      whatsapp: "+58 414-7903498",
      email: clientEmail,
      ciudad: "Caracas",
      direccion: "Caracas, Venezuela",
      rif: "J-00000000-0",
      condicionPago: "Credito 30d",
      limiteCredito: "1500.00",
      scoring: 78,
      fuente: "DIRECTO",
      codigoReferido: "RANKO-DEMO",
      usuarioId: masterAdmin.id,
      usuarioPortalId: clienteUsuario.id,
    },
  });

  await prisma.vehiculo.upsert({
    where: { id: "vehiculo-demo-grand-cherokee" },
    update: {},
    create: {
      id: "vehiculo-demo-grand-cherokee",
      clienteId: cliente.id,
      marca: "Jeep",
      modelo: "Grand Cherokee",
      anio: 2014,
      motor: "3.6L V6",
      color: "Negro",
    },
  });

  const caracas = await prisma.almacen.upsert({
    where: { id: "almacen-caracas" },
    update: { nombre: "Principal Caracas", ciudad: "Caracas", activo: true },
    create: {
      id: "almacen-caracas",
      nombre: "Principal Caracas",
      ciudad: "Caracas",
      direccion: "Caracas, Venezuela",
      responsable: "Equipo Ranko Parts",
    },
  });

  const producto = await prisma.producto.upsert({
    where: { sku: "LM-5W40-001" },
    update: {
      nombre: "Liqui-Moly 5W-40 Sintetico",
      precio: "48.00",
      costo: "34.00",
      activo: true,
      destacado: true,
    },
    create: {
      sku: "LM-5W40-001",
      nombre: "Liqui-Moly 5W-40 Sintetico",
      descripcion: "Lubricante premium para motores de alto desempeno.",
      categoria: "Aceites",
      subcategoria: "Motor",
      marca: "Liqui-Moly",
      precio: "48.00",
      costo: "34.00",
      imagenes: [],
      slug: "liqui-moly-5w40-sintetico",
      destacado: true,
      compatibilidades: {
        create: {
          marca: "Jeep",
          modelo: "Grand Cherokee",
          anioDesde: 2011,
          anioHasta: 2020,
          motor: "3.6L V6",
          sistema: "Motor",
        },
      },
    },
  });

  await prisma.inventario.upsert({
    where: {
      productoId_almacenId: {
        productoId: producto.id,
        almacenId: caracas.id,
      },
    },
    update: {
      cantidad: 24,
      stockMinimo: 6,
      stockMaximo: 60,
      clasificacion: "A",
    },
    create: {
      productoId: producto.id,
      almacenId: caracas.id,
      cantidad: 24,
      stockMinimo: 6,
      stockMaximo: 60,
      ubicacion: "A-01",
      clasificacion: "A",
    },
  });

  const filtro = await prisma.producto.upsert({
    where: { sku: "KN-33-2457" },
    update: {
      nombre: "K&N Filtro Alto Flujo",
      precio: "72.00",
      costo: "49.00",
      activo: true,
      destacado: true,
    },
    create: {
      sku: "KN-33-2457",
      nombre: "K&N Filtro Alto Flujo",
      descripcion: "Filtro reutilizable de alto flujo para motores Jeep y Dodge.",
      categoria: "Filtros",
      subcategoria: "Aire",
      marca: "K&N",
      precio: "72.00",
      costo: "49.00",
      imagenes: [],
      slug: "kn-filtro-alto-flujo-jeep-dodge",
      destacado: true,
      compatibilidades: {
        create: [
          {
            marca: "Jeep",
            modelo: "Wrangler",
            anioDesde: 2012,
            anioHasta: 2018,
            motor: "3.6L V6",
            sistema: "Filtros",
          },
          {
            marca: "Dodge",
            modelo: "Charger",
            anioDesde: 2011,
            anioHasta: 2020,
            motor: "3.6L V6",
            sistema: "Filtros",
          },
        ],
      },
    },
  });

  await prisma.inventario.upsert({
    where: {
      productoId_almacenId: {
        productoId: filtro.id,
        almacenId: caracas.id,
      },
    },
    update: {
      cantidad: 11,
      stockMinimo: 4,
      stockMaximo: 32,
      clasificacion: "B",
    },
    create: {
      productoId: filtro.id,
      almacenId: caracas.id,
      cantidad: 11,
      stockMinimo: 4,
      stockMaximo: 32,
      ubicacion: "B-03",
      clasificacion: "B",
    },
  });

  const frenos = await prisma.producto.upsert({
    where: { sku: "MOP-68191349AC" },
    update: {
      nombre: "Mopar Pastillas Freno Delanteras",
      precio: "118.00",
      costo: "82.00",
      activo: true,
    },
    create: {
      sku: "MOP-68191349AC",
      nombre: "Mopar Pastillas Freno Delanteras",
      descripcion: "Pastillas OEM para tren delantero Jeep Grand Cherokee.",
      categoria: "Frenos",
      subcategoria: "Pastillas",
      marca: "Mopar",
      codigoOEM: "68191349AC",
      precio: "118.00",
      costo: "82.00",
      imagenes: [],
      slug: "mopar-pastillas-freno-delanteras",
      destacado: false,
      compatibilidades: {
        create: {
          marca: "Jeep",
          modelo: "Grand Cherokee",
          anioDesde: 2014,
          anioHasta: 2021,
          sistema: "Frenos",
        },
      },
    },
  });

  await prisma.inventario.upsert({
    where: {
      productoId_almacenId: {
        productoId: frenos.id,
        almacenId: caracas.id,
      },
    },
    update: {
      cantidad: 7,
      stockMinimo: 3,
      stockMaximo: 20,
      clasificacion: "B",
    },
    create: {
      productoId: frenos.id,
      almacenId: caracas.id,
      cantidad: 7,
      stockMinimo: 3,
      stockMaximo: 20,
      ubicacion: "C-02",
      clasificacion: "B",
    },
  });

  console.log("Seed Ranko Parts completado");
  console.log(`Admin: ${masterAdmin.email}`);
  console.log(`Cliente usuario: ${clienteUsuario.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
