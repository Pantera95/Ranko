import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded", className)}
      style={{ background: "var(--bg-elevated)" }}
    />
  );
}

export function ClientePageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <main className="p-4 sm:p-6" style={{ color: "var(--text-primary)" }}>
      <section className="mx-auto max-w-4xl">
        <Bone className="h-3 w-28" />
        <Bone className="mt-3 h-9 w-44" />
        <Bone className="mt-2 h-3 w-72" />

        <div className={`mt-6 grid gap-3 grid-cols-2 sm:grid-cols-${Math.min(cards, 4)}`}>
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className="p-4"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <Bone className="h-2.5 w-20" />
              <Bone className="mt-3 h-8 w-12" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 p-5"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <div className="flex items-start gap-4">
                <Bone className="size-10 shrink-0 rounded-full" />
                <div className="grid gap-2">
                  <Bone className="h-4 w-28" />
                  <Bone className="h-2.5 w-44" />
                </div>
              </div>
              <Bone className="h-6 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
