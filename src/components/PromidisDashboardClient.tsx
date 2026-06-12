"use client";

import { useState, useMemo } from "react";
import { PromidisFullRow, AdCostRow } from "@/lib/sheets";
import { formatKRW, formatKRWShort } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import YearCompareChart from "@/components/YearCompareChart";
import CategoryPie from "@/components/CategoryPie";
import ProductMonthlyTable, { ProductMonthlyRow } from "@/components/ProductMonthlyTable";

type Props = { rows: PromidisFullRow[]; adCosts: AdCostRow[] };

export default function PromidisDashboardClient({ rows, adCosts }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const rows25 = rows.filter((r) => r.연도 === 2025);
  const rows26 = rows.filter((r) => r.연도 === 2026);

  // KPI
  const total25 = rows25.reduce((s, r) => s + r.매출, 0);
  const total26 = rows26.reduce((s, r) => s + r.매출, 0);
  const growthRate = total25 > 0 ? ((total26 - total25) / total25) * 100 : 0;
  const totalAdCost = adCosts.reduce((s, r) => s + r.광고비, 0);
  const adRatio = total26 > 0 ? (totalAdCost / total26) * 100 : 0;

  // 연도 비교 월별 매출 차트
  const yearCompareData = useMemo(() => {
    const map: Record<number, { "2025": number; "2026": number }> = {};
    for (let m = 1; m <= 12; m++) map[m] = { "2025": 0, "2026": 0 };
    rows.forEach((r) => {
      if (r.월 >= 1 && r.월 <= 12) map[r.월][r.연도 === 2025 ? "2025" : "2026"] += r.매출;
    });
    return Object.entries(map)
      .filter(([, v]) => v["2025"] > 0 || v["2026"] > 0)
      .map(([m, v]) => ({ month: `${m}월`, ...v })) as { month: string; "2025": number; "2026": number }[];
  }, [rows]);

  // 선택 월 기준 필터
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
    // 2026 전체 기준
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
        <KpiCard title="총 광고비 (2026)" value={formatKRW(totalAdCost)} />
        <KpiCard title="광고비 비율" value={`${adRatio.toFixed(1)}%`} trend={adRatio < 30 ? "positive" : "negative"} />
        <KpiCard title="2026 주문수" value={`${rows26.reduce((s, r) => s + r.주문수, 0).toLocaleString()}건`} />
      </div>

      {/* 월 선택 버튼 */}
      <div className="mb-2 flex flex-wrap gap-1">
        {yearCompareData.map((d) => {
          const monthNum = parseInt(d.month);
          const active = selectedMonth === monthNum;
          return (
            <button key={d.month} onClick={() => setSelectedMonth(active ? null : monthNum)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
              style={active
                ? { background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }
                : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              {d.month}
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

      {/* 2025 vs 2026 월별 비교 차트 */}
      <div className="mb-6">
        <YearCompareChart data={yearCompareData} />
      </div>

      {/* 선택 월 안내 */}
      {selectedMonth && (
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg px-3 py-1 text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }}>
            2026년 {selectedMonth}월 필터 적용 중
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>카테고리 · TOP 20 반영됨</span>
        </div>
      )}

      {/* 카테고리 + TOP 20 */}
      <div className="mb-6">
        <CategoryPie data={categoryData} />
      </div>
      <ProductMonthlyTable data={productMonthlyData} title="품목별 월별 판매 수량 (2026)" />
    </>
  );
}
