import { Suspense } from "react";
import { getSalesData, SalesRow } from "@/lib/sheets";
import { formatKRW } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import MonthlyChart from "@/components/MonthlyChart";
import ChannelChart from "@/components/ChannelChart";
import CategoryPie from "@/components/CategoryPie";
import WeeklyTrendChart from "@/components/WeeklyTrendChart";
import TopMenuChart from "@/components/TopMenuChart";
import ChannelFilter from "@/components/ChannelFilter";
import NavTabs from "@/components/NavTabs";

export const revalidate = 3600;

function processRaw(rows: SalesRow[], channelFilter: string) {
  const filtered =
    channelFilter === "전체"
      ? rows
      : rows.filter((r) => r.채널구분 === channelFilter);

  const totalSales = filtered.reduce((s, r) => s + r.매출액, 0);
  const totalOrders = filtered.reduce((s, r) => s + r.수량, 0);
  const avgPrice = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // 전월 성장률
  const months = [...new Set(rows.map((r) => r.월))].sort((a, b) => a - b);
  const lastMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];
  const lastSales = filtered
    .filter((r) => r.월 === lastMonth)
    .reduce((s, r) => s + r.매출액, 0);
  const prevSales = filtered
    .filter((r) => r.월 === prevMonth)
    .reduce((s, r) => s + r.매출액, 0);
  const growthRate =
    prevSales > 0 ? ((lastSales - prevSales) / prevSales) * 100 : 0;

  // 월별 매출
  const monthlyMap: Record<number, number> = {};
  filtered.forEach((r) => {
    monthlyMap[r.월] = (monthlyMap[r.월] ?? 0) + r.매출액;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([m, v]) => ({ month: `${m}월`, value: v }));

  // 채널별 매출
  const channelMap: Record<string, number> = {};
  filtered.forEach((r) => {
    channelMap[r.채널구분] = (channelMap[r.채널구분] ?? 0) + r.매출액;
  });
  const channelData = Object.entries(channelMap).map(([channel, value]) => ({
    channel,
    value,
  }));

  // 카테고리별 매출
  const catMap: Record<string, number> = {};
  filtered.forEach((r) => {
    catMap[r.카테고리] = (catMap[r.카테고리] ?? 0) + r.매출액;
  });
  const categoryData = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([category, value]) => ({ category, value }));

  // 주차별 채널 트렌드
  const weekChannels = [...new Set(filtered.map((r) => r.채널구분))];
  const weekMap: Record<string, Record<string, number>> = {};
  filtered.forEach((r) => {
    if (!weekMap[r.주차]) weekMap[r.주차] = {};
    weekMap[r.주차][r.채널구분] = (weekMap[r.주차][r.채널구분] ?? 0) + r.매출액;
  });
  const weeklyData = Object.entries(weekMap).map(([week, chMap]) => ({
    week,
    ...chMap,
  }));

  // TOP 10 메뉴
  const menuMap: Record<string, { sales: number; orders: number }> = {};
  filtered.forEach((r) => {
    if (!menuMap[r.메뉴명]) menuMap[r.메뉴명] = { sales: 0, orders: 0 };
    menuMap[r.메뉴명].sales += r.매출액;
    menuMap[r.메뉴명].orders += r.수량;
  });
  const topMenuData = Object.entries(menuMap)
    .sort(([, a], [, b]) => b.sales - a.sales)
    .slice(0, 20)
    .map(([menu, { sales, orders }]) => ({ menu, value: sales, orders }));

  return {
    totalSales,
    totalOrders,
    avgPrice,
    growthRate,
    monthlyData,
    channelData,
    categoryData,
    weeklyData,
    weekChannels,
    topMenuData,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { channel } = await searchParams;
  const channelFilter = channel ?? "전체";

  let rows: SalesRow[] = [];
  let error = "";
  try {
    rows = await getSalesData();
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.";
  }

  const {
    totalSales,
    totalOrders,
    avgPrice,
    growthRate,
    monthlyData,
    channelData,
    categoryData,
    weeklyData,
    weekChannels,
    topMenuData,
  } = processRaw(rows, channelFilter);

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#13141F" }}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <NavTabs />
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#00CFAA" }}
            >
              Sales Dashboard
            </span>
            <h1
              className="mt-1 text-2xl font-bold"
              style={{ color: "rgba(255,255,255,0.87)" }}
            >
              바질클럽 매출 현황
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              2026 Q1
            </p>
          </div>
        </div>
        <Suspense>
          <ChannelFilter />
        </Suspense>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-400">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="총 매출" value={formatKRW(totalSales)} />
        <KpiCard title="총 주문수" value={`${totalOrders.toLocaleString()}건`} />
        <KpiCard title="평균 단가" value={formatKRW(avgPrice)} />
        <KpiCard
          title="전월 성장률"
          value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`}
          trend={growthRate >= 0 ? "positive" : "negative"}
        />
      </div>

      {/* Monthly Chart */}
      <div className="mb-6">
        <MonthlyChart data={monthlyData} />
      </div>

      {/* Channel + Category */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChannelChart data={channelData} />
        <CategoryPie data={categoryData} />
      </div>

      {/* Weekly Trend */}
      <div className="mb-6">
        <WeeklyTrendChart data={weeklyData} channels={weekChannels} />
      </div>

      {/* Top 10 Menu */}
      <TopMenuChart data={topMenuData} />
    </main>
  );
}
