"use client";

import { useState, useMemo } from "react";

export type ProductMonthlyRow = {
  name: string;
  monthly: Record<number, number>; // month(1~12) → quantity
  total: number;
};

type SortCol = "name" | "total" | "share" | "mom" | number;
type Props = { data: ProductMonthlyRow[]; title?: string };

export default function ProductMonthlyTable({ data, title = "품목별 월별 판매 수량" }: Props) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // 데이터에 실제 존재하는 월만 추출
  const months = useMemo(() => {
    const s = new Set<number>();
    data.forEach((r) => Object.keys(r.monthly).forEach((m) => s.add(Number(m))));
    return Array.from(s).sort((a, b) => a - b);
  }, [data]);

  // 최근 월 / 직전 월
  const curMonth = months[months.length - 1] ?? null;
  const prevMonth = months[months.length - 2] ?? null;

  // 품목별 전월 대비 계산
  function calcMoM(row: ProductMonthlyRow): number | null {
    if (!curMonth || !prevMonth) return null;
    const cur = row.monthly[curMonth] ?? 0;
    const prev = row.monthly[prevMonth] ?? 0;
    if (prev === 0) return cur > 0 ? null : null; // 전월 0이면 표시 불가
    return ((cur - prev) / prev) * 100;
  }

  const filtered = useMemo(() => {
    let rows = search ? data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) : data;
    const grandTotal = data.reduce((s, r) => s + r.total, 0);
    rows = [...rows].sort((a, b) => {
      let va: number, vb: number;
      if (sortCol === "name") {
        return sortDir === "asc"
          ? a.name.localeCompare(b.name, "ko")
          : b.name.localeCompare(a.name, "ko");
      } else if (sortCol === "total") {
        va = a.total; vb = b.total;
      } else if (sortCol === "share") {
        va = grandTotal > 0 ? a.total / grandTotal : 0;
        vb = grandTotal > 0 ? b.total / grandTotal : 0;
      } else if (sortCol === "mom") {
        va = calcMoM(a) ?? -Infinity;
        vb = calcMoM(b) ?? -Infinity;
      } else {
        va = a.monthly[sortCol as number] ?? 0;
        vb = b.monthly[sortCol as number] ?? 0;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return rows;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, sortCol, sortDir, curMonth, prevMonth]);

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <span style={{ opacity: 0.2, fontSize: 9 }}>⇅</span>;
    return <span style={{ fontSize: 9, color: "#00CFAA" }}>{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  // 월별 합계
  const monthTotals: Record<number, number> = {};
  months.forEach((m) => { monthTotals[m] = data.reduce((s, r) => s + (r.monthly[m] ?? 0), 0); });
  const grandTotal = data.reduce((s, r) => s + r.total, 0);

  // 전체 합계 행의 전월 대비
  const totalCur = curMonth ? (monthTotals[curMonth] ?? 0) : 0;
  const totalPrev = prevMonth ? (monthTotals[prevMonth] ?? 0) : 0;
  const totalMoM = totalPrev > 0 ? ((totalCur - totalPrev) / totalPrev) * 100 : null;

  function MoMBadge({ rate }: { rate: number | null }) {
    if (rate === null) return <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>-</span>;
    const up = rate >= 0;
    const abs = Math.abs(rate);
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        fontWeight: 600,
        fontSize: 10,
        color: up ? "#00CFAA" : "#F87171",
        whiteSpace: "nowrap",
      }}>
        {up ? "▲" : "▼"} {abs >= 1000 ? "999%+" : `${abs.toFixed(1)}%`}
      </span>
    );
  }

  const thStyle = (active?: boolean) => ({
    color: active ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
  });

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
            {title}
            <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>
              {filtered.length}개 품목
            </span>
          </p>
          {curMonth && prevMonth && (
            <span className="rounded-md px-2 py-0.5 text-xs" style={{ backgroundColor: "rgba(123,112,238,0.15)", color: "rgba(123,112,238,0.9)", border: "1px solid rgba(123,112,238,0.2)" }}>
              전월 대비: {prevMonth}월 → {curMonth}월
            </span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>🔍</span>
          <input
            type="text"
            placeholder="품목명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg py-1.5 pl-8 pr-3 text-sm outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.87)", width: 180 }}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th
                onClick={() => handleSort("name")}
                className="cursor-pointer select-none px-3 py-2.5 text-left text-xs font-semibold"
                style={{ ...thStyle(sortCol === "name"), minWidth: 160, position: "sticky", left: 0, backgroundColor: "#1C1E2E", zIndex: 1 }}
              >
                <span className="flex items-center gap-1">품목명 <SortIcon col="name" /></span>
              </th>
              {months.map((m) => (
                <th key={m} onClick={() => handleSort(m)} className="cursor-pointer select-none px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap"
                  style={thStyle(sortCol === m)}>
                  <span className="flex items-center justify-end gap-1">{m}월 <SortIcon col={m} /></span>
                </th>
              ))}
              <th onClick={() => handleSort("total")} className="cursor-pointer select-none px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap"
                style={thStyle(sortCol === "total")}>
                <span className="flex items-center justify-end gap-1">합계 <SortIcon col="total" /></span>
              </th>
              <th onClick={() => handleSort("share")} className="cursor-pointer select-none px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap"
                style={thStyle(sortCol === "share")}>
                <span className="flex items-center justify-end gap-1">비중 <SortIcon col="share" /></span>
              </th>
              {curMonth && prevMonth && (
                <th onClick={() => handleSort("mom")} className="cursor-pointer select-none px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap"
                  style={{ ...thStyle(sortCol === "mom"), minWidth: 90 }}>
                  <span className="flex items-center justify-end gap-1">전월 대비 <SortIcon col="mom" /></span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* 합계 행 */}
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)" }}>
              <td className="px-3 py-2 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)", position: "sticky", left: 0, backgroundColor: "rgba(28,30,46,0.98)" }}>
                전체 합계
              </td>
              {months.map((m) => (
                <td key={m} className="px-3 py-2 text-right text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {monthTotals[m] > 0 ? monthTotals[m].toLocaleString() : "-"}
                </td>
              ))}
              <td className="px-3 py-2 text-right text-xs font-bold" style={{ color: "#00CFAA" }}>
                {grandTotal.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right text-xs font-bold" style={{ color: "#00CFAA" }}>
                100%
              </td>
              {curMonth && prevMonth && (
                <td className="px-3 py-2 text-right">
                  <MoMBadge rate={totalMoM} />
                </td>
              )}
            </tr>

            {filtered.length === 0 ? (
              <tr><td colSpan={months.length + (curMonth && prevMonth ? 4 : 3)} className="px-3 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>검색 결과가 없습니다.</td></tr>
            ) : filtered.map((row, i) => {
              const share = grandTotal > 0 ? (row.total / grandTotal) * 100 : 0;
              const barWidth = Math.min(100, share * 2);
              const mom = calcMoM(row);
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} className="transition-colors hover:bg-white/5">
                  <td className="px-3 py-2 font-medium" style={{ color: "rgba(255,255,255,0.87)", maxWidth: 200, position: "sticky", left: 0, backgroundColor: "#1C1E2E" }}>
                    <span className="block truncate text-xs" title={row.name}>{row.name}</span>
                  </td>
                  {months.map((m) => {
                    const qty = row.monthly[m] ?? 0;
                    const isCur = m === curMonth;
                    return (
                      <td key={m} className="px-3 py-2 text-right text-xs"
                        style={{ color: qty > 0 ? (isCur ? "rgba(255,255,255,0.87)" : "rgba(255,255,255,0.7)") : "rgba(255,255,255,0.2)", fontWeight: isCur ? 600 : 400 }}>
                        {qty > 0 ? qty.toLocaleString() : "-"}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right text-xs font-semibold" style={{ color: "#00CFAA" }}>
                    {row.total.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-xs" style={{ minWidth: 80 }}>
                    <div className="flex items-center justify-end gap-1.5">
                      <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                        <div style={{ width: `${barWidth}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#7B70EE,#00CFAA)" }} />
                      </div>
                      <span style={{ color: share >= 10 ? "#00CFAA" : "rgba(255,255,255,0.5)", fontWeight: share >= 10 ? 600 : 400, minWidth: 36, textAlign: "right" }}>
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  {curMonth && prevMonth && (
                    <td className="px-3 py-2 text-right">
                      <MoMBadge rate={mom} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
