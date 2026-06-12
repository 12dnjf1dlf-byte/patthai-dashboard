"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  Cell,
} from "recharts";

type Item = { month: string; "2025": number; "2026": number };

type Props = { data: Item[] };

function GrowthLabel(props: { x?: number; y?: number; width?: number; index?: number; data?: Item[] }) {
  const { x = 0, y = 0, width = 0, index = 0, data = [] } = props;
  const item = data[index];
  if (!item) return null;
  const v25 = item["2025"];
  const v26 = item["2026"];
  if (!v25 || !v26) return null;
  const rate = ((v26 - v25) / v25) * 100;
  const color = rate >= 0 ? "#00CFAA" : "#F87171";
  const label = `${rate >= 0 ? "▲" : "▼"}${Math.abs(rate).toFixed(1)}%`;
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={10} fill={color} fontWeight={700}>
      {label}
    </text>
  );
}

export default function YearCompareQtyChart({ data }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        2025 vs 2026 월별 수량 비교
      </p>
      <ResponsiveContainer width="100%" height={300} style={{ overflow: "visible" }}>
        <BarChart data={data} margin={{ top: 32, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%">
          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
          <Tooltip
            formatter={(v, name) => [`${Number(v).toLocaleString()}개`, `${name}년`]}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />
          <Legend formatter={(v) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{v}년</span>} />
          <Bar dataKey="2025" fill="#7B70EE" radius={[4, 4, 0, 0]} barSize={16}>
            <LabelList dataKey="2025" position="top" formatter={(v: unknown) => Number(v).toLocaleString()} style={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
          </Bar>
          <Bar dataKey="2026" fill="#00CFAA" radius={[4, 4, 0, 0]} barSize={16}>
            <LabelList dataKey="2026" position="top" formatter={(v: unknown) => Number(v).toLocaleString()} style={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
            <LabelList content={(props) => <GrowthLabel {...(props as { x?: number; y?: number; width?: number; index?: number })} data={data} />} />
            {data.map((_, i) => <Cell key={i} fill="#00CFAA" />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
