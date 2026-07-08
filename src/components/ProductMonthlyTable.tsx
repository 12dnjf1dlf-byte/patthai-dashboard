"use client";

import { useState, useMemo } from "react";

export type ProductMonthlyRow = {
  name: string;
  monthly: Record<number, number>;
  total: number;
};

type SortCol = "name" | "total" | "share" | "dailyAvg" | number;
type Props = { data: ProductMonthlyRow[]; title?: string };

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function getDaysForMonth(year: number, month: number): number {
  // 윤년 처리
  if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) return 29;
  return MONTH_DAYS[month - 1];
}

export default function ProductMonthlyTable({ data, title = "품목별 월별 판매 수량" }: Props) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const months = useMemo(() => {
    const s = new Set<number>();
    data.forEach((r) => Object.keys(r.monthly).forEach((m) => s.add(Number(m))));
    return Array.from(s).sort((a, b) => a - b);
  }, [data]);

  const curMonth = months[months.length - 1] ?? null;

  // 일평균 계산용: 최신 월 기준 경과 일수
  const daysElapsed = useMemo(() => {
    if (!curMonth) return 1;
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    // 현재 달이면 경과일, 아니면 해당 월 전체 일수
    if (todayMonth === curMonth) return Math.max(1, todayDay - 1 || 1);
    return getDaysForMonth(todayYear, curMonth);
  }, [curMonth]);

  const grandTotal = useMemo(() => data.reduce((s, r) => s + r.total, 0), [data]);

  const filtered = useMemo(() => {
    let rows = search ? data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) : data;
    rows = [...rows].sort((a, b) => {
      if (sortCol === "name") {
        return sortDir === "asc"
          ? a.name.localeCompare(b.name, "ko")
          : b.name.localeCompare(a.name, "ko");
      }
      let va: number, vb: number;
      if (sortCol === "total") { va = a.total; vb = b.total; }
      else if (sortCol === "share") {
        va = grandTotal > 0 ? a.total / grandTotal : 0;
        vb = grandTotal > 0 ? b.total / grandTotal : 0;
      } else if (sortCol === "dailyAvg") {
        va = curMonth ? (a.monthly[curMonth] ?? 0) / daysElapsed : 0;
        vb = curMonth ? (b.monthly[curMonth] ?? 0) / daysElapsed : 0;
      } else {
        va = a.monthly[sortCol as number] ?? 0;
        vb = b.monthly[sortCol as number] ?? 0;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return rows;
  }, [data, search, sortCol, sortDir, grandTotal, curMonth, daysElapsed]);

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <span style={{ opacity: 0.2, fontSize: 9 }}>⇅</span>;
    return <span style={{ fontSize: 9, color: "#00CFAA" }}>{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  const monthTotals: Record<number, number> = {};
  months.forEach((m) => { monthTotals[m] = data.reduce((s, r) => s + (r.monthly[m] ?? 0), 0); });
  const grandDailyAvg = curMonth ? Math.round(monthTotals[curMonth] / daysElapsed) : 0;

  const colBase = "rgba(255,255,255,0.38)";
  const colActive = "rgba(255,255,255,0.72)";

  return (
    <div className="rounded-2xl" style={{ backgroundColor: "#1C1E2E" }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>{title}</p>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {filtered.length}개 품목 &nbsp;·&nbsp; 일평균은 {curMonth}월 기준 {daysElapsed}일 경과
          </p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>🔍</span>
          <input
            type="text" placeholder="품목명 검색..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.87)", width: 170 }}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {/* 품목명 */}
              <th onClick={() => handleSort("name")} className="cursor-pointer select-none px-4 py-2.5 text-left font-medium"
                style={{ color: sortCol === "name" ? colActive : colBase, minWidth: 180, position: "sticky", left: 0, backgroundColor: "#1C1E2E", zIndex: 2 }}>
                <span className="flex items-center gap-1">품목명 <SortIcon col="name" /></span>
              </th>
              {/* 월별 */}
              {months.map((m) => (
                <th key={m} onClick={() => handleSort(m)} className="cursor-pointer select-none px-3 py-2.5 text-right font-medium whitespace-nowrap"
                  style={{ color: sortCol === m ? colActive : (m === curMonth ? "rgba(255,255,255,0.55)" : colBase) }}>
                  <span className="flex items-center justify-end gap-1">
                    {m === curMonth ? <span style={{ color: "#00CFAA" }}>{m}월</span> : `${m}월`}
                    <SortIcon col={m} />
                  </span>
                </th>
              ))}
              {/* 일평균 */}
              <th onClick={() => handleSort("dailyAvg")} className="cursor-pointer select-none px-3 py-2.5 text-right font-medium whitespace-nowrap"
                style={{ color: sortCol === "dailyAvg" ? colActive : "#F59E0B", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="flex items-center justify-end gap-1">일평균 <SortIcon col="dailyAvg" /></span>
              </th>
              {/* 합계 */}
              <th onClick={() => handleSort("total")} className="cursor-pointer select-none px-3 py-2.5 text-right font-medium whitespace-nowrap"
                style={{ color: sortCol === "total" ? colActive : colBase, borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="flex items-center justify-end gap-1">합계 <SortIcon col="total" /></span>
              </th>
              {/* 비중 */}
              <th onClick={() => handleSort("share")} className="cursor-pointer select-none px-3 py-2.5 text-right font-medium whitespace-nowrap"
                style={{ color: sortCol === "share" ? colActive : colBase }}>
                <span className="flex items-center justify-end gap-1">비중 <SortIcon col="share" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 전체 합계 행 */}
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)" }}>
              <td className="px-4 py-2.5 font-semibold text-xs" style={{ color: "rgba(255,255,255,0.45)", position: "sticky", left: 0, backgroundColor: "rgba(28,30,46,0.97)", zIndex: 1 }}>
                전체 합계
              </td>
              {months.map((m) => (
                <td key={m} className="px-3 py-2.5 text-right font-semibold"
                  style={{ color: m === curMonth ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.38)" }}>
                  {monthTotals[m] > 0 ? monthTotals[m].toLocaleString() : "-"}
                </td>
              ))}
              <td className="px-3 py-2.5 text-right font-bold" style={{ color: "#F59E0B", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                {grandDailyAvg > 0 ? grandDailyAvg.toLocaleString() : "-"}
              </td>
              <td className="px-3 py-2.5 text-right font-bold" style={{ color: "#00CFAA", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                {grandTotal.toLocaleString()}
              </td>
              <td className="px-3 py-2.5 text-right font-bold" style={{ color: "#00CFAA" }}>100%</td>
            </tr>

            {filtered.length === 0 ? (
              <tr><td colSpan={months.length + 4} className="px-3 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>검색 결과가 없습니다.</td></tr>
            ) : filtered.map((row, i) => {
              const share = grandTotal > 0 ? (row.total / grandTotal) * 100 : 0;
              const barWidth = Math.min(100, share * 3.5);
              const curQty = curMonth ? (row.monthly[curMonth] ?? 0) : 0;
              const dailyAvg = Math.round(curQty / daysElapsed);
              const isEven = i % 2 === 0;
              return (
                <tr key={i}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    backgroundColor: isEven ? "transparent" : "rgba(255,255,255,0.015)",
                  }}
                  className="transition-colors hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-2 font-medium"
                    style={{ color: "rgba(255,255,255,0.82)", maxWidth: 200, position: "sticky", left: 0, backgroundColor: isEven ? "#1C1E2E" : "rgb(30,32,50)", zIndex: 1 }}>
                    <span className="block truncate" title={row.name}>{row.name}</span>
                  </td>
                  {months.map((m) => {
                    const qty = row.monthly[m] ?? 0;
                    const isCur = m === curMonth;
                    return (
                      <td key={m} className="px-3 py-2 text-right tabular-nums"
                        style={{
                          color: qty > 0
                            ? (isCur ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)")
                            : "rgba(255,255,255,0.15)",
                          fontWeight: isCur ? 600 : 400,
                        }}>
                        {qty > 0 ? qty.toLocaleString() : "–"}
                      </td>
                    );
                  })}
                  {/* 일평균 */}
                  <td className="px-3 py-2 text-right tabular-nums" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                    {curQty > 0 ? (
                      <span className="font-semibold" style={{ color: "#F59E0B" }}>
                        {dailyAvg.toLocaleString()}
                      </span>
                    ) : <span style={{ color: "rgba(255,255,255,0.15)" }}>–</span>}
                  </td>
                  {/* 합계 */}
                  <td className="px-3 py-2 text-right tabular-nums font-semibold" style={{ color: "#00CFAA", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                    {row.total.toLocaleString()}
                  </td>
                  {/* 비중 */}
                  <td className="px-3 py-2 text-right" style={{ minWidth: 90 }}>
                    <div className="flex items-center justify-end gap-2">
                      <div style={{ width: 36, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ width: `${barWidth}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#7B70EE,#00CFAA)" }} />
                      </div>
                      <span style={{
                        color: share >= 10 ? "#00CFAA" : share >= 5 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)",
                        fontWeight: share >= 10 ? 600 : 400,
                        minWidth: 38,
                        textAlign: "right",
                      }}>
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
