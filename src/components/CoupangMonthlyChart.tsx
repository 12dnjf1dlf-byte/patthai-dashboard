"use client";

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

type ChartItem = {
  month: string;
  매출: number;
  광고비: number;
  광고비비중: number;
  순매출: number;
  prev2025: number;
  yoy: number | null;
  isTarget?: boolean;
};

type Props = {
  data: { month: string; 매출: number; 광고비: number; 광고비비중: number; isTarget?: boolean }[];
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

function Cur2026Label(props: { x?: number; y?: number; width?: number; index?: number; data?: ChartItem[] }) {
  const { x = 0, y = 0, width = 0, index = 0, data = [] } = props;
  const item = data[index];
  if (!item) return null;
  const cx = x + width / 2;
  if (item.isTarget) {
    return (
      <text x={cx} y={y - 6} textAnchor="middle" fontSize={9} fill="#A78BFA" fontWeight={600}>
        목표 {formatM(item.매출)}
      </text>
    );
  }
  return (
    <g>
      <text x={cx} y={y - 28} textAnchor="middle" fontSize={10} fontWeight={700} fill="#ffffff" opacity={0.9}>
        {formatM(item.매출)}
      </text>
      {item.yoy !== null && (
        <text x={cx} y={y - 14} textAnchor="middle" fontSize={9} fill={item.yoy >= 0 ? "#34D399" : "#F87171"} fontWeight={600}>
          {item.yoy >= 0 ? "▲" : "▼"}{Math.abs(item.yoy).toFixed(1)}%
        </text>
      )}
    </g>
  );
}

function Prev2025Label(props: { x?: number; y?: number; width?: number; value?: number }) {
  const { x = 0, y = 0, width = 0, value = 0 } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="rgba(167,139,250,0.8)">
      {formatM(value)}
    </text>
  );
}

export default function CoupangMonthlyChart({ data, onMonthClick, selectedMonth, prevYearLine, prevYearLabel = "전년도" }: Props) {
  const prevMap = new Map(prevYearLine?.map((p) => [p.month, p.sales]) ?? []);
  const hasPrevYear = (prevYearLine?.length ?? 0) > 0;

  const chartData: ChartItem[] = data.map((d) => {
    const prev = prevMap.get(d.month) ?? 0;
    const yoy = prev > 0 ? ((d.매출 - prev) / prev) * 100 : null;
    return {
      ...d,
      순매출: d.isTarget ? d.매출 : d.매출 - d.광고비,
      prev2025: prev,
      yoy,
    };
  });

  const hasTarget = data.some(d => d.isTarget);

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>월별 매출 추이</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "linear-gradient(#00CFAA,#7B70EE)" }} />
            2026 실적
          </span>
          {hasTarget && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(167,139,250,0.4)" }} />
              2026 목표
            </span>
          )}
          {hasPrevYear && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(167,139,250,0.7)" }} />
              {prevYearLabel}
            </span>
          )}
        </div>
        {selectedMonth && onMonthClick && (
          <button onClick={() => onMonthClick(null)} className="ml-auto rounded-lg px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            전체 보기
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={320} style={{ overflow: "visible" }}>
        <ComposedChart
          data={chartData}
          margin={{ top: 52, right: 4, left: 0, bottom: 0 }}
          barCategoryGap="20%"
          barGap={3}
          onClick={onMonthClick ? (e: any) => {
            const month = e?.activePayload?.[0]?.payload?.month as string | undefined;
            if (month) onMonthClick(selectedMonth === month ? null : month);
          } : undefined}
          style={onMonthClick ? { cursor: "pointer" } : undefined}
        >
          <defs>
            <linearGradient id="cpBarGrad26" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFAA" />
              <stop offset="100%" stopColor="#7B70EE" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis tickFormatter={formatM} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
          <Tooltip
            formatter={(v, name) => {
              if (name === "prev2025") return [formatM(Number(v)), prevYearLabel];
              if (name === "매출") return [formatM(Number(v)), "2026 매출"];
              return [formatM(Number(v)), name as string];
            }}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />

          {/* 2025 전년도 바 */}
          {hasPrevYear && (
            <Bar dataKey="prev2025" name="prev2025" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell
                  key={i}
                  fill="rgba(167,139,250,0.55)"
                  opacity={!selectedMonth || d.month === selectedMonth ? 1 : 0.3}
                />
              ))}
              <LabelList content={(props) => <Prev2025Label {...(props as any)} />} />
            </Bar>
          )}

          {/* 2026 실적/목표 바 */}
          <Bar dataKey="매출" name="매출" radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell
                key={i}
                fill={d.isTarget ? "rgba(167,139,250,0.28)" : "url(#cpBarGrad26)"}
                opacity={!selectedMonth || d.month === selectedMonth ? 1 : 0.3}
              />
            ))}
            <LabelList
              content={(props) => (
                <Cur2026Label {...(props as any)} data={chartData} />
              )}
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
