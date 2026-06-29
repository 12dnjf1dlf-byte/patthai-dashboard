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
} from "recharts";

type DataItem = {
  month: string;
  매출: number;
  광고비: number;
  광고비비중: number;
  순매출: number;
  전년매출?: number | null;
};

type Props = {
  data: { month: string; 매출: number; 광고비: number; 광고비비중: number }[];
  onMonthClick?: (month: string | null) => void;
  selectedMonth?: string | null;
  prevYearLine?: { month: string; sales: number }[];
  prevYearLabel?: string;
};

function formatM(v: number) {
  if (v >= 1_0000_0000) return `${(v / 1_0000_0000).toFixed(1)}억`;
  if (v >= 100_0000) return `${(v / 100_0000).toFixed(1)}백만`;
  return `${(v / 1_0000).toFixed(0)}만`;
}

function TopLabel(props: {
  x?: number; y?: number; width?: number; value?: number; index?: number; data?: DataItem[];
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

export default function CoupangMonthlyChart({ data, onMonthClick, selectedMonth, prevYearLine, prevYearLabel = "전년도" }: Props) {
  // prevYearLine 데이터를 month 기준으로 매핑
  const prevMap = new Map(prevYearLine?.map((p) => [p.month, p.sales]) ?? []);

  const chartData: DataItem[] = data.map((d) => ({
    ...d,
    순매출: d.매출 - d.광고비,
    전년매출: prevMap.get(d.month) ?? null,
  }));

  const hasPrevYear = (prevYearLine?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
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
          {hasPrevYear && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} />
              {prevYearLabel}
            </span>
          )}
        </div>
        {selectedMonth && onMonthClick && (
          <button onClick={() => onMonthClick(null)} className="ml-auto rounded-lg px-3 py-1 text-xs font-medium transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            전체 보기
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300} style={{ overflow: "visible" }}>
        <ComposedChart
          data={chartData}
          margin={{ top: 64, right: 4, left: 0, bottom: 0 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={onMonthClick ? (e: any) => {
            const month = e?.activePayload?.[0]?.payload?.month as string | undefined;
            if (month) onMonthClick(selectedMonth === month ? null : month);
          } : undefined}
          style={onMonthClick ? { cursor: "pointer" } : undefined}
        >
          <defs>
            <linearGradient id="cpBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFAA" />
              <stop offset="100%" stopColor="#7B70EE" />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatM} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip
            formatter={(v, name) => {
              if (name === "전년매출") return [formatM(Number(v)), prevYearLabel];
              return [formatM(Number(v)), name === "순매출" ? "순매출" : "광고비"];
            }}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />
          {/* 순매출 바 (아래) */}
          <Bar dataKey="순매출" stackId="a" radius={[0, 0, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill="url(#cpBarGrad)" opacity={!selectedMonth || d.month === selectedMonth ? 1 : 0.3} />
            ))}
          </Bar>
          {/* 광고비 바 (위) + 라벨 */}
          <Bar dataKey="광고비" stackId="a" radius={[6, 6, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill="#F59E0B" opacity={!selectedMonth || d.month === selectedMonth ? 1 : 0.3} />
            ))}
            <LabelList
              content={(props) => (
                <TopLabel {...(props as { x?: number; y?: number; width?: number; value?: number; index?: number })} data={chartData} />
              )}
            />
          </Bar>
          {/* 전년도 라인 (옵션) */}
          {hasPrevYear && (
            <Line
              type="monotone"
              dataKey="전년매출"
              stroke="#A78BFA"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: "#A78BFA", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
