import { auth } from "@/auth";
import { AdminMobileMenu } from "@/components/layout/AdminMobileMenu";
import { AdminSearch } from "@/components/layout/AdminSearch";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getAdminNavCounts } from "@/lib/admin-nav-counts.server";
import { esRolEquipo } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  // Only fetch nav badge counts for team members — a stray CLIENTE session
  // shouldn't trigger admin-scoped queries.
  const counts = esRolEquipo(session?.user?.rol)
    ? await getAdminNavCounts()
    : undefined;

  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <AdminSidebar
        email={session?.user?.email}
        name={session?.user?.name}
        role={session?.user?.rol}
        counts={counts}
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
              counts={counts}
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
            <NotificationsButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
