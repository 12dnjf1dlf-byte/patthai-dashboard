"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatKRWShort, CATEGORY_COLORS } from "@/lib/format";

type Props = {
  data: { category: string; value: number }[];
};

export default function CategoryPie({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        카테고리별 매출
      </p>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [formatKRWShort(Number(v)), "매출"]}
              contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "rgba(255,255,255,0.87)" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2">
          {data.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                {entry.category}
              </span>
              <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                {total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
