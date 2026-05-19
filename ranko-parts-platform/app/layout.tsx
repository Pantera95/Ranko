import type { Metadata } from "next";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ranko Parts | Repuestos, lubricantes y plataforma operativa",
  description:
    "Plataforma web y SaaS interno de Ranko Parts para e-commerce, CRM, facturacion, inventario y BI automotriz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-VE" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
