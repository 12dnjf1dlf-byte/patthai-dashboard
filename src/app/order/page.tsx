import { getNamyuOrderData, NamyuOrderRow } from "@/lib/sheets";
import { formatKRW } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import YearCompareChart from "@/components/YearCompareChart";
import YearCompareQtyChart from "@/components/YearCompareQtyChart";
import ProductCompareTable from "@/components/ProductCompareTable";
import NavTabs from "@/components/NavTabs";

export const revalidate = 3600;

function processRaw(rows: NamyuOrderRow[]) {
  const rows25 = rows.filter((r) => r.연도 === 2025);
  const rows26 = rows.filter((r) => r.연도 === 2026);

  const total25 = rows25.reduce((s, r) => s + r.매출, 0);
  const total26 = rows26.reduce((s, r) => s + r.매출, 0);
  const qty25 = rows25.reduce((s, r) => s + r.수량, 0);
  const qty26 = rows26.reduce((s, r) => s + r.수량, 0);
  const growthRate = total25 > 0 ? ((total26 - total25) / total25) * 100 : 0;

  // 월별 매출 비교
  const salesMap: Record<number, { "2025": number; "2026": number }> = {};
  for (let m = 1; m <= 12; m++) salesMap[m] = { "2025": 0, "2026": 0 };
  rows.forEach((r) => {
    if (r.월 >= 1 && r.월 <= 12) {
      salesMap[r.월][r.연도 === 2025 ? "2025" : "2026"] += r.매출;
    }
  });
  const monthlyData = Object.entries(salesMap)
    .filter(([, v]) => v["2025"] > 0 || v["2026"] > 0)
    .map(([m, v]) => ({ month: `${m}월`, ...v })) as {
      month: string;
      "2025": number;
      "2026": number;
    }[];

  // 월별 수량 비교
  const qtyMap: Record<number, { "2025": number; "2026": number }> = {};
  for (let m = 1; m <= 12; m++) qtyMap[m] = { "2025": 0, "2026": 0 };
  rows.forEach((r) => {
    if (r.월 >= 1 && r.월 <= 12) {
      qtyMap[r.월][r.연도 === 2025 ? "2025" : "2026"] += r.수량;
    }
  });
  const qtyData = Object.entries(qtyMap)
    .filter(([, v]) => v["2025"] > 0 || v["2026"] > 0)
    .map(([m, v]) => ({ month: `${m}월`, ...v })) as {
      month: string;
      "2025": number;
      "2026": number;
    }[];

  // 품목별 연도 비교
  const productMap: Record<string, { qty25: number; qty26: number; months25: Set<number>; months26: Set<number> }> = {};
  rows.forEach((r) => {
    if (!productMap[r.상품명]) productMap[r.상품명] = { qty25: 0, qty26: 0, months25: new Set(), months26: new Set() };
    if (r.연도 === 2025) {
      productMap[r.상품명].qty25 += r.수량;
      productMap[r.상품명].months25.add(r.월);
    } else {
      productMap[r.상품명].qty26 += r.수량;
      productMap[r.상품명].months26.add(r.월);
    }
  });
  const productTableData = Object.entries(productMap)
    .sort(([, a], [, b]) => (b.qty25 + b.qty26) - (a.qty25 + a.qty26))
    .map(([name, { qty25: q25, qty26: q26, months25, months26 }]) => ({
      name,
      qty25: q25,
      qty26: q26,
      avg25: months25.size > 0 ? q25 / months25.size : 0,
      avg26: months26.size > 0 ? q26 / months26.size : 0,
    }));

  return { total25, total26, qty25, qty26, growthRate, monthlyData, qtyData, productTableData };
}

export default async function OrderPage() {
  let rows: NamyuOrderRow[] = [];
  let error = "";
  try {
    rows = await getNamyuOrderData();
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.";
  }

  const { total25, total26, qty25, qty26, growthRate, monthlyData, qtyData, productTableData } =
    processRaw(rows);

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
            남유쿠팡 발주 현황
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>2025 vs 2026</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-400">
          {error}
        </div>
      )}

      {/* KPI */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="2025 총 매출" value={formatKRW(total25)} />
        <KpiCard title="2026 총 매출" value={formatKRW(total26)} />
        <KpiCard title="전년 대비 성장률" value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`} trend={growthRate >= 0 ? "positive" : "negative"} />
        <KpiCard title="수량 (25 / 26)" value={`${qty25.toLocaleString()} / ${qty26.toLocaleString()}`} />
      </div>

      {/* 월별 매출 비교 */}
      <div className="mb-6">
        <YearCompareChart data={monthlyData} />
      </div>

      {/* 월별 수량 비교 */}
      <div className="mb-6">
        <YearCompareQtyChart data={qtyData} />
      </div>

      {/* 품목별 수량 비교 */}
      <ProductCompareTable data={productTableData} />
    </main>
  );
}
