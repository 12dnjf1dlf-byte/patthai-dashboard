"use client";

import { useState, useMemo } from "react";
import { NamyuRow, AdCostRow } from "@/lib/sheets";
import { formatKRW } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import CoupangMonthlyChart from "@/components/CoupangMonthlyChart";
import CategoryPie from "@/components/CategoryPie";
import ProductMonthlyTable, { ProductMonthlyRow } from "@/components/ProductMonthlyTable";

type Props = { rows: NamyuRow[]; adCosts: AdCostRow[] };

export default function NamyuDashboardClient({ rows, adCosts }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // 연도 분리 (최신 연도 = 현재, 이전 = 전년도)
  const allYears = useMemo(() => [...new Set(rows.map((r) => r.연도).filter(Boolean))].sort(), [rows]);
  const curYear = allYears[allYears.length - 1] ?? 2026;
  const prevYear = allYears.length >= 2 ? allYears[allYears.length - 2] : null;

  const curRows = useMemo(() => rows.filter((r) => r.연도 === curYear), [rows, curYear]);
  const prevRows = useMemo(() => prevYear ? rows.filter((r) => r.연도 === prevYear) : [], [rows, prevYear]);

  const filtered = useMemo(
    () => selectedMonth ? curRows.filter((r) => `${r.월}월` === selectedMonth) : curRows,
    [curRows, selectedMonth]
  );

  // 월별 차트 (현재 연도)
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<number, number> = {};
    curRows.forEach((r) => { monthlyMap[r.월] = (monthlyMap[r.월] ?? 0) + r.매출; });
    const adCostMap: Record<number, number> = {};
    adCosts.forEach((r) => {
      const m = r.월.match(/(\d+)월/);
      if (m) adCostMap[Number(m[1])] = r.광고비;
    });
    return Object.entries(monthlyMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([m, 매출]) => {
        const 광고비 = adCostMap[Number(m)] ?? 0;
        return { month: `${m}월`, 매출, 광고비, 광고비비중: 매출 > 0 ? (광고비 / 매출) * 100 : 0 };
      });
  }, [curRows, adCosts]);

  // 전년도 라인 데이터
  const prevYearLine = useMemo(() => {
    if (prevRows.length === 0) return undefined;
    const map: Record<number, number> = {};
    prevRows.forEach((r) => { map[r.월] = (map[r.월] ?? 0) + r.매출; });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([m, sales]) => ({ month: `${m}월`, sales }));
  }, [prevRows]);

  // KPI
  const totalSales = filtered.reduce((s, r) => s + r.매출, 0);
  const totalOrders = filtered.reduce((s, r) => s + r.주문수, 0);
  const avgPrice = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  const prevTotalSales = prevRows.reduce((s, r) => s + r.매출, 0);
  const yoyGrowth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : null;

  const growthRate = useMemo(() => {
    const cur = selectedMonth ? Number(selectedMonth.replace("월", "")) : null;
    const monthNums = [...new Set(curRows.map((r) => r.월))].filter(Boolean).sort((a, b) => a - b);
    const last = cur ?? monthNums[monthNums.length - 1];
    const prev = cur ? cur - 1 : monthNums[monthNums.length - 2];
    const lastS = curRows.filter((r) => r.월 === last).reduce((s, r) => s + r.매출, 0);
    const prevS = curRows.filter((r) => r.월 === prev).reduce((s, r) => s + r.매출, 0);
    return prevS > 0 ? ((lastS - prevS) / prevS) * 100 : 0;
  }, [curRows, selectedMonth]);

  // 카테고리
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => { map[r.카테고리] = (map[r.카테고리] ?? 0) + r.매출; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([category, value]) => ({ category, value }));
  }, [filtered]);

  // 품목별 월별 수량
  const productMonthlyData = useMemo((): ProductMonthlyRow[] => {
    const map: Record<string, Record<number, number>> = {};
    curRows.forEach((r) => {
      if (!map[r.상품명]) map[r.상품명] = {};
      map[r.상품명][r.월] = (map[r.상품명][r.월] ?? 0) + r.주문수;
    });
    return Object.entries(map)
      .map(([name, monthly]) => ({ name, monthly, total: Object.values(monthly).reduce((s, v) => s + v, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [curRows]);

  return (
    <>
      {selectedMonth && (
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg px-3 py-1 text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }}>
            {selectedMonth} 필터 적용 중
          </span>
          <button onClick={() => setSelectedMonth(null)} className="rounded-lg px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            전체 보기
          </button>
        </div>
      )}

      {/* KPI */}
      {prevYear ? (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard title={`${prevYear} 총 매출`} value={formatKRW(prevTotalSales)} />
          <KpiCard title={`${curYear} 총 매출`} value={formatKRW(totalSales)} />
          <KpiCard title="전년 대비 성장률" value={yoyGrowth !== null ? `${yoyGrowth >= 0 ? "+" : ""}${yoyGrowth.toFixed(1)}%` : "-"} trend={yoyGrowth !== null ? (yoyGrowth >= 0 ? "positive" : "negative") : undefined} />
          <KpiCard title="총 주문수" value={`${totalOrders.toLocaleString()}건`} />
          <KpiCard title="평균 단가" value={formatKRW(avgPrice)} />
          <KpiCard title="전월 성장률" value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`} trend={growthRate >= 0 ? "positive" : "negative"} />
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard title="총 매출" value={formatKRW(totalSales)} />
          <KpiCard title="총 주문수" value={`${totalOrders.toLocaleString()}건`} />
          <KpiCard title="평균 단가" value={formatKRW(avgPrice)} />
          <KpiCard title="전월 성장률" value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`} trend={growthRate >= 0 ? "positive" : "negative"} />
        </div>
      )}

      <div className="mb-6">
        <CoupangMonthlyChart
          data={monthlyData}
          onMonthClick={setSelectedMonth}
          selectedMonth={selectedMonth}
          prevYearLine={prevYearLine}
          prevYearLabel={prevYear ? `${prevYear}년` : "전년도"}
        />
      </div>

      <div className="mb-6">
        <CategoryPie data={categoryData} />
      </div>

      <ProductMonthlyTable data={productMonthlyData} />
    </>
  );
}
