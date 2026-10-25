"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatValue } from "@/lib/format";

export interface LineSeries {
  key: string;
  label: string;
  /** Variable CSS del color ("var(--chart-2)"). */
  color: string;
  /** Trazo punteado: distingue la línea sin depender del color. */
  dashed?: boolean;
  points: { x: string; y: number }[];
}

/**
 * Varias series sobre el mismo eje (total, hombres, mujeres). Cada línea se
 * distingue por color y trazo, y la leyenda de arriba la nombra: nunca solo
 * color. Los mismos datos están en la tabla "Ver datos".
 */
export default function MultiLineChart({
  series,
  unit,
  decimals,
}: {
  series: LineSeries[];
  unit: string;
  decimals: number;
}) {
  const xs = [...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort();
  const data = xs.map((x) => {
    const row: Record<string, string | number> = { x };
    for (const s of series) {
      const p = s.points.find((q) => q.x === x);
      if (p) row[s.key] = p.y;
    }
    return row;
  });
  const values = series.flatMap((s) => s.points.map((p) => p.y));
  const [min, max] = [Math.min(...values), Math.max(...values)];
  const pad = Math.max((max - min) * 0.1, 0.5);
  // Mismo comportamiento que LineChart: Escape cierra el cartel (WCAG 1.4.13).
  const [tipHidden, setTipHidden] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTipHidden(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div>
      <ul aria-hidden className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        {series.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line
                x1="1"
                y1="4"
                x2="21"
                y2="4"
                stroke={s.color}
                strokeWidth="2.5"
                strokeDasharray={s.dashed ? "4 3" : undefined}
                strokeLinecap="round"
              />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>
      <div
        aria-hidden
        className="h-64 w-full md:h-72"
        onMouseMove={() => {
          if (tipHidden) setTipHidden(false);
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data} margin={{ top: 8, right: 14, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="x"
              tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-line)" }}
              minTickGap={32}
            />
            <YAxis
              width={52}
              domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
              tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                unit === "%" ? `${formatNumber(v, 0)}%` : formatNumber(v, 0)
              }
            />
            <Tooltip
              active={tipHidden ? false : undefined}
              cursor={{ stroke: "var(--color-ink-faint)", strokeDasharray: "3 3" }}
              formatter={(value, name) => [
                formatValue(Number(value), unit, decimals),
                series.find((s) => s.key === name)?.label ?? String(name),
              ]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--color-line)",
                boxShadow: "var(--shadow-card)",
                fontSize: 13,
                fontFamily: "var(--font-body)",
              }}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)" }}
                connectNulls
              />
            ))}
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
