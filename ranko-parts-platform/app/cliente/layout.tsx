import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { ClienteNav } from "@/components/layout/ClienteNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function ClienteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <header
        className="sticky top-0 z-30 px-4 py-4 backdrop-blur sm:px-6"
        style={{
          background: "color-mix(in srgb, var(--bg-surface) 92%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="font-mono text-lg font-black uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Ranko <span style={{ color: "var(--color-gold)" }}>Parts</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-36">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <ClienteNav />
      {children}
    </div>
  );
}
