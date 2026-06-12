"use client";

import { useState, useMemo } from "react";
import { AdRow } from "@/lib/sheets";
import { formatKRWShort } from "@/lib/format";

type Props = { data: AdRow[]; totalImpressions: number; avgCtr: number };
type SortKey = keyof AdRow | "roas" | "cpc";
type SortDir = "asc" | "desc" | null;
type EnrichedRow = AdRow & { roas: number; cpc: number };

const DATA_COLS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "캠페인명", label: "캠페인명" },
  { key: "광고노출지면", label: "노출 지면" },
  { key: "키워드", label: "키워드" },
  { key: "노출수", label: "노출수", align: "right" },
  { key: "클릭수", label: "클릭수", align: "right" },
  { key: "클릭률", label: "클릭률", align: "right" },
  { key: "광고비", label: "광고비", align: "right" },
  { key: "cpc", label: "클릭당 비용", align: "right" },
  { key: "전환매출14", label: "전환매출(14일)", align: "right" },
  { key: "roas", label: "전환률(ROAS)", align: "right" },
  { key: "주문수14", label: "주문수(14일)", align: "right" },
  { key: "주문수14", label: "비고", align: "right" },
];

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <span style={{ opacity: 0.25, fontSize: 10 }}>⇅</span>;
  return <span style={{ fontSize: 10, color: "#00CFAA" }}>{dir === "asc" ? "▲" : "▼"}</span>;
}

export default function AdTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [filterZone, setFilterZone] = useState("전체");
  const [sortKey, setSortKey] = useState<SortKey>("광고비");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const zones = useMemo(() => {
    const s = new Set(data.map((r) => r.광고노출지면 || "기타"));
    return ["전체", ...Array.from(s).filter(Boolean).sort()];
  }, [data]);

  function handleSort(key: SortKey) {
    if (sortKey !== key) { setSortKey(key); setSortDir("desc"); }
    else if (sortDir === "desc") setSortDir("asc");
    else { setSortKey("광고비"); setSortDir("desc"); }
  }

  const enriched: EnrichedRow[] = useMemo(() =>
    data.map((r) => ({
      ...r,
      roas: r.광고비 > 0 ? (r.전환매출14 / r.광고비) * 100 : 0,
      cpc: r.클릭수 > 0 ? r.광고비 / r.클릭수 : 0,
    })), [data]);

  const processed = useMemo(() => {
    let rows = enriched.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.캠페인명.toLowerCase().includes(q) || r.키워드.toLowerCase().includes(q) || r.광고노출지면.toLowerCase().includes(q);
      const matchZone = filterZone === "전체" || r.광고노출지면 === filterZone;
      return matchSearch && matchZone;
    });
    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        const va = sortKey === "roas" ? a.roas : sortKey === "cpc" ? a.cpc : Number(a[sortKey as keyof AdRow] ?? 0);
        const vb = sortKey === "roas" ? b.roas : sortKey === "cpc" ? b.cpc : Number(b[sortKey as keyof AdRow] ?? 0);
        if (sortKey === "캠페인명") {
          const sa = String(a.캠페인명), sb = String(b.캠페인명);
          return sortDir === "asc" ? sa.localeCompare(sb, "ko") : sb.localeCompare(sa, "ko");
        }
        return sortDir === "asc" ? va - vb : vb - va;
      });
    }
    return rows;
  }, [enriched, search, filterZone, sortKey, sortDir]);

  const lowRoasCount = processed.filter((r) => r.광고비 > 0 && r.roas < 200).length;

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
          광고 상세
          <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>{processed.length}건</span>
          {lowRoasCount > 0 && (
            <span className="ml-3 text-xs font-normal" style={{ color: "#F87171" }}>● 제외 권장 {lowRoasCount}건</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {zones.map((z) => (
              <button key={z} onClick={() => setFilterZone(z)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                style={filterZone === z
                  ? { background: "linear-gradient(135deg,#7B70EE,#00CFAA)", color: "#fff" }
                  : { backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
              >{z}</button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>🔍</span>
            <input type="text" placeholder="캠페인/키워드 검색..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg py-1.5 pl-8 pr-3 text-sm outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.87)", width: 200 }}
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {DATA_COLS.map((col, idx) => (
                <th key={idx} onClick={() => col.label !== "비고" && handleSort(col.key)}
                  className={`px-3 py-3 text-xs font-semibold ${col.label !== "비고" ? "cursor-pointer" : ""} select-none ${col.align === "right" ? "text-right" : "text-left"}`}
                  style={{ color: sortKey === col.key && col.label !== "비고" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}
                >
                  <span className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`}>
                    {col.label}
                    {col.label !== "비고" && <SortIcon dir={sortKey === col.key ? sortDir : null} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 ? (
              <tr><td colSpan={DATA_COLS.length} className="px-3 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>검색 결과가 없습니다.</td></tr>
            ) : processed.map((row, i) => {
              const isLowRoas = row.광고비 > 0 && row.roas < 200;
              return (
                <tr key={i}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: isLowRoas ? "rgba(248,113,113,0.04)" : undefined }}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="px-3 py-2.5" style={{ color: "rgba(255,255,255,0.87)", maxWidth: 180 }}>
                    <span className="block truncate" title={row.캠페인명}>{row.캠페인명 || "-"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{row.광고노출지면 || "-"}</td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 140 }}>
                    <span className="block truncate" title={row.키워드}>{row.키워드 || "-"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{row.노출수.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{row.클릭수.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-xs" style={{ color: row.클릭률 > 0.01 ? "#00CFAA" : "rgba(255,255,255,0.5)" }}>{(row.클릭률 * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{row.광고비 > 0 ? formatKRWShort(row.광고비) : "-"}</td>
                  <td className="px-3 py-2.5 text-right text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{row.cpc > 0 ? `${Math.round(row.cpc).toLocaleString()}원` : "-"}</td>
                  <td className="px-3 py-2.5 text-right text-xs" style={{ color: row.전환매출14 > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>{row.전환매출14 > 0 ? formatKRWShort(row.전환매출14) : "-"}</td>
                  <td className="px-3 py-2.5 text-right text-xs font-semibold" style={{
                    color: row.광고비 === 0 ? "rgba(255,255,255,0.25)" : row.roas >= 200 ? "#00CFAA" : row.roas >= 100 ? "#FBBF24" : "#F87171"
                  }}>{row.광고비 > 0 ? `${row.roas.toFixed(0)}%` : "-"}</td>
                  <td className="px-3 py-2.5 text-right text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{row.주문수14 > 0 ? row.주문수14.toLocaleString() : "-"}</td>
                  <td className="px-3 py-2.5 text-right text-xs">
                    {isLowRoas && (
                      <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" }}>제외 권장</span>
                    )}
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
