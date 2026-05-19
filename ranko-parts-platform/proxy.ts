import { auth } from "@/auth";
import { esRolEquipo } from "@/lib/roles";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const rol = session?.user?.rol;

  if (pathname.startsWith("/api/admin")) {
    if (!esRolEquipo(rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login/equipo", request.url));
    }

    if (!esRolEquipo(rol)) {
      return NextResponse.redirect(new URL("/cliente", request.url));
    }
  }

  if (pathname.startsWith("/cliente")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login/cliente", request.url));
    }

    if (rol !== "CLIENTE") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/cliente/:path*", "/api/admin/:path*"],
};
