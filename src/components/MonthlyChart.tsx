"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatKRWShort } from "@/lib/format";

type Props = {
  data: { month: string; value: number }[];
};

export default function MonthlyChart({ data }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        월별 매출 추이
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFAA" />
              <stop offset="100%" stopColor="#7B70EE" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatKRWShort}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v) => [formatKRWShort(Number(v)), "매출"]}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
            itemStyle={{ color: "#00CFAA" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="url(#barGrad)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
