"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatValue } from "@/lib/format";

export interface LinePoint {
  x: string;
  y: number;
}

export default function LineChart({
  data,
  unit,
  decimals,
}: {
  data: LinePoint[];
  unit: string;
  decimals: number;
}) {
  return (
    <div aria-hidden className="h-64 w-full md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
            tick={{ fill: "var(--color-ink-faint)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              unit === "%" ? `${formatNumber(v, 0)}%` : formatNumber(v, 0)
            }
          />
          <Tooltip
            cursor={{ stroke: "var(--color-ink-faint)", strokeDasharray: "3 3" }}
            formatter={(value) => [formatValue(Number(value), unit, decimals), ""]}
            separator=""
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-line)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
            }}
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)" }}
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}
