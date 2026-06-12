"use client";

import { useState, useMemo } from "react";
import { AdRow } from "@/lib/sheets";
import { formatKRWShort } from "@/lib/format";

type Props = { data: AdRow[]; totalImpressions: number; avgCtr: number };
type SortKey = keyof AdRow;
type SortDir = "asc" | "desc" | null;

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "캠페인명", label: "캠페인명" },
  { key: "광고노출지면", label: "노출 지면" },
  { key: "키워드", label: "키워드" },
  { key: "노출수", label: "노출수", align: "right" },
  { key: "클릭수", label: "클릭수", align: "right" },
  { key: "클릭률", label: "클릭률", align: "right" },
  { key: "광고비", label: "광고비", align: "right" },
  { key: "전환매출14", label: "전환매출(14일)", align: "right" },
  { key: "주문수14", label: "주문수(14일)", align: "right" },
];

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <span style={{ opacity: 0.25, fontSize: 10 }}>⇅</span>;
  return <span style={{ fontSize: 10, color: "#00CFAA" }}>{dir === "asc" ? "▲" : "▼"}</span>;
}

export default function AdTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [filterZone, setFilterZone] = useState("전체");
  const [sortKey, setSortKey] = useState<SortKey | null>("광고비");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const zones = useMemo(() => {
    const s = new Set(data.map((r) => r.광고노출지면 || "기타"));
    return ["전체", ...Array.from(s).filter(Boolean).sort()];
  }, [data]);

  function handleSort(key: SortKey) {
    if (sortKey !== key) { setSortKey(key); setSortDir("desc"); }
    else if (sortDir === "desc") setSortDir("asc");
    else { setSortKey(null); setSortDir(null); }
  }

  const processed = useMemo(() => {
    let rows = data.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.캠페인명.toLowerCase().includes(q) ||
        r.키워드.toLowerCase().includes(q) ||
        r.광고노출지면.toLowerCase().includes(q);
      const matchZone = filterZone === "전체" || r.광고노출지면 === filterZone;
      return matchSearch && matchZone;
    });

    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (typeof va === "string" && typeof vb === "string") {
          const cmp = va.localeCompare(vb, "ko");
          return sortDir === "asc" ? cmp : -cmp;
        }
        return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
      });
    }
    return rows;
  }, [data, search, filterZone, sortKey, sortDir]);

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      {/* 헤더 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
          광고 상세
          <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>
            {processed.length}건
          </span>
        </p>
        <div className="flex items-center gap-2">
          {/* 지면 필터 */}
          <div className="flex gap-1">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setFilterZone(z)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                style={
                  filterZone === z
                    ? { background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }
                }
              >
                {z}
              </button>
            ))}
          </div>
          {/* 검색 */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>🔍</span>
            <input
              type="text"
              placeholder="캠페인/키워드 검색..."
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
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>
            )}
          </div>
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
                  className={`px-3 py-3 text-xs font-semibold cursor-pointer select-none ${col.align === "right" ? "text-right" : "text-left"}`}
                  style={{ color: sortKey === col.key ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)" }}
                >
                  <span className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`}>
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
                <td colSpan={9} className="px-3 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              processed.map((row, i) => {
                const roas = row.광고비 > 0 ? (row.전환매출14 / row.광고비) * 100 : 0;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="transition-colors hover:bg-white/5">
                    <td className="px-3 py-2.5" style={{ color: "rgba(255,255,255,0.87)", maxWidth: 180 }}>
                      <span className="block truncate" title={row.캠페인명}>{row.캠페인명 || "-"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
                      {row.광고노출지면 || "-"}
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 140 }}>
                      <span className="block truncate" title={row.키워드}>{row.키워드 || "-"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {row.노출수.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {row.클릭수.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" style={{ color: row.클릭률 > 0.01 ? "#00CFAA" : "rgba(255,255,255,0.5)" }}>
                      {(row.클릭률 * 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {row.광고비 > 0 ? formatKRWShort(row.광고비) : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" style={{ color: roas >= 100 ? "#00CFAA" : row.전환매출14 > 0 ? "#F87171" : "rgba(255,255,255,0.3)" }}>
                      {row.전환매출14 > 0 ? (
                        <span title={`ROAS ${roas.toFixed(0)}%`}>{formatKRWShort(row.전환매출14)}</span>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {row.주문수14 > 0 ? row.주문수14.toLocaleString() : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
