import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "warning" | "danger" | "success";
};

const toneBorder: Record<string, string> = {
  neutral: "var(--border)",
  warning: "var(--color-gold-muted, #b8880a)",
  danger: "var(--color-danger, #e53e3e)",
  success: "var(--color-success, #38a169)",
};

export function MetricCard({ label, value, helper, tone = "neutral" }: MetricCardProps) {
  return (
    <article
      className={cn("p-5")}
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${toneBorder[tone]}`,
        color: "var(--text-primary)",
      }}
    >
      <p className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-3 font-mono text-3xl font-black" style={{ color: "var(--text-primary)" }}>{value}</p>
      {helper ? <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>{helper}</p> : null}
    </article>
  );
}
