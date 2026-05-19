"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

import type {
  ClienteSegmento,
  InventoryTurnoverItem,
  LeadFunnelItem,
  MonthlyRevenue,
  TopSku,
} from "@/lib/reports";

// ─── Shared helpers ───────────────────────────────────────────────────────────

type VT = string | number | ReadonlyArray<string | number>;

const tooltipContentStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  color: "var(--text-primary)",
  fontSize: 12,
  fontFamily: "monospace",
} as const;

const tooltipLabelStyle = {
  color: "#f5c518",
  fontWeight: 900,
  textTransform: "uppercase",
} as const;

const axisStyle = { fill: "#71717a", fontSize: 11, fontFamily: "monospace" } as const;

function fmtUsd(v: VT | undefined): string {
  const n = Number(v ?? 0);
  return `$${n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString("en-US")}`;
}

// ─── Revenue line chart ───────────────────────────────────────────────────────

export function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <ResponsiveContainer height={260} width="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtUsd(v as number)}
        />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(v) => [fmtUsd(v), "Ventas"]}
        />
        <Line
          type="monotone"
          dataKey="ventas"
          stroke="#F5C518"
          strokeWidth={2.5}
          dot={{ fill: "#F5C518", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#ffd700" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Facturas bar chart ───────────────────────────────────────────────────────

export function FacturasChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <ResponsiveContainer height={200} width="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mes" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(v) => [v, "Facturas"]}
        />
        <Bar dataKey="facturas" fill="#3f3f46" radius={[2, 2, 0, 0]}>
          <LabelList
            dataKey="facturas"
            position="top"
            style={{ fill: "#71717a", fontSize: 10 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Top SKUs horizontal bar ──────────────────────────────────────────────────

export function TopSkusChart({ data }: { data: TopSku[] }) {
  const display = data.slice(0, 6).map((s) => ({
    ...s,
    label: s.nombre.length > 20 ? `${s.nombre.slice(0, 20)}…` : s.nombre,
    revenue: Math.round(s.revenue),
  }));

  return (
    <ResponsiveContainer height={280} width="100%">
      <BarChart
        data={display}
        layout="vertical"
        margin={{ top: 4, right: 60, left: 8, bottom: 0 }}
      >
        <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtUsd(v as number)}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(v, name) =>
            name === "revenue"
              ? [fmtUsd(v), "Revenue"]
              : [`${v} uds`, "Unidades"]
          }
        />
        <Bar dataKey="revenue" fill="#F5C518" radius={[0, 2, 2, 0]}>
          <LabelList
            dataKey="revenue"
            position="right"
            formatter={(v: unknown) => fmtUsd(v as VT)}
            style={{ fill: "#F5C518", fontSize: 10, fontFamily: "monospace" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Lead funnel bar ──────────────────────────────────────────────────────────

const FUNNEL_COLORS: Record<string, string> = {
  NUEVO: "#6b7280",
  CALIFICANDO: "#4b5563",
  COTIZADO: "#3b82f6",
  EN_NEGOCIACION: "#f59e0b",
  CIERRE_PENDIENTE: "#F5C518",
  VENTA_CERRADA: "#38A169",
  RECOMPRA: "#10b981",
  PERDIDO: "#E53E3E",
};

export function LeadFunnelChart({ data }: { data: LeadFunnelItem[] }) {
  return (
    <ResponsiveContainer height={240} width="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
        <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ ...axisStyle, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          angle={-20}
          textAnchor="end"
        />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(v) => [v, "Leads"]}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.estado} fill={FUNNEL_COLORS[entry.estado] ?? "#6b7280"} />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            style={{ fill: "#a1a1aa", fontSize: 11, fontFamily: "monospace" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Cliente segmentos pie ────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;

function PieInnerLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof innerRadius !== "number" ||
    typeof outerRadius !== "number" ||
    typeof percent !== "number" ||
    percent < 0.05
  )
    return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const label = typeof name === "string" ? name.split(" ")[0] : "";

  return (
    <text
      dominantBaseline="central"
      fill="white"
      fontFamily="monospace"
      fontSize={11}
      fontWeight={900}
      textAnchor="middle"
      x={x}
      y={y}
    >
      {label} {(percent * 100).toFixed(0)}%
    </text>
  );
}

export function ClienteSegmentosChart({ data }: { data: ClienteSegmento[] }) {
  return (
    <ResponsiveContainer height={220} width="100%">
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="count"
          innerRadius={55}
          labelLine={false}
          nameKey="segmento"
          outerRadius={90}
          label={PieInnerLabel}
        >
          {data.map((entry) => (
            <Cell fill={entry.fill} key={entry.segmento} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(v, name) => [v, name ?? ""]}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#a1a1aa", fontSize: 11, fontFamily: "monospace" }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Inventory turnover combo ─────────────────────────────────────────────────

export function InventoryTurnoverChart({ data }: { data: InventoryTurnoverItem[] }) {
  return (
    <ResponsiveContainer height={240} width="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1f1f1f" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="sku"
          tick={{ ...axisStyle, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ ...axisStyle, fill: "#F5C518" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(v, name) => {
            if (name === "rotacion") return [`${v}x`, "Rotacion"];
            if (name === "vendidas") return [v, "Unidades vendidas"];
            return [v, "Stock actual"];
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#a1a1aa", fontSize: 11, fontFamily: "monospace" }}>
              {value}
            </span>
          )}
        />
        <Bar
          yAxisId="left"
          dataKey="vendidas"
          fill="#3f3f46"
          name="vendidas"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          yAxisId="left"
          dataKey="stock"
          fill="#27272a"
          name="stock"
          radius={[2, 2, 0, 0]}
        />
        <Line
          yAxisId="right"
          dataKey="rotacion"
          name="rotacion"
          stroke="#F5C518"
          strokeWidth={2}
          type="monotone"
          dot={{ fill: "#F5C518", r: 3, strokeWidth: 0 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
