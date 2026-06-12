import { getCoupangAdData, AdRow } from "@/lib/sheets";
import { formatKRW, formatKRWShort } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import NavTabs from "@/components/NavTabs";
import AdTable from "@/components/AdTable";

export const revalidate = 3600;

function processAd(rows: AdRow[]) {
  const totalAdCost = rows.reduce((s, r) => s + r.광고비, 0);
  const totalSales14 = rows.reduce((s, r) => s + r.전환매출14, 0);
  const totalClicks = rows.reduce((s, r) => s + r.클릭수, 0);
  const totalImpressions = rows.reduce((s, r) => s + r.노출수, 0);
  const totalOrders14 = rows.reduce((s, r) => s + r.주문수14, 0);
  const roas = totalAdCost > 0 ? (totalSales14 / totalAdCost) * 100 : 0;
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // 캠페인별 집계
  const campaignMap: Record<string, { 광고비: number; 노출수: number; 클릭수: number; 전환매출14: number; 주문수14: number }> = {};
  rows.forEach((r) => {
    const key = r.캠페인명 || "(없음)";
    if (!campaignMap[key]) campaignMap[key] = { 광고비: 0, 노출수: 0, 클릭수: 0, 전환매출14: 0, 주문수14: 0 };
    campaignMap[key].광고비 += r.광고비;
    campaignMap[key].노출수 += r.노출수;
    campaignMap[key].클릭수 += r.클릭수;
    campaignMap[key].전환매출14 += r.전환매출14;
    campaignMap[key].주문수14 += r.주문수14;
  });

  const campaigns = Object.entries(campaignMap)
    .sort(([, a], [, b]) => b.광고비 - a.광고비)
    .map(([name, v]) => ({ name, ...v }));

  // 노출지면별 집계
  const zoneMap: Record<string, { 광고비: number; 클릭수: number; 노출수: number }> = {};
  rows.forEach((r) => {
    const key = r.광고노출지면 || "기타";
    if (!zoneMap[key]) zoneMap[key] = { 광고비: 0, 클릭수: 0, 노출수: 0 };
    zoneMap[key].광고비 += r.광고비;
    zoneMap[key].클릭수 += r.클릭수;
    zoneMap[key].노출수 += r.노출수;
  });

  const zones = Object.entries(zoneMap)
    .sort(([, a], [, b]) => b.광고비 - a.광고비)
    .map(([name, v]) => ({ name, ...v }));

  return { totalAdCost, totalSales14, totalClicks, totalImpressions, totalOrders14, roas, avgCtr, campaigns, zones, rows };
}

export default async function AdPage() {
  let rows: AdRow[] = [];
  let error = "";
  try {
    rows = await getCoupangAdData();
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.";
  }

  const { totalAdCost, totalSales14, totalClicks, totalImpressions, totalOrders14, roas, avgCtr, campaigns, zones } =
    processAd(rows);

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#13141F" }}>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <NavTabs />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#00CFAA" }}>
            Ad Dashboard
          </span>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>
            바질클럽 광고 현황
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>쿠팡 광고 성과 분석</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-400">
          {error}
        </div>
      )}

      {/* KPI */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard title="총 광고비" value={formatKRW(totalAdCost)} />
        <KpiCard title="총 전환매출(14일)" value={formatKRW(totalSales14)} />
        <KpiCard title="ROAS" value={`${roas.toFixed(0)}%`} trend={roas >= 100 ? "positive" : "negative"} />
        <KpiCard title="총 클릭수" value={totalClicks.toLocaleString()} />
        <KpiCard title="총 주문수(14일)" value={totalOrders14.toLocaleString()} />
      </div>

      {/* 요약 지표 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 캠페인별 */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
          <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>캠페인별 광고비</p>
          <div className="space-y-2">
            {campaigns.map((c, i) => {
              const pct = totalAdCost > 0 ? (c.광고비 / totalAdCost) * 100 : 0;
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate pr-2" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "60%" }} title={c.name}>{c.name}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{formatKRWShort(c.광고비)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7B70EE, #00CFAA)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 노출 지면별 */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
          <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>노출 지면별 광고비</p>
          <div className="space-y-2">
            {zones.map((z, i) => {
              const pct = totalAdCost > 0 ? (z.광고비 / totalAdCost) * 100 : 0;
              const ctr = z.노출수 > 0 ? (z.클릭수 / z.노출수) * 100 : 0;
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate pr-2" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "50%" }}>{z.name}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      {formatKRWShort(z.광고비)} · CTR {ctr.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4A9EFF, #00CFAA)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 상세 테이블 */}
      <AdTable data={rows} totalImpressions={totalImpressions} avgCtr={avgCtr} />
    </main>
  );
}
