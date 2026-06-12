"use client";

import { useState, useMemo } from "react";
import { CoupangRow, AdCostRow } from "@/lib/sheets";
import { formatKRW } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import CoupangMonthlyChart from "@/components/CoupangMonthlyChart";
import ChannelChart from "@/components/ChannelChart";
import CategoryPie from "@/components/CategoryPie";
import WeeklyTrendChart from "@/components/WeeklyTrendChart";
import TopMenuChart from "@/components/TopMenuChart";

type Props = { rows: CoupangRow[]; adCosts: AdCostRow[] };

function parseMonth(월str: string): number {
  const m = 월str.match(/(\d+)월/);
  return m ? Number(m[1]) : 0;
}

export default function CoupangDashboardClient({ rows, adCosts }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const filtered = useMemo(
    () => selectedMonth ? rows.filter((r) => r.월 === selectedMonth) : rows,
    [rows, selectedMonth]
  );

  // 월별 차트 데이터 (항상 전체 — 그래프는 전체 월 표시)
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<number, number> = {};
    rows.forEach((r) => { const m = parseMonth(r.월); if (m) monthlyMap[m] = (monthlyMap[m] ?? 0) + r.매출; });
    const adCostMap: Record<number, number> = {};
    adCosts.forEach((r) => { const m = parseMonth(r.월); if (m) adCostMap[m] = r.광고비; });
    return Object.entries(monthlyMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([m, 매출]) => {
        const 광고비 = adCostMap[Number(m)] ?? 0;
        return { month: `${m}월`, 매출, 광고비, 광고비비중: 매출 > 0 ? (광고비 / 매출) * 100 : 0 };
      });
  }, [rows, adCosts]);

  // 선택 월 기준 KPI
  const totalSales = filtered.reduce((s, r) => s + r.매출, 0);
  const totalOrders = filtered.reduce((s, r) => s + r.주문수, 0);
  const avgPrice = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  const monthNums = [...new Set(rows.map((r) => parseMonth(r.월)))].filter(Boolean).sort((a, b) => a - b);
  const growthRate = useMemo(() => {
    if (selectedMonth) {
      const cur = parseMonth(selectedMonth);
      const prev = cur - 1;
      const curS = rows.filter((r) => parseMonth(r.월) === cur).reduce((s, r) => s + r.매출, 0);
      const prevS = rows.filter((r) => parseMonth(r.월) === prev).reduce((s, r) => s + r.매출, 0);
      return prevS > 0 ? ((curS - prevS) / prevS) * 100 : 0;
    }
    const last = monthNums[monthNums.length - 1];
    const prev = monthNums[monthNums.length - 2];
    const lastS = rows.filter((r) => parseMonth(r.월) === last).reduce((s, r) => s + r.매출, 0);
    const prevS = rows.filter((r) => parseMonth(r.월) === prev).reduce((s, r) => s + r.매출, 0);
    return prevS > 0 ? ((lastS - prevS) / prevS) * 100 : 0;
  }, [rows, selectedMonth, monthNums]);

  // 하단 차트 데이터 (선택 월 기준 필터링)
  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => { map[r.판매방식] = (map[r.판매방식] ?? 0) + r.매출; });
    return Object.entries(map).map(([channel, value]) => ({ channel, value }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => { map[r.카테고리] = (map[r.카테고리] ?? 0) + r.매출; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([category, value]) => ({ category, value }));
  }, [filtered]);

  const methods = useMemo(() => [...new Set(rows.map((r) => r.판매방식))], [rows]);
  const weeklyData = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    filtered.forEach((r) => {
      const m = parseMonth(r.월);
      if (!m) return;
      const key = `${m}월`;
      if (!map[key]) map[key] = {};
      map[key][r.판매방식] = (map[key][r.판매방식] ?? 0) + r.매출;
    });
    return Object.entries(map).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([week, ch]) => ({ week, ...ch }));
  }, [filtered]);

  const topMenuData = useMemo(() => {
    const map: Record<string, { sales: number; orders: number }> = {};
    filtered.forEach((r) => {
      if (!map[r.상품명]) map[r.상품명] = { sales: 0, orders: 0 };
      map[r.상품명].sales += r.매출;
      map[r.상품명].orders += r.주문수;
    });
    return Object.entries(map).sort(([, a], [, b]) => b.sales - a.sales).slice(0, 20)
      .map(([menu, { sales, orders }]) => ({ menu, value: sales, orders }));
  }, [filtered]);

  return (
    <>
      {/* 월 선택 표시 */}
      {selectedMonth && (
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg px-3 py-1 text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }}>
            {selectedMonth} 필터 적용 중
          </span>
          <button onClick={() => setSelectedMonth(null)} className="rounded-lg px-3 py-1 text-xs font-medium" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            전체 보기
          </button>
        </div>
      )}

      {/* KPI */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="총 매출" value={formatKRW(totalSales)} />
        <KpiCard title="총 주문수" value={`${totalOrders.toLocaleString()}건`} />
        <KpiCard title="평균 단가" value={formatKRW(avgPrice)} />
        <KpiCard title={selectedMonth ? `전월 대비 성장률` : "전월 성장률"} value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`} trend={growthRate >= 0 ? "positive" : "negative"} />
      </div>

      {/* 월별 차트 (클릭 가능) */}
      <div className="mb-6">
        <CoupangMonthlyChart data={monthlyData} onMonthClick={setSelectedMonth} selectedMonth={selectedMonth} />
      </div>

      {/* 판매방식 + 카테고리 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChannelChart data={methodData} />
        <CategoryPie data={categoryData} />
      </div>

      {/* 판매방식별 트렌드 */}
      <div className="mb-6">
        <WeeklyTrendChart data={weeklyData} channels={methods} />
      </div>

      {/* TOP 20 상품 */}
      <TopMenuChart data={topMenuData} />
    </>
  );
}
