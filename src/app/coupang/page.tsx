import { getCoupangData, CoupangRow } from "@/lib/sheets";
import { formatKRW, CATEGORY_COLORS } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import MonthlyChart from "@/components/MonthlyChart";
import ChannelChart from "@/components/ChannelChart";
import CategoryPie from "@/components/CategoryPie";
import WeeklyTrendChart from "@/components/WeeklyTrendChart";
import TopMenuChart from "@/components/TopMenuChart";
import NavTabs from "@/components/NavTabs";

export const revalidate = 3600;

const SALES_METHOD_COLORS: Record<string, string> = {
  판매자배송: "#7B70EE",
  로켓그로스: "#00CFAA",
  로켓배송: "#4A9EFF",
};

function parseMonth(월str: string): number {
  // "2026년 4월" -> 4
  const match = 월str.match(/(\d+)월/);
  return match ? Number(match[1]) : 0;
}

function processRaw(rows: CoupangRow[]) {
  const totalSales = rows.reduce((s, r) => s + r.매출, 0);
  const totalOrders = rows.reduce((s, r) => s + r.주문수, 0);
  const avgPrice = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // 전월 성장률
  const monthNums = [...new Set(rows.map((r) => parseMonth(r.월)))].filter(Boolean).sort((a, b) => a - b);
  const lastMonth = monthNums[monthNums.length - 1];
  const prevMonth = monthNums[monthNums.length - 2];
  const lastSales = rows.filter((r) => parseMonth(r.월) === lastMonth).reduce((s, r) => s + r.매출, 0);
  const prevSales = rows.filter((r) => parseMonth(r.월) === prevMonth).reduce((s, r) => s + r.매출, 0);
  const growthRate = prevSales > 0 ? ((lastSales - prevSales) / prevSales) * 100 : 0;

  // 월별 매출
  const monthlyMap: Record<number, number> = {};
  rows.forEach((r) => {
    const m = parseMonth(r.월);
    if (m) monthlyMap[m] = (monthlyMap[m] ?? 0) + r.매출;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([m, v]) => ({ month: `${m}월`, value: v }));

  // 판매방식별 매출
  const methodMap: Record<string, number> = {};
  rows.forEach((r) => {
    methodMap[r.판매방식] = (methodMap[r.판매방식] ?? 0) + r.매출;
  });
  const methodData = Object.entries(methodMap).map(([channel, value]) => ({ channel, value }));

  // 카테고리별 매출
  const catMap: Record<string, number> = {};
  rows.forEach((r) => {
    catMap[r.카테고리] = (catMap[r.카테고리] ?? 0) + r.매출;
  });
  const categoryData = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([category, value]) => ({ category, value }));

  // 판매방식별 월별 트렌드
  const methods = [...new Set(rows.map((r) => r.판매방식))];
  const weekMap: Record<string, Record<string, number>> = {};
  rows.forEach((r) => {
    const m = parseMonth(r.월);
    if (!m) return;
    const key = `${m}월`;
    if (!weekMap[key]) weekMap[key] = {};
    weekMap[key][r.판매방식] = (weekMap[key][r.판매방식] ?? 0) + r.매출;
  });
  const weeklyData = Object.entries(weekMap)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([week, chMap]) => ({ week, ...chMap }));

  // TOP 10 상품
  const productMap: Record<string, { sales: number; orders: number }> = {};
  rows.forEach((r) => {
    if (!productMap[r.상품명]) productMap[r.상품명] = { sales: 0, orders: 0 };
    productMap[r.상품명].sales += r.매출;
    productMap[r.상품명].orders += r.주문수;
  });
  const topMenuData = Object.entries(productMap)
    .sort(([, a], [, b]) => b.sales - a.sales)
    .slice(0, 10)
    .map(([menu, { sales, orders }]) => ({ menu, value: sales, orders }));

  return {
    totalSales,
    totalOrders,
    avgPrice,
    growthRate,
    monthlyData,
    methodData,
    categoryData,
    weeklyData,
    methods,
    topMenuData,
  };
}

export default async function CoupangPage() {
  let rows: CoupangRow[] = [];
  let error = "";
  try {
    rows = await getCoupangData();
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.";
  }

  const {
    totalSales,
    totalOrders,
    avgPrice,
    growthRate,
    monthlyData,
    methodData,
    categoryData,
    weeklyData,
    methods,
    topMenuData,
  } = processRaw(rows);

  // 판매방식 색상을 CHANNEL_COLORS 형식으로 override
  const methodColors = SALES_METHOD_COLORS;
  void methodColors;

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
              쿠팡 매출 현황
            </h1>
          </div>
        </div>
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

      {/* 판매방식별 + 카테고리 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChannelChart data={methodData} />
        <CategoryPie data={categoryData} />
      </div>

      {/* 판매방식별 월별 트렌드 */}
      <div className="mb-6">
        <WeeklyTrendChart data={weeklyData} channels={methods} />
      </div>

      {/* TOP 10 상품 */}
      <TopMenuChart data={topMenuData} />
    </main>
  );
}
