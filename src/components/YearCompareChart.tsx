"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatKRWShort } from "@/lib/format";

type Props = {
  data: { month: string; "2025": number; "2026": number }[];
};

export default function YearCompareChart({ data }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        2025 vs 2026 월별 매출 비교
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%">
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
            formatter={(v, name) => [formatKRWShort(Number(v)), `${name}년`]}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{value}년</span>
            )}
          />
          <Bar dataKey="2025" fill="#7B70EE" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="2026" fill="#00CFAA" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
