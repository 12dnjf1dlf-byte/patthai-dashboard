"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

type DataItem = {
  month: string;
  매출: number;
  광고비: number;
  광고비비중: number;
  순매출: number;
};

type Props = {
  data: { month: string; 매출: number; 광고비: number; 광고비비중: number }[];
};

function formatM(v: number) {
  return `${(v / 1_000_000).toFixed(1)}백만`;
}

// 바 위에 매출/광고비/비중 3줄 표시하는 커스텀 라벨
function TopLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  index?: number;
  data?: DataItem[];
}) {
  const { x = 0, y = 0, width = 0, index = 0, data = [] } = props;
  const item = data[index];
  if (!item) return null;

  const cx = x + width / 2;

  return (
    <g>
      <text x={cx} y={y - 44} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ffffff" opacity={0.9}>
        {formatM(item.매출)}
      </text>
      <text x={cx} y={y - 28} textAnchor="middle" fontSize={10} fill="#F59E0B">
        광고 {formatM(item.광고비)}
      </text>
      <text x={cx} y={y - 12} textAnchor="middle" fontSize={10} fill="#F59E0B" fontWeight={600}>
        ({item.광고비비중.toFixed(1)}%)
      </text>
    </g>
  );
}

export default function CoupangMonthlyChart({ data }: Props) {
  const chartData: DataItem[] = data.map((d) => ({
    ...d,
    순매출: d.매출 - d.광고비,
  }));

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <div className="mb-4 flex items-center gap-4">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
          월별 매출 추이
        </p>
        <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "linear-gradient(#00CFAA,#7B70EE)" }} />
            순매출
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
            광고비
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300} style={{ overflow: "visible" }}>
        <BarChart data={chartData} margin={{ top: 64, right: 4, left: 0, bottom: 0 }} stackOffset="none">
          <defs>
            <linearGradient id="cpBarGrad" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={formatM}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v, name) => [formatM(Number(v)), name === "순매출" ? "순매출" : "광고비"]}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />
          {/* 순매출 바 (아래쪽) */}
          <Bar dataKey="순매출" stackId="a" radius={[0, 0, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill="url(#cpBarGrad)" />
            ))}
          </Bar>
          {/* 광고비 바 (위쪽, 노란색) + 커스텀 라벨 */}
          <Bar dataKey="광고비" stackId="a" radius={[6, 6, 0, 0]} fill="#F59E0B">
            <LabelList
              content={(props) => (
                <TopLabel
                  {...(props as { x?: number; y?: number; width?: number; value?: number; index?: number })}
                  data={chartData}
                />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
