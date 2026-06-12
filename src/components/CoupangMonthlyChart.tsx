"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Legend,
} from "recharts";

type Props = {
  data: { month: string; 매출: number; 광고비: number; 광고비비중: number }[];
};

function formatM(v: number) {
  return `${(v / 1_000_000).toFixed(1)}백만`;
}

export default function CoupangMonthlyChart({ data }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-1 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        월별 매출 추이
      </p>
      <p className="mb-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        막대: 매출 &nbsp;|&nbsp; 선: 광고비 &nbsp;|&nbsp; 라벨: 광고비 비중(%)
      </p>
      <ResponsiveContainer width="100%" height={280} style={{ overflow: "visible" }}>
        <ComposedChart data={data} margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="coupangBarGrad" x1="0" y1="0" x2="0" y2="1">
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
            yAxisId="left"
            tickFormatter={formatM}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatM}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v, name) => {
              if (name === "광고비비중") return [`${Number(v).toFixed(1)}%`, "광고비 비중"];
              return [formatM(Number(v)), name as string];
            }}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />
          <Legend
            formatter={(value) => {
              const map: Record<string, string> = { 매출: "매출", 광고비: "광고비" };
              return <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{map[value] ?? value}</span>;
            }}
          />
          <Bar yAxisId="left" dataKey="매출" radius={[6, 6, 0, 0]}>
            <LabelList
              dataKey="광고비비중"
              position="top"
              formatter={(v: unknown) => `${Number(v).toFixed(1)}%`}
              style={{ fill: "#F59E0B", fontSize: 11, fontWeight: 600 }}
            />
            {data.map((_, i) => (
              <Cell key={i} fill="url(#coupangBarGrad)" />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="광고비"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: "#F59E0B", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
