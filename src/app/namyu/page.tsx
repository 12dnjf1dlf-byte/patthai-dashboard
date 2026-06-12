import { getNamyuData, getNamyuAdCost, NamyuRow, AdCostRow } from "@/lib/sheets";
import { formatKRW } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import CoupangMonthlyChart from "@/components/CoupangMonthlyChart";
import CategoryPie from "@/components/CategoryPie";
import TopMenuChart from "@/components/TopMenuChart";
import NavTabs from "@/components/NavTabs";

export const revalidate = 3600;

function parseAdMonth(월str: string): number {
  const match = 월str.match(/(\d+)월/);
  return match ? Number(match[1]) : 0;
}

function processRaw(rows: NamyuRow[], adCosts: AdCostRow[]) {
  const totalSales = rows.reduce((s, r) => s + r.매출, 0);
  const totalOrders = rows.reduce((s, r) => s + r.주문수, 0);
  const avgPrice = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // 전월 성장률
  const monthNums = [...new Set(rows.map((r) => r.월))].filter(Boolean).sort((a, b) => a - b);
  const lastMonth = monthNums[monthNums.length - 1];
  const prevMonth = monthNums[monthNums.length - 2];
  const lastSales = rows.filter((r) => r.월 === lastMonth).reduce((s, r) => s + r.매출, 0);
  const prevSales = rows.filter((r) => r.월 === prevMonth).reduce((s, r) => s + r.매출, 0);
  const growthRate = prevSales > 0 ? ((lastSales - prevSales) / prevSales) * 100 : 0;

  // 월별 매출
  const monthlyMap: Record<number, number> = {};
  rows.forEach((r) => {
    monthlyMap[r.월] = (monthlyMap[r.월] ?? 0) + r.매출;
  });

  // 광고비 맵
  const adCostMap: Record<number, number> = {};
  adCosts.forEach((r) => {
    const m = parseAdMonth(r.월);
    if (m) adCostMap[m] = r.광고비;
  });

  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([m, 매출]) => {
      const 광고비 = adCostMap[Number(m)] ?? 0;
      const 광고비비중 = 매출 > 0 ? (광고비 / 매출) * 100 : 0;
      return { month: `${m}월`, 매출, 광고비, 광고비비중 };
    });

  // 카테고리별 매출
  const catMap: Record<string, number> = {};
  rows.forEach((r) => {
    catMap[r.카테고리] = (catMap[r.카테고리] ?? 0) + r.매출;
  });
  const categoryData = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([category, value]) => ({ category, value }));

  // TOP 10 상품
  const productMap: Record<string, { sales: number; orders: number }> = {};
  rows.forEach((r) => {
    if (!productMap[r.상품명]) productMap[r.상품명] = { sales: 0, orders: 0 };
    productMap[r.상품명].sales += r.매출;
    productMap[r.상품명].orders += r.주문수;
  });
  const topMenuData = Object.entries(productMap)
    .sort(([, a], [, b]) => b.sales - a.sales)
    .slice(0, 20)
    .map(([menu, { sales, orders }]) => ({ menu, value: sales, orders }));

  return { totalSales, totalOrders, avgPrice, growthRate, monthlyData, categoryData, topMenuData };
}

export default async function NamyuPage() {
  let rows: NamyuRow[] = [];
  let adCosts: AdCostRow[] = [];
  let error = "";
  try {
    [rows, adCosts] = await Promise.all([getNamyuData(), getNamyuAdCost()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.";
  }

  const { totalSales, totalOrders, avgPrice, growthRate, monthlyData, categoryData, topMenuData } =
    processRaw(rows, adCosts);

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#13141F" }}>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <NavTabs />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#00CFAA" }}>
            Sales Dashboard
          </span>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>
            남유에프엔씨 쿠팡 매출 현황
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-400">
          {error}
        </div>
      )}

      {/* KPI */}
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

      {/* 월별 매출 + 광고비 */}
      <div className="mb-6">
        <CoupangMonthlyChart data={monthlyData} />
      </div>

      {/* 카테고리 */}
      <div className="mb-6">
        <CategoryPie data={categoryData} />
      </div>

      {/* TOP 10 상품 */}
      <TopMenuChart data={topMenuData} />
    </main>
  );
}
