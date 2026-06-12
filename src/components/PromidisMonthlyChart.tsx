"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  Cell,
} from "recharts";

export type PromidisChartItem = {
  month: string;
  sales25: number;
  net26: number;    // 2026 순매출 (매출 - 광고비)
  adCost: number;   // 2026 광고비
  sales26: number;  // 2026 총매출
  adRatio: number;  // 광고비 비율
};

type Props = {
  data: PromidisChartItem[];
  selectedMonth?: number | null;
  onMonthClick?: (month: number | null) => void;
};

function formatM(v: number) {
  if (v >= 1_0000_0000) return `${(v / 1_0000_0000).toFixed(1)}억`;
  if (v >= 100_0000) return `${(v / 100_0000).toFixed(1)}백만`;
  if (v >= 1_0000) return `${(v / 1_0000).toFixed(0)}만`;
  return v.toLocaleString();
}

function TopLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
  data?: PromidisChartItem[];
}) {
  const { x = 0, y = 0, width = 0, index = 0, data = [] } = props;
  const item = data[index];
  if (!item || item.sales26 === 0) return null;

  const cx = x + width / 2;

  return (
    <g>
      <text x={cx} y={y - 42} textAnchor="middle" fontSize={10} fontWeight={700} fill="rgba(255,255,255,0.9)">
        {formatM(item.sales26)}
      </text>
      <text x={cx} y={y - 27} textAnchor="middle" fontSize={9} fill="#F59E0B">
        광고 {formatM(item.adCost)}
      </text>
      <text x={cx} y={y - 13} textAnchor="middle" fontSize={9} fill="#F59E0B" fontWeight={600}>
        ({item.adRatio.toFixed(1)}%)
      </text>
    </g>
  );
}

export default function PromidisMonthlyChart({ data, selectedMonth, onMonthClick }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <div className="mb-4 flex items-center gap-4">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
          2025 vs 2026 월별 매출 비교
        </p>
        <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "linear-gradient(#00CFAA,#7B70EE)" }} />
            2026 순매출
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
            2026 광고비
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} />
            2025
          </span>
        </div>
        {selectedMonth && onMonthClick && (
          <button
            onClick={() => onMonthClick(null)}
            className="ml-auto rounded-lg px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            전체 보기
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={320} style={{ overflow: "visible" }}>
        <ComposedChart
          data={data}
          margin={{ top: 64, right: 16, left: 0, bottom: 0 }}
          barCategoryGap="25%"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={onMonthClick ? (e: any) => {
            const monthStr: string | undefined = e?.activePayload?.[0]?.payload?.month;
            if (!monthStr) return;
            const m = Number(monthStr.replace("월", ""));
            if (m) onMonthClick(selectedMonth === m ? null : m);
          } : undefined}
          style={onMonthClick ? { cursor: "pointer" } : undefined}
        >
          <defs>
            <linearGradient id="promidisBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFAA" />
              <stop offset="100%" stopColor="#7B70EE" />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatM} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={58} />
          <Tooltip
            formatter={(v, name) => {
              if (name === "net26") return [formatM(Number(v)), "2026 순매출"];
              if (name === "adCost") return [formatM(Number(v)), "2026 광고비"];
              if (name === "sales25") return [formatM(Number(v)), "2025 매출"];
              return [formatM(Number(v)), String(name)];
            }}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />
          {/* 2026 순매출 (아래) */}
          <Bar dataKey="net26" stackId="a26" radius={[0, 0, 0, 0]}>
            {data.map((d, i) => {
              const monthNum = Number(d.month.replace("월", ""));
              return (
                <Cell
                  key={i}
                  fill="url(#promidisBarGrad)"
                  opacity={!selectedMonth || selectedMonth === monthNum ? 1 : 0.3}
                />
              );
            })}
          </Bar>
          {/* 2026 광고비 (위, 노란색) + 라벨 */}
          <Bar dataKey="adCost" stackId="a26" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => {
              const monthNum = Number(d.month.replace("월", ""));
              return (
                <Cell
                  key={i}
                  fill="#F59E0B"
                  opacity={!selectedMonth || selectedMonth === monthNum ? 1 : 0.3}
                />
              );
            })}
            <LabelList
              content={(props) => (
                <TopLabel
                  {...(props as { x?: number; y?: number; width?: number; value?: number; index?: number })}
                  data={data}
                />
              )}
            />
          </Bar>
          {/* 2025 라인 */}
          <Line
            type="monotone"
            dataKey="sales25"
            stroke="#A78BFA"
            strokeWidth={2}
            dot={{ r: 3, fill: "#A78BFA", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            strokeDasharray="4 2"
          />
          <Legend
            formatter={(v) => {
              if (v === "net26") return <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>2026 순매출</span>;
              if (v === "adCost") return <span style={{ color: "#F59E0B", fontSize: 11 }}>2026 광고비</span>;
              if (v === "sales25") return <span style={{ color: "#A78BFA", fontSize: 11 }}>2025 매출</span>;
              return v;
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
