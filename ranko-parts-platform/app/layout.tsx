import type { Metadata } from "next";
import { Inter, Space_Mono, Syncopate } from "next/font/google";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

// Brand fonts — "Kinetic Motion" pairing (Syncopate + Space Mono + Inter)
// recommended by ui-ux-pro-max for automotive/high-energy brands. Loaded
// via next/font so they're optimized (preloaded, self-hosted, zero CLS).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});
const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

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
    <html
      lang="es-VE"
      suppressHydrationWarning
      className={`${inter.variable} ${syncopate.variable} ${spaceMono.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
