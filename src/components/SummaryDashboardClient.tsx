"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from "recharts";

export type BrandMonthly = { month: number; sales: number };
export type BrandSummary = {
  name: string;
  shortName: string;
  totalSales: number;
  totalOrders: number;
  monthly: BrandMonthly[];
  color: string;
  href: string;
};

type Props = { brands: BrandSummary[] };

function formatKRW(n: number) {
  if (n >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1)}억`;
  if (n >= 100_0000) return `${(n / 100_0000).toFixed(1)}백만`;
  if (n >= 1_0000) return `${(n / 1_0000).toFixed(0)}만`;
  return n.toLocaleString();
}

function formatKRWFull(n: number) {
  return `${n.toLocaleString()}원`;
}

function getGrowthRate(monthly: BrandMonthly[]) {
  if (monthly.length < 2) return null;
  const sorted = [...monthly].sort((a, b) => a.month - b.month);
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  if (prev.sales === 0) return null;
  return ((last.sales - prev.sales) / prev.sales) * 100;
}

function getLastMonth(monthly: BrandMonthly[]) {
  if (monthly.length === 0) return null;
  return [...monthly].sort((a, b) => a.month - b.month)[monthly.length - 1];
}

const cardStyle = (color: string) => ({
  backgroundColor: "#1C1E2E",
  borderRadius: 16,
  padding: "20px 24px",
  borderTop: `3px solid ${color}`,
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "#252739", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: <span style={{ color: "rgba(255,255,255,0.87)", fontWeight: 600 }}>{formatKRWFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function SummaryDashboardClient({ brands }: Props) {
  // 전체 합산
  const totalAll = brands.reduce((s, b) => s + b.totalSales, 0);

  // 브랜드별 점유율
  const brandShare = brands.map((b) => ({
    ...b,
    share: totalAll > 0 ? (b.totalSales / totalAll) * 100 : 0,
  }));

  // 멀티라인 차트: 모든 월 통합
  const chartData = useMemo(() => {
    const allMonths = [
      ...new Set(brands.flatMap((b) => b.monthly.map((m) => m.month))),
    ].sort((a, b) => a - b);

    return allMonths.map((month) => {
      const obj: Record<string, number | string> = { month: `${month}월` };
      brands.forEach((b) => {
        const found = b.monthly.find((m) => m.month === month);
        obj[b.shortName] = found ? found.sales : 0;
      });
      return obj;
    });
  }, [brands]);

  // 총매출 비교 바 차트 데이터
  const barData = brands.map((b) => ({ name: b.shortName, value: b.totalSales, color: b.color }));

  return (
    <>
      {/* 전체 합계 KPI */}
      <div className="mb-6 rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(123,112,238,0.15),rgba(0,207,170,0.15))", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>전체 브랜드 합산</p>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-3xl font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>{formatKRWFull(totalAll)}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>총 매출</p>
          </div>
          <div>
            <p className="text-xl font-semibold" style={{ color: "#00CFAA" }}>
              {brands.reduce((s, b) => s + b.totalOrders, 0).toLocaleString()}건
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>총 주문수</p>
          </div>
          <div>
            <p className="text-xl font-semibold" style={{ color: "#7B70EE" }}>{brands.length}개 브랜드</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>운영 중</p>
          </div>
        </div>
      </div>

      {/* 브랜드별 KPI 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {brandShare.map((b) => {
          const growth = getGrowthRate(b.monthly);
          const lastMonth = getLastMonth(b.monthly);
          return (
            <a key={b.name} href={b.href} style={cardStyle(b.color)} className="transition-opacity hover:opacity-80">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: b.color }}>{b.shortName}</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${b.color}22`, color: b.color }}>
                  {b.share.toFixed(1)}%
                </span>
              </div>

              <div>
                <p className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>{formatKRW(b.totalSales)}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>총 매출</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{b.totalOrders.toLocaleString()}건</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>총 주문수</p>
                </div>
                {lastMonth && (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{formatKRW(lastMonth.sales)}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{lastMonth.month}월 매출</p>
                  </div>
                )}
              </div>

              {growth !== null && (
                <div className="flex items-center gap-1">
                  <span style={{ color: growth >= 0 ? "#00CFAA" : "#EF4444", fontSize: 13, fontWeight: 600 }}>
                    {growth >= 0 ? "▲" : "▼"} {Math.abs(growth).toFixed(1)}%
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>전월 대비</span>
                </div>
              )}
            </a>
          );
        })}
      </div>

      {/* 월별 매출 비교 바 차트 */}
      <div className="mb-6 rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
        <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>월별 매출 추이 비교</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} margin={{ top: 28, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%" barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatKRW(v)} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} formatter={(v) => <span style={{ color: "rgba(255,255,255,0.55)" }}>{v}</span>} />
              {brands.map((b) => (
                <Bar key={b.shortName} dataKey={b.shortName} fill={b.color} radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey={b.shortName}
                    position="top"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => {
                      const n = Number(v);
                      if (!n) return "";
                      return `${(n / 1_000_000).toFixed(0)}백만`;
                    }}
                    style={{ fontSize: 9, fill: "rgba(255,255,255,0.55)", fontWeight: 600 }}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>데이터가 없습니다.</p>
        )}
      </div>

      {/* 브랜드별 총 매출 바 차트 */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
        <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>브랜드별 총 매출 비교</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 80, left: 8, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [formatKRWFull(Number(v)), "매출"]}
              contentStyle={{ backgroundColor: "#252739", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: "right", formatter: (v: any) => formatKRW(Number(v)), fill: "rgba(255,255,255,0.5)", fontSize: 11 }}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
