"use client";

import { useState, useMemo } from "react";
import { PromidisFullRow, PromidisAdCostFullRow } from "@/lib/sheets";
import { formatKRW } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import CategoryPie from "@/components/CategoryPie";
import ProductMonthlyTable, { ProductMonthlyRow } from "@/components/ProductMonthlyTable";
import PromidisMonthlyChart, { PromidisChartItem } from "@/components/PromidisMonthlyChart";

type Props = { rows: PromidisFullRow[]; adCostsFull: PromidisAdCostFullRow[] };

export default function PromidisDashboardClient({ rows, adCostsFull }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const rows25 = rows.filter((r) => r.연도 === 2025);
  const rows26 = rows.filter((r) => r.연도 === 2026);

  // KPI
  const total25 = rows25.reduce((s, r) => s + r.매출, 0);
  const total26 = rows26.reduce((s, r) => s + r.매출, 0);
  const totalAll = total25 + total26;
  const growthRate = total25 > 0 ? ((total26 - total25) / total25) * 100 : 0;

  // 광고비 연도별
  const adCost25Total = adCostsFull.filter((r) => r.연도 === 2025).reduce((s, r) => s + r.광고비, 0);
  const adCost26Total = adCostsFull.filter((r) => r.연도 === 2026).reduce((s, r) => s + r.광고비, 0);
  const totalAdCost = adCost25Total + adCost26Total;
  const adRatio = totalAll > 0 ? (totalAdCost / totalAll) * 100 : 0;

  // 광고비 월별 맵
  const adCost25ByMonth = useMemo(() => {
    const map: Record<number, number> = {};
    adCostsFull.filter((r) => r.연도 === 2025).forEach((r) => { map[r.월] = r.광고비; });
    return map;
  }, [adCostsFull]);

  const adCost26ByMonth = useMemo(() => {
    const map: Record<number, number> = {};
    adCostsFull.filter((r) => r.연도 === 2026).forEach((r) => { map[r.월] = r.광고비; });
    return map;
  }, [adCostsFull]);

  // 차트 데이터: 1~12월 전체
  const chartData = useMemo((): PromidisChartItem[] => {
    const map25: Record<number, number> = {};
    const map26: Record<number, number> = {};
    rows25.forEach((r) => { map25[r.월] = (map25[r.월] ?? 0) + r.매출; });
    rows26.forEach((r) => { map26[r.월] = (map26[r.월] ?? 0) + r.매출; });

    const allMonths = [...new Set([
      ...Object.keys(map25).map(Number),
      ...Object.keys(map26).map(Number),
      ...adCostsFull.map((r) => r.월),
    ])].sort((a, b) => a - b);

    return allMonths.map((m) => {
      const sales25 = map25[m] ?? 0;
      const adCost25 = adCost25ByMonth[m] ?? 0;
      const net25 = Math.max(0, sales25 - adCost25);

      const sales26 = map26[m] ?? 0;
      const adCost26 = adCost26ByMonth[m] ?? 0;
      const net26 = Math.max(0, sales26 - adCost26);

      return {
        month: `${m}월`,
        sales25, adCost25, net25,
        adRatio25: sales25 > 0 ? (adCost25 / sales25) * 100 : 0,
        sales26, adCost26, net26,
        adRatio26: sales26 > 0 ? (adCost26 / sales26) * 100 : 0,
      };
    });
  }, [rows25, rows26, adCost25ByMonth, adCost26ByMonth, adCostsFull]);

  // 월 버튼 목록
  const monthList = useMemo(() => chartData.map((d) => Number(d.month.replace("월", ""))), [chartData]);

  // 선택 월 기준 필터 (카테고리 파이 / 상품 테이블)
  const filtered = useMemo(() => {
    if (!selectedMonth) return rows26;
    return rows26.filter((r) => r.월 === selectedMonth);
  }, [rows26, selectedMonth]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => { map[r.카테고리] = (map[r.카테고리] ?? 0) + r.매출; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([category, value]) => ({ category, value }));
  }, [filtered]);

  const productMonthlyData = useMemo((): ProductMonthlyRow[] => {
    const map: Record<string, Record<number, number>> = {};
    rows26.forEach((r) => {
      if (!map[r.상품명]) map[r.상품명] = {};
      map[r.상품명][r.월] = (map[r.상품명][r.월] ?? 0) + r.주문수;
    });
    return Object.entries(map)
      .map(([name, monthly]) => ({ name, monthly, total: Object.values(monthly).reduce((s, v) => s + v, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [rows26]);

  return (
    <>
      {/* KPI */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="2025 총 매출" value={formatKRW(total25)} />
        <KpiCard title="2026 총 매출" value={formatKRW(total26)} />
        <KpiCard title="전년 대비 성장률" value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`} trend={growthRate >= 0 ? "positive" : "negative"} />
        <KpiCard title="2025 광고비" value={formatKRW(adCost25Total)} />
        <KpiCard title="2026 광고비" value={formatKRW(adCost26Total)} />
        <KpiCard title="합산 광고비 비율" value={`${adRatio.toFixed(1)}%`} trend={adRatio < 30 ? "positive" : "negative"} />
      </div>

      {/* 월 선택 버튼 */}
      <div className="mb-2 flex flex-wrap gap-1">
        {monthList.map((m) => {
          const active = selectedMonth === m;
          return (
            <button key={m} onClick={() => setSelectedMonth(active ? null : m)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
              style={active
                ? { background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }
                : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              {m}월
            </button>
          );
        })}
        {selectedMonth && (
          <button onClick={() => setSelectedMonth(null)} className="rounded-lg px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
            전체
          </button>
        )}
      </div>

      {/* 차트 + 테이블 */}
      <div className="mb-6">
        <PromidisMonthlyChart data={chartData} selectedMonth={selectedMonth} onMonthClick={setSelectedMonth} />
      </div>

      {/* 선택 월 안내 */}
      {selectedMonth && (
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg px-3 py-1 text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }}>
            2026년 {selectedMonth}월 필터 적용 중
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>카테고리 반영됨</span>
        </div>
      )}

      {/* 카테고리 */}
      <div className="mb-6">
        <CategoryPie data={categoryData} />
      </div>

      <ProductMonthlyTable data={productMonthlyData} title="품목별 월별 판매 수량 (2026)" />
    </>
  );
}
