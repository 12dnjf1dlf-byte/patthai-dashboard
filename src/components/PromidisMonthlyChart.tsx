"use client";

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

export type PromidisChartItem = {
  month: string;      // "1월" ~ "12월"
  // 2025
  net25: number;
  adCost25: number;
  sales25: number;
  adRatio25: number;
  // 2026
  net26: number;
  adCost26: number;
  sales26: number;
  adRatio26: number;
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

function TopLabel25(props: {
  x?: number; y?: number; width?: number; index?: number; data?: PromidisChartItem[];
}) {
  const { x = 0, y = 0, width = 0, index = 0, data = [] } = props;
  const item = data[index];
  if (!item || item.sales25 === 0) return null;
  const cx = x + width / 2;
  return (
    <g>
      <text x={cx} y={y - 28} textAnchor="middle" fontSize={9} fontWeight={700} fill="rgba(167,139,250,0.9)">
        {formatM(item.sales25)}
      </text>
      <text x={cx} y={y - 14} textAnchor="middle" fontSize={8} fill="rgba(167,139,250,0.65)">
        광고 {formatM(item.adCost25)}
      </text>
    </g>
  );
}

function TopLabel26(props: {
  x?: number; y?: number; width?: number; index?: number; data?: PromidisChartItem[];
}) {
  const { x = 0, y = 0, width = 0, index = 0, data = [] } = props;
  const item = data[index];
  if (!item || item.sales26 === 0) return null;
  const cx = x + width / 2;
  return (
    <g>
      <text x={cx} y={y - 42} textAnchor="middle" fontSize={10} fontWeight={700} fill="rgba(255,255,255,0.92)">
        {formatM(item.sales26)}
      </text>
      <text x={cx} y={y - 27} textAnchor="middle" fontSize={9} fill="#F59E0B">
        광고 {formatM(item.adCost26)}
      </text>
      <text x={cx} y={y - 13} textAnchor="middle" fontSize={9} fill="#F59E0B" fontWeight={600}>
        ({item.adRatio26.toFixed(1)}%)
      </text>
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const item: PromidisChartItem | undefined = payload[0]?.payload;
  if (!item) return null;
  return (
    <div style={{ backgroundColor: "#252739", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 11, minWidth: 180 }}>
      <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 600 }}>{label}</p>
      {item.sales26 > 0 && (
        <div style={{ marginBottom: 6 }}>
          <p style={{ color: "#00CFAA", fontWeight: 600, marginBottom: 2 }}>2026년</p>
          <p style={{ color: "rgba(255,255,255,0.8)" }}>총매출: {item.sales26.toLocaleString()}원</p>
          <p style={{ color: "#F59E0B" }}>광고비: {item.adCost26.toLocaleString()}원 ({item.adRatio26.toFixed(1)}%)</p>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>순매출: {item.net26.toLocaleString()}원</p>
        </div>
      )}
      {item.sales25 > 0 && (
        <div>
          <p style={{ color: "#A78BFA", fontWeight: 600, marginBottom: 2 }}>2025년</p>
          <p style={{ color: "rgba(255,255,255,0.8)" }}>총매출: {item.sales25.toLocaleString()}원</p>
          <p style={{ color: "rgba(167,139,250,0.7)" }}>광고비: {item.adCost25.toLocaleString()}원 ({item.adRatio25.toFixed(1)}%)</p>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>순매출: {item.net25.toLocaleString()}원</p>
        </div>
      )}
    </div>
  );
}

export default function PromidisMonthlyChart({ data, selectedMonth, onMonthClick }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
          2025 vs 2026 월별 매출 비교
        </p>
        <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "linear-gradient(#00CFAA,#7B70EE)" }} />
            2026 순매출
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
            2026 광고비
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(167,139,250,0.6)" }} />
            2025 순매출
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "rgba(167,139,250,0.35)" }} />
            2025 광고비
          </span>
        </div>
        {selectedMonth && onMonthClick && (
          <button onClick={() => onMonthClick(null)} className="ml-auto rounded-lg px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            전체 보기
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={380} style={{ overflow: "visible" }}>
        <ComposedChart
          data={data}
          margin={{ top: 64, right: 16, left: 0, bottom: 0 }}
          barCategoryGap="18%"
          barGap={3}
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
            <linearGradient id="grad26" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CFAA" />
              <stop offset="100%" stopColor="#7B70EE" />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatM} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} width={58} />
          <Tooltip content={<CustomTooltip />} />

          {/* 2026 순매출 (아래) */}
          <Bar dataKey="net26" stackId="y26" radius={[0, 0, 0, 0]} maxBarSize={36}>
            {data.map((d, i) => {
              const m = Number(d.month.replace("월", ""));
              return <Cell key={i} fill="url(#grad26)" opacity={!selectedMonth || selectedMonth === m ? 1 : 0.25} />;
            })}
          </Bar>
          {/* 2026 광고비 (위) + 라벨 */}
          <Bar dataKey="adCost26" stackId="y26" radius={[5, 5, 0, 0]} maxBarSize={36}>
            {data.map((d, i) => {
              const m = Number(d.month.replace("월", ""));
              return <Cell key={i} fill="#F59E0B" opacity={!selectedMonth || selectedMonth === m ? 1 : 0.25} />;
            })}
            <LabelList content={(props) => (
              <TopLabel26 {...(props as { x?: number; y?: number; width?: number; value?: number; index?: number })} data={data} />
            )} />
          </Bar>

          {/* 2025 순매출 (아래) */}
          <Bar dataKey="net25" stackId="y25" radius={[0, 0, 0, 0]} maxBarSize={36}>
            {data.map((d, i) => {
              const m = Number(d.month.replace("월", ""));
              return <Cell key={i} fill="rgba(167,139,250,0.6)" opacity={!selectedMonth || selectedMonth === m ? 1 : 0.25} />;
            })}
          </Bar>
          {/* 2025 광고비 (위) + 라벨 */}
          <Bar dataKey="adCost25" stackId="y25" radius={[5, 5, 0, 0]} maxBarSize={36}>
            {data.map((d, i) => {
              const m = Number(d.month.replace("월", ""));
              return <Cell key={i} fill="rgba(167,139,250,0.35)" opacity={!selectedMonth || selectedMonth === m ? 1 : 0.25} />;
            })}
            <LabelList content={(props) => (
              <TopLabel25 {...(props as { x?: number; y?: number; width?: number; value?: number; index?: number })} data={data} />
            )} />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>

      {/* 월별 비교 요약 테이블 */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th className="px-3 py-2 text-left font-semibold" style={{ color: "rgba(255,255,255,0.4)", minWidth: 48 }}>월</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: "#A78BFA" }}>2025 매출</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: "rgba(167,139,250,0.6)" }}>2025 광고비</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: "rgba(167,139,250,0.5)" }}>광고비율</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: "#00CFAA" }}>2026 매출</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: "#F59E0B" }}>2026 광고비</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: "rgba(245,158,11,0.7)" }}>광고비율</th>
              <th className="px-3 py-2 text-right font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>YoY</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const yoy = d.sales25 > 0 ? ((d.sales26 - d.sales25) / d.sales25) * 100 : null;
              const hasData = d.sales25 > 0 || d.sales26 > 0;
              if (!hasData) return null;
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2 font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{d.month}</td>
                  <td className="px-3 py-2 text-right" style={{ color: d.sales25 > 0 ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.2)" }}>
                    {d.sales25 > 0 ? formatM(d.sales25) : "-"}
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: d.adCost25 > 0 ? "rgba(167,139,250,0.65)" : "rgba(255,255,255,0.2)" }}>
                    {d.adCost25 > 0 ? formatM(d.adCost25) : "-"}
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: "rgba(167,139,250,0.5)" }}>
                    {d.sales25 > 0 && d.adCost25 > 0 ? `${d.adRatio25.toFixed(1)}%` : "-"}
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: d.sales26 > 0 ? "#00CFAA" : "rgba(255,255,255,0.2)" }}>
                    {d.sales26 > 0 ? formatM(d.sales26) : "-"}
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: d.adCost26 > 0 ? "#F59E0B" : "rgba(255,255,255,0.2)" }}>
                    {d.adCost26 > 0 ? formatM(d.adCost26) : "-"}
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: "rgba(245,158,11,0.7)" }}>
                    {d.sales26 > 0 && d.adCost26 > 0 ? `${d.adRatio26.toFixed(1)}%` : "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {yoy !== null ? (
                      <span style={{ color: yoy >= 0 ? "#00CFAA" : "#F87171" }}>
                        {yoy >= 0 ? "▲" : "▼"} {Math.abs(yoy).toFixed(1)}%
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
