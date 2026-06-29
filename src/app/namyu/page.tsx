import { getNamyuData, getNamyuAdCost, NamyuRow, AdCostRow } from "@/lib/sheets";
import NavTabs from "@/components/NavTabs";
import NamyuDashboardClient from "@/components/NamyuDashboardClient";

export const revalidate = 3600;

const TARGETS_2026: Record<number, number> = {
  7: 350_000_000,
  8: 300_000_000,
  9: 400_000_000,
  10: 450_000_000,
  11: 500_000_000,
  12: 550_000_000,
};

const SEASON_LABELS: Record<number, string> = {
  1: "보충 성수기", 2: "보충 성수기", 3: "선케어 개막",
  4: "선케어 성수기", 5: "선케어 피크", 6: "선케어 마무리",
  7: "전카테고리 비수기", 8: "전카테고리 비수기", 9: "보충 개막",
  10: "보충 성수기", 11: "보충 성수기", 12: "보충 피크",
};

// 2025년 월별 실적 (시트에 없으므로 하드코딩)
const PREV_YEAR_2025: Record<number, number> = {
  1: 155_584_540,
  2: 141_960_470,
  3: 141_826_360,
  4: 141_739_630,
  5: 152_590_760,
  6: 141_413_160,
  7: 138_858_990,
  8: 145_193_720,
  9: 184_513_950,
  10: 200_646_490,
  11: 188_081_780,
  12: 246_027_420,
};

export default async function NamyuPage() {
  let rows: NamyuRow[] = [];
  let adCosts: AdCostRow[] = [];
  let error = "";
  try {
    [rows, adCosts] = await Promise.all([getNamyuData(), getNamyuAdCost()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러올 수 없습니다.";
  }

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ backgroundColor: "#13141F" }}>
      <div className="mb-8 flex items-center gap-4">
        <NavTabs />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#00CFAA" }}>Sales Dashboard</span>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>남유에프엔씨 쿠팡 매출 현황</h1>
        </div>
      </div>
      {error && <div className="mb-6 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-400">{error}</div>}
      <NamyuDashboardClient
        rows={rows}
        adCosts={adCosts}
        targets={TARGETS_2026}
        seasonLabels={SEASON_LABELS}
        prevYearSales={PREV_YEAR_2025}
        prevYear={2025}
        curYear={2026}
      />
    </main>
  );
}
