type PublicStatBandProps = {
  stats: {
    label: string;
    value: string;
    helper: string;
  }[];
};

export function PublicStatBand({ stats }: PublicStatBandProps) {
  return (
    <section className="bg-[var(--color-gold)] px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="border border-black/15 bg-[rgba(255,255,255,0.22)] p-5">
            <p className="font-mono text-4xl font-black">{stat.value}</p>
            <h2 className="mt-2 text-sm font-black uppercase">{stat.label}</h2>
            <p className="mt-1 text-sm font-semibold text-black/65">{stat.helper}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
