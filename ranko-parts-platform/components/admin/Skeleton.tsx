import { cn } from "@/lib/utils";

// ─── Base pulse block ─────────────────────────────────────────────────────────

/**
 * Base skeleton block. Uses the gold-shimmer animation defined in globals.css
 * (`.animate-shimmer`) so loading states feel branded instead of generic.
 * Falls back gracefully if reduced-motion is requested (the animation just
 * stops; the gradient remains).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-shimmer rounded", className)}
      style={{ background: "var(--bg-elevated)" }}
    />
  );
}

// ─── Page header skeleton ─────────────────────────────────────────────────────

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <Skeleton className="h-10 w-32 shrink-0" />
    </div>
  );
}

// ─── KPI band skeleton ────────────────────────────────────────────────────────

export function KpiBandSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className={`mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-${cols}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="p-5"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-2 h-2 w-28" />
        </div>
      ))}
    </div>
  );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="mt-6 overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      {/* Header */}
      <div
        className="flex gap-4 px-5 py-3"
        style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={cn("flex-1 h-4", j === 0 ? "w-1/4 flex-[1.5]" : "")} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Card list skeleton ───────────────────────────────────────────────────────

export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="mt-6 grid gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-5"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 grid gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2.5 w-48" />
          </div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Full page skeleton (header + kpis + table) ───────────────────────────────

export function AdminPageSkeleton({ tableRows = 6 }: { tableRows?: number }) {
  return (
    <main className="p-4 sm:p-6">
      <section className="mx-auto max-w-5xl">
        <PageHeaderSkeleton />
        <KpiBandSkeleton />
        <TableSkeleton rows={tableRows} />
      </section>
    </main>
  );
}
