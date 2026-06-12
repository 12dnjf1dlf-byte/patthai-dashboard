import { getCoupangData, getCoupangAdCost, CoupangRow, AdCostRow } from "@/lib/sheets";
import NavTabs from "@/components/NavTabs";
import CoupangDashboardClient from "@/components/CoupangDashboardClient";

export const revalidate = 3600;

export default async function CoupangPage() {
  let rows: CoupangRow[] = [];
  let adCosts: AdCostRow[] = [];
  let error = "";
  try {
    [rows, adCosts] = await Promise.all([getCoupangData(), getCoupangAdCost()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.";
  }

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#13141F" }}>
      <div className="mb-8 flex items-center gap-4">
        <NavTabs />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#00CFAA" }}>
            Sales Dashboard
          </span>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>
            바질클럽 쿠팡 매출 현황
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-400">
          {error}
        </div>
      )}

      <CoupangDashboardClient rows={rows} adCosts={adCosts} />
    </main>
  );
}
