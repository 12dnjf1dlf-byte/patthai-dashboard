"use client";

import { useState, useMemo } from "react";

type Row = {
  name: string;
  qty25: number;
  qty26: number;
  avg25: number;
  avg26: number;
};

type Props = { data: Row[] };

type SortKey = "name" | "qty25" | "qty26" | "growth" | "avg25" | "avg26" | "avgGrowth";
type SortDir = "asc" | "desc" | null;

function growthRate(a: number, b: number) {
  if (!a) return b > 0 ? Infinity : 0;
  return ((b - a) / a) * 100;
}

function pct(a: number, b: number) {
  if (!a) return b > 0 ? "+100%" : "-";
  const r = growthRate(a, b);
  return `${r >= 0 ? "▲" : "▼"}${Math.abs(r).toFixed(1)}%`;
}

function pctColor(a: number, b: number) {
  if (!a) return b > 0 ? "#00CFAA" : "rgba(255,255,255,0.3)";
  return b >= a ? "#00CFAA" : "#F87171";
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "품목명" },
  { key: "qty25", label: "2025 수량" },
  { key: "qty26", label: "2026 수량" },
  { key: "growth", label: "성장률" },
  { key: "avg25", label: "전년 월평균" },
  { key: "avg26", label: "올해 월평균" },
  { key: "avgGrowth", label: "증감률" },
];

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <span style={{ opacity: 0.25, fontSize: 10 }}>⇅</span>;
  return <span style={{ fontSize: 10, color: "#00CFAA" }}>{dir === "asc" ? "▲" : "▼"}</span>;
}

export default function ProductCompareTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortDir("asc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  const processed = useMemo(() => {
    let rows = data.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        let va = 0, vb = 0;
        if (sortKey === "name") {
          const cmp = a.name.localeCompare(b.name, "ko");
          return sortDir === "asc" ? cmp : -cmp;
        }
        if (sortKey === "qty25") { va = a.qty25; vb = b.qty25; }
        else if (sortKey === "qty26") { va = a.qty26; vb = b.qty26; }
        else if (sortKey === "growth") { va = growthRate(a.qty25, a.qty26); vb = growthRate(b.qty25, b.qty26); }
        else if (sortKey === "avg25") { va = a.avg25; vb = b.avg25; }
        else if (sortKey === "avg26") { va = a.avg26; vb = b.avg26; }
        else if (sortKey === "avgGrowth") { va = growthRate(a.avg25, a.avg26); vb = growthRate(b.avg25, b.avg26); }
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir]);

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
          품목별 수량
          <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>
            {processed.length}개
          </span>
        </p>
        {/* 검색 */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>🔍</span>
          <input
            type="text"
            placeholder="품목명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg py-1.5 pl-8 pr-3 text-sm outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.87)",
              width: 200,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-3 text-left text-xs font-semibold cursor-pointer select-none"
                  style={{ color: sortKey === col.key ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)" }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon dir={sortKey === col.key ? sortDir : null} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              processed.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="px-3 py-2.5 font-medium" style={{ color: "rgba(255,255,255,0.87)", maxWidth: 220 }}>
                    <span className="block truncate" title={row.name}>{row.name}</span>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {row.qty25.toLocaleString()}개
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {row.qty26.toLocaleString()}개
                  </td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: pctColor(row.qty25, row.qty26) }}>
                    {pct(row.qty25, row.qty26)}
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {row.avg25.toFixed(1)}개/월
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {row.avg26.toFixed(1)}개/월
                  </td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: pctColor(row.avg25, row.avg26) }}>
                    {pct(row.avg25, row.avg26)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
