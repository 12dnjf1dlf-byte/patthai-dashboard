"use client";

import { useState, useMemo } from "react";
import { NamyuRow, AdCostRow } from "@/lib/sheets";
import { formatKRW } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import CoupangMonthlyChart from "@/components/CoupangMonthlyChart";
import CategoryPie from "@/components/CategoryPie";
import ProductMonthlyTable, { ProductMonthlyRow } from "@/components/ProductMonthlyTable";

type Props = {
  rows: NamyuRow[];
  adCosts: AdCostRow[];
  targets?: Record<number, number>;
  seasonLabels?: Record<number, string>;
};

function formatOk(v: number) {
  if (v >= 1_0000_0000) return `${(v / 1_0000_0000).toFixed(2)}억`;
  if (v >= 100_0000) return `${(v / 100_0000).toFixed(1)}백만`;
  return `${(v / 1_0000).toFixed(0)}만`;
}

export default function NamyuDashboardClient({ rows, adCosts, targets, seasonLabels }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const allYears = useMemo(() => [...new Set(rows.map((r) => r.연도).filter(Boolean))].sort(), [rows]);
  const curYear = allYears[allYears.length - 1] ?? 2026;
  const prevYear = allYears.length >= 2 ? allYears[allYears.length - 2] : null;

  const curRows = useMemo(() => rows.filter((r) => r.연도 === curYear), [rows, curYear]);
  const prevRows = useMemo(() => prevYear ? rows.filter((r) => r.연도 === prevYear) : [], [rows, prevYear]);

  const filtered = useMemo(
    () => selectedMonth ? curRows.filter((r) => `${r.월}월` === selectedMonth) : curRows,
    [curRows, selectedMonth]
  );

  const actualByMonth = useMemo(() => {
    const map: Record<number, number> = {};
    curRows.forEach((r) => { map[r.월] = (map[r.월] ?? 0) + r.매출; });
    return map;
  }, [curRows]);

  const adCostMap = useMemo(() => {
    const map: Record<number, number> = {};
    adCosts.forEach((r) => {
      const m = r.월.match(/(\d+)월/);
      if (m) map[Number(m[1])] = r.광고비;
    });
    return map;
  }, [adCosts]);

  const monthlyData = useMemo(() => {
    const result: { month: string; 매출: number; 광고비: number; 광고비비중: number; isTarget?: boolean }[] = [];
    for (let m = 1; m <= 12; m++) {
      if (actualByMonth[m] !== undefined) {
        const 매출 = actualByMonth[m];
        const 광고비 = adCostMap[m] ?? 0;
        result.push({ month: `${m}월`, 매출, 광고비, 광고비비중: 매출 > 0 ? (광고비 / 매출) * 100 : 0 });
      } else if (targets?.[m]) {
        result.push({ month: `${m}월`, 매출: targets[m], 광고비: 0, 광고비비중: 0, isTarget: true });
      }
    }
    return result;
  }, [actualByMonth, adCostMap, targets]);

  const prevYearLine = useMemo(() => {
    if (prevRows.length === 0) return undefined;
    const map: Record<number, number> = {};
    prevRows.forEach((r) => { map[r.월] = (map[r.월] ?? 0) + r.매출; });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([m, sales]) => ({ month: `${m}월`, sales }));
  }, [prevRows]);

  const prevByMonth = useMemo(() => {
    const map: Record<number, number> = {};
    prevRows.forEach((r) => { map[r.월] = (map[r.월] ?? 0) + r.매출; });
    return map;
  }, [prevRows]);

  const totalSales = filtered.reduce((s, r) => s + r.매출, 0);
  const totalOrders = filtered.reduce((s, r) => s + r.주문수, 0);
  const avgPrice = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const prevTotalSales = prevRows.reduce((s, r) => s + r.매출, 0);
  const yoyGrowth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : null;

  const growthRate = useMemo(() => {
    const cur = selectedMonth ? Number(selectedMonth.replace("월", "")) : null;
    const monthNums = [...new Set(curRows.map((r) => r.월))].filter(Boolean).sort((a, b) => a - b);
    const last = cur ?? monthNums[monthNums.length - 1];
    const prev = cur ? cur - 1 : monthNums[monthNums.length - 2];
    const lastS = curRows.filter((r) => r.월 === last).reduce((s, r) => s + r.매출, 0);
    const prevS = curRows.filter((r) => r.월 === prev).reduce((s, r) => s + r.매출, 0);
    return prevS > 0 ? ((lastS - prevS) / prevS) * 100 : 0;
  }, [curRows, selectedMonth]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => { map[r.카테고리] = (map[r.카테고리] ?? 0) + r.매출; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([category, value]) => ({ category, value }));
  }, [filtered]);

  const productMonthlyData = useMemo((): ProductMonthlyRow[] => {
    const map: Record<string, Record<number, number>> = {};
    curRows.forEach((r) => {
      if (!map[r.상품명]) map[r.상품명] = {};
      map[r.상품명][r.월] = (map[r.상품명][r.월] ?? 0) + r.주문수;
    });
    return Object.entries(map)
      .map(([name, monthly]) => ({ name, monthly, total: Object.values(monthly).reduce((s, v) => s + v, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [curRows]);

  const tableRows = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const prev = prevByMonth[m] ?? 0;
      const actual = actualByMonth[m];
      const target = targets?.[m];
      const cur = actual !== undefined ? actual : (target ?? null);
      const isTarget = actual === undefined && target !== undefined;
      const yoy = prev > 0 && cur !== null ? ((cur - prev) / prev) * 100 : null;
      return { m, prev, cur, isTarget, yoy, season: seasonLabels?.[m] ?? "" };
    });
  }, [prevByMonth, actualByMonth, targets, seasonLabels]);

  const h1 = tableRows.slice(0, 6);
  const h2 = tableRows.slice(6, 12);
  const sumH1Prev = h1.reduce((s, r) => s + r.prev, 0);
  const sumH1Cur = h1.filter(r => r.cur !== null).reduce((s, r) => s + (r.cur ?? 0), 0);
  const sumH1YoY = sumH1Prev > 0 ? ((sumH1Cur - sumH1Prev) / sumH1Prev) * 100 : null;
  const sumH2Prev = h2.reduce((s, r) => s + r.prev, 0);
  const sumH2Cur = h2.filter(r => r.cur !== null).reduce((s, r) => s + (r.cur ?? 0), 0);
  const sumH2HasTarget = h2.some(r => r.isTarget);
  const sumH2YoY = sumH2Prev > 0 ? ((sumH2Cur - sumH2Prev) / sumH2Prev) * 100 : null;

  const colGray = "rgba(255,255,255,0.45)";
  const colGreen = "#34D399";
  const colRed = "#F87171";
  const colPurple = "#A78BFA";

  return (
    <>
      {selectedMonth && (
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg px-3 py-1 text-sm font-semibold" style={{ background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }}>
            {selectedMonth} 필터 적용 중
          </span>
          <button onClick={() => setSelectedMonth(null)} className="rounded-lg px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: colGray, border: "1px solid rgba(255,255,255,0.15)" }}>
            전체 보기
          </button>
        </div>
      )}

      {prevYear ? (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard title={`${prevYear} 총 매출`} value={formatKRW(prevTotalSales)} />
          <KpiCard title={`${curYear} 총 매출`} value={formatKRW(totalSales)} />
          <KpiCard title="전년 대비 성장률" value={yoyGrowth !== null ? `${yoyGrowth >= 0 ? "+" : ""}${yoyGrowth.toFixed(1)}%` : "-"} trend={yoyGrowth !== null ? (yoyGrowth >= 0 ? "positive" : "negative") : undefined} />
          <KpiCard title="총 주문수" value={`${totalOrders.toLocaleString()}건`} />
          <KpiCard title="평균 단가" value={formatKRW(avgPrice)} />
          <KpiCard title="전월 성장률" value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`} trend={growthRate >= 0 ? "positive" : "negative"} />
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard title="총 매출" value={formatKRW(totalSales)} />
          <KpiCard title="총 주문수" value={`${totalOrders.toLocaleString()}건`} />
          <KpiCard title="평균 단가" value={formatKRW(avgPrice)} />
          <KpiCard title="전월 성장률" value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`} trend={growthRate >= 0 ? "positive" : "negative"} />
        </div>
      )}

      <div className="mb-6">
        <CoupangMonthlyChart
          data={monthlyData}
          onMonthClick={setSelectedMonth}
          selectedMonth={selectedMonth}
          prevYearLine={prevYearLine}
          prevYearLabel={prevYear ? `${prevYear}년` : "전년도"}
        />
      </div>

      {prevYear && (
        <div className="mb-6 overflow-hidden rounded-2xl" style={{ backgroundColor: "#1C1E2E" }}>
          <div className="px-6 pt-5 pb-3">
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
              연간 매출 비교 — {prevYear} vs {curYear}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th className="px-6 py-3 text-left font-medium" style={{ color: colGray, width: 60 }}>월</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: colGray }}>{prevYear}년 실적</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "#00CFAA" }}>{curYear}년 실적 / 목표</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: colGray }}>YoY</th>
                  {seasonLabels && <th className="px-4 py-3 text-left font-medium" style={{ color: colGray }}>시즌</th>}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(({ m, prev, cur, isTarget, yoy, season }) => (
                  <tr
                    key={m}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      backgroundColor: isTarget ? "rgba(167,139,250,0.06)" : undefined,
                    }}
                  >
                    <td className="px-6 py-3 font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>{m}월</td>
                    <td className="px-4 py-3 text-right" style={{ color: colGray }}>
                      {prev > 0 ? formatOk(prev) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {isTarget ? (
                        <span style={{ color: colPurple }}>목표 {cur !== null ? formatOk(cur) : "-"}</span>
                      ) : cur !== null ? (
                        <span style={{ color: "#ffffff" }}>{formatOk(cur)}</span>
                      ) : (
                        <span style={{ color: colGray }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {yoy !== null ? (
                        <span style={{ color: isTarget ? colPurple : yoy >= 0 ? colGreen : colRed }}>
                          {yoy >= 0 ? "+" : ""}{yoy.toFixed(0)}%{isTarget ? " 목표" : ""}
                        </span>
                      ) : <span style={{ color: colGray }}>-</span>}
                    </td>
                    {seasonLabels && <td className="px-4 py-3" style={{ color: colGray, fontSize: 12 }}>{season}</td>}
                  </tr>
                ))}
                <tr style={{ backgroundColor: "rgba(0,207,170,0.08)", borderTop: "1px solid rgba(0,207,170,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td className="px-6 py-3 font-bold" style={{ color: "#00CFAA" }}>상반기 합계</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: colGray }}>{formatOk(sumH1Prev)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: "#ffffff" }}>{formatOk(sumH1Cur)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: sumH1YoY !== null && sumH1YoY >= 0 ? colGreen : colRed }}>
                    {sumH1YoY !== null ? `${sumH1YoY >= 0 ? "+" : ""}${sumH1YoY.toFixed(0)}%` : "-"}
                  </td>
                  {seasonLabels && <td />}
                </tr>
                <tr style={{ backgroundColor: "rgba(167,139,250,0.08)", borderTop: "1px solid rgba(167,139,250,0.2)" }}>
                  <td className="px-6 py-3 font-bold" style={{ color: colPurple }}>하반기 합계</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: colGray }}>{sumH2Prev > 0 ? formatOk(sumH2Prev) : "-"}</td>
                  <td className="px-4 py-3 text-right font-bold">
                    {sumH2HasTarget ? (
                      <span style={{ color: colPurple }}>목표 {formatOk(sumH2Cur)}</span>
                    ) : (
                      <span style={{ color: "#ffffff" }}>{formatOk(sumH2Cur)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {sumH2YoY !== null ? (
                      <span style={{ color: sumH2HasTarget ? colPurple : sumH2YoY >= 0 ? colGreen : colRed }}>
                        {sumH2YoY >= 0 ? "+" : ""}{sumH2YoY.toFixed(0)}%{sumH2HasTarget ? " 목표" : ""}
                      </span>
                    ) : "-"}
                  </td>
                  {seasonLabels && <td />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-6">
        <CategoryPie data={categoryData} />
      </div>

      <ProductMonthlyTable data={productMonthlyData} />
    </>
  );
}
