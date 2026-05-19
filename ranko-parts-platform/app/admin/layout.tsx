import { Bell } from "lucide-react";

import { auth } from "@/auth";
import { AdminMobileMenu } from "@/components/layout/AdminMobileMenu";
import { AdminSearch } from "@/components/layout/AdminSearch";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <AdminSidebar
        email={session?.user?.email}
        name={session?.user?.name}
        role={session?.user?.rol}
      />
      <div className="min-w-0 flex-1">
        <header
          className="sticky top-0 z-30 px-4 py-4 backdrop-blur sm:px-6"
          style={{
            background: "color-mix(in srgb, var(--bg-surface) 90%, transparent)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu — only renders on small screens */}
            <AdminMobileMenu
              email={session?.user?.email}
              name={session?.user?.name}
              role={session?.user?.rol}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-gold)]">
                Panel interno
              </p>
              <h1 className="truncate text-xl font-black uppercase" style={{ color: "var(--text-primary)" }}>
                Ranko Parts
              </h1>
            </div>
            <AdminSearch />
            <ThemeToggle />
            <button
              aria-label="Ver notificaciones"
              className="grid h-10 w-10 place-items-center border transition"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
              type="button"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
