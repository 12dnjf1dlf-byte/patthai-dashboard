import { getCoupangData, getNamyuData, getNutralabData, getPromidisFullData } from "@/lib/sheets";
import NavTabs from "@/components/NavTabs";
import SummaryDashboardClient, { BrandSummary } from "@/components/SummaryDashboardClient";

export const revalidate = 3600;

function parseMonth(s: string) {
  const m = s.match(/(\d+)월/);
  return m ? Number(m[1]) : 0;
}

export default async function SummaryPage() {
  const [coupangResult, namyuResult, nutralabResult, promidisResult] = await Promise.allSettled([
    getCoupangData(),
    getNamyuData(),
    getNutralabData(),
    getPromidisFullData(),
  ]);

  const coupangRows = coupangResult.status === "fulfilled" ? coupangResult.value : [];
  const namyuRows = namyuResult.status === "fulfilled" ? namyuResult.value : [];
  const nutralabRows = nutralabResult.status === "fulfilled" ? nutralabResult.value : [];
  const promidisRows = (promidisResult.status === "fulfilled" ? promidisResult.value : []).filter((r) => r.연도 === 2026);

  // 바질클럽 쿠팡
  const cMonthly: Record<number, number> = {};
  coupangRows.forEach((r) => { const m = parseMonth(r.월); if (m) cMonthly[m] = (cMonthly[m] ?? 0) + r.매출; });

  // 남유에프엔씨 쿠팡
  const nMonthly: Record<number, number> = {};
  namyuRows.forEach((r) => { nMonthly[r.월] = (nMonthly[r.월] ?? 0) + r.매출; });

  // 뉴트라랩 쿠팡
  const nlMonthly: Record<number, number> = {};
  nutralabRows.forEach((r) => { nlMonthly[r.월] = (nlMonthly[r.월] ?? 0) + r.매출; });

  // 프롬디스 쿠팡 (2026)
  const pMonthly: Record<number, number> = {};
  promidisRows.forEach((r) => { pMonthly[r.월] = (pMonthly[r.월] ?? 0) + r.매출; });

  function toMonthly(map: Record<number, number>) {
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([m, sales]) => ({ month: Number(m), sales }));
  }

  const brands: BrandSummary[] = [
    {
      name: "바질클럽 쿠팡",
      shortName: "바질클럽",
      totalSales: coupangRows.reduce((s, r) => s + r.매출, 0),
      totalOrders: coupangRows.reduce((s, r) => s + r.주문수, 0),
      monthly: toMonthly(cMonthly),
      color: "#7B70EE",
      href: "/coupang",
    },
    {
      name: "남유에프엔씨 쿠팡",
      shortName: "남유에프엔씨",
      totalSales: namyuRows.reduce((s, r) => s + r.매출, 0),
      totalOrders: namyuRows.reduce((s, r) => s + r.주문수, 0),
      monthly: toMonthly(nMonthly),
      color: "#00CFAA",
      href: "/namyu",
    },
    {
      name: "뉴트라랩 쿠팡",
      shortName: "뉴트라랩",
      totalSales: nutralabRows.reduce((s, r) => s + r.매출, 0),
      totalOrders: nutralabRows.reduce((s, r) => s + r.주문수, 0),
      monthly: toMonthly(nlMonthly),
      color: "#F59E0B",
      href: "/nutralap",
    },
    {
      name: "프롬디스 쿠팡",
      shortName: "프롬디스",
      totalSales: promidisRows.reduce((s, r) => s + r.매출, 0),
      totalOrders: promidisRows.reduce((s, r) => s + r.주문수, 0),
      monthly: toMonthly(pMonthly),
      color: "#FF6B6B",
      href: "/promidis",
    },
  ];

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#13141F" }}>
      <div className="mb-8 flex items-center gap-4">
        <NavTabs />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#00CFAA" }}>Sales Dashboard</span>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>전체 브랜드 요약</h1>
        </div>
      </div>
      <SummaryDashboardClient brands={brands} />
    </main>
  );
}
