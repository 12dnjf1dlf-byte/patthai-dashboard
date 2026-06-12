"use client";

import { useState, useMemo } from "react";
import { AdRow } from "@/lib/sheets";
import { formatKRWShort } from "@/lib/format";

type Props = { data: AdRow[]; totalImpressions: number; avgCtr: number };
type SortKey = keyof AdRow | "roas" | "cpc";
type SortDir = "asc" | "desc" | null;

type EnrichedRow = AdRow & { roas: number; cpc: number };

type CampaignGroup = {
  name: string;
  rows: EnrichedRow[];
  total: {
    노출수: number; 클릭수: number; 광고비: number; 전환매출14: number; 주문수14: number;
    roas: number; cpc: number; 클릭률: number;
  };
};

const DATA_COLS = [
  { key: "캠페인명" as SortKey, label: "캠페인명" },
  { key: "광고노출지면" as SortKey, label: "노출 지면" },
  { key: "키워드" as SortKey, label: "키워드" },
  { key: "노출수" as SortKey, label: "노출수", align: "right" as const },
  { key: "클릭수" as SortKey, label: "클릭수", align: "right" as const },
  { key: "클릭률" as SortKey, label: "클릭률", align: "right" as const },
  { key: "광고비" as SortKey, label: "광고비", align: "right" as const },
  { key: "cpc" as SortKey, label: "클릭당 비용", align: "right" as const },
  { key: "전환매출14" as SortKey, label: "전환매출(14일)", align: "right" as const },
  { key: "roas" as SortKey, label: "전환률(ROAS)", align: "right" as const },
  { key: "주문수14" as SortKey, label: "주문수(14일)", align: "right" as const },
  { key: "비고" as SortKey, label: "비고", align: "right" as const },
];

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <span style={{ opacity: 0.25, fontSize: 10 }}>⇅</span>;
  return <span style={{ fontSize: 10, color: "#00CFAA" }}>{dir === "asc" ? "▲" : "▼"}</span>;
}

function roasColor(roas: number, hasCost: boolean) {
  if (!hasCost) return "rgba(255,255,255,0.25)";
  if (roas >= 200) return "#00CFAA";
  if (roas >= 100) return "#FBBF24";
  return "#F87171";
}

export default function AdTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [filterZone, setFilterZone] = useState("전체");
  const [sortKey, setSortKey] = useState<SortKey>("광고비");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const zones = useMemo(() => {
    const s = new Set(data.map((r) => r.광고노출지면 || "기타"));
    return ["전체", ...Array.from(s).filter(Boolean).sort()];
  }, [data]);

  function handleSort(key: SortKey) {
    if (key === "비고") return;
    if (sortKey !== key) { setSortKey(key); setSortDir("desc"); }
    else if (sortDir === "desc") setSortDir("asc");
    else { setSortKey("광고비"); setSortDir("desc"); }
  }

  function toggleAll(open: boolean) {
    const next: Record<string, boolean> = {};
    groups.forEach((g) => { next[g.name] = !open; });
    setCollapsed(next);
  }

  const enriched: EnrichedRow[] = useMemo(() =>
    data.map((r) => ({
      ...r,
      roas: r.광고비 > 0 ? (r.전환매출14 / r.광고비) * 100 : 0,
      cpc: r.클릭수 > 0 ? r.광고비 / r.클릭수 : 0,
    })), [data]);

  // 캠페인별 그룹핑
  const groups: CampaignGroup[] = useMemo(() => {
    const filtered = enriched.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.캠페인명.toLowerCase().includes(q) || r.키워드.toLowerCase().includes(q) || r.광고노출지면.toLowerCase().includes(q);
      const matchZone = filterZone === "전체" || r.광고노출지면 === filterZone;
      return matchSearch && matchZone;
    });

    const map: Record<string, EnrichedRow[]> = {};
    filtered.forEach((r) => {
      const key = r.캠페인명 || "(없음)";
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });

    return Object.entries(map).map(([name, rows]) => {
      const 노출수 = rows.reduce((s, r) => s + r.노출수, 0);
      const 클릭수 = rows.reduce((s, r) => s + r.클릭수, 0);
      const 광고비 = rows.reduce((s, r) => s + r.광고비, 0);
      const 전환매출14 = rows.reduce((s, r) => s + r.전환매출14, 0);
      const 주문수14 = rows.reduce((s, r) => s + r.주문수14, 0);
      return {
        name,
        rows,
        total: {
          노출수, 클릭수, 광고비, 전환매출14, 주문수14,
          roas: 광고비 > 0 ? (전환매출14 / 광고비) * 100 : 0,
          cpc: 클릭수 > 0 ? 광고비 / 클릭수 : 0,
          클릭률: 노출수 > 0 ? 클릭수 / 노출수 : 0,
        },
      };
    }).sort((a, b) => {
      const va = sortKey === "roas" ? a.total.roas : sortKey === "cpc" ? a.total.cpc : (a.total as Record<string, number>)[sortKey as string] ?? 0;
      const vb = sortKey === "roas" ? b.total.roas : sortKey === "cpc" ? b.total.cpc : (b.total as Record<string, number>)[sortKey as string] ?? 0;
      if (sortKey === "캠페인명") return sortDir === "asc" ? a.name.localeCompare(b.name, "ko") : b.name.localeCompare(a.name, "ko");
      return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    });
  }, [enriched, search, filterZone, sortKey, sortDir]);

  const totalLowRoas = groups.reduce((s, g) => s + g.rows.filter((r) => r.광고비 > 0 && r.roas < 200).length, 0);
  const allCollapsed = groups.length > 0 && groups.every((g) => collapsed[g.name]);

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      {/* 헤더 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
          광고 상세
          <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>
            {groups.length}개 캠페인
          </span>
          {totalLowRoas > 0 && (
            <span className="ml-3 text-xs font-normal" style={{ color: "#F87171" }}>
              ● 제외 권장 {totalLowRoas}건
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {/* 전체 펼치기/접기 */}
          <button
            onClick={() => toggleAll(allCollapsed)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
          >
            {allCollapsed ? "전체 펼치기" : "전체 접기"}
          </button>
          {/* 지면 필터 */}
          <div className="flex flex-wrap gap-1">
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
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.87)", width: 200 }}
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
              {DATA_COLS.map((col) => (
                <th
                  key={col.key + col.label}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-xs font-semibold ${col.label === "비고" ? "" : "cursor-pointer"} select-none ${col.align === "right" ? "text-right" : "text-left"}`}
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
            {groups.length === 0 ? (
              <tr>
                <td colSpan={DATA_COLS.length} className="px-3 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const isOpen = !collapsed[group.name];
                const t = group.total;
                const groupLowRoas = t.광고비 > 0 && t.roas < 200;

                return [
                  /* 캠페인 그룹 헤더 행 */
                  <tr
                    key={`group-${group.name}`}
                    onClick={() => setCollapsed((prev) => ({ ...prev, [group.name]: !prev[group.name] }))}
                    className="cursor-pointer select-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <td className="px-3 py-2.5 font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                      <span className="flex items-center gap-2">
                        <span style={{ fontSize: 11, color: "#00CFAA", width: 12, display: "inline-block" }}>
                          {isOpen ? "▼" : "▶"}
                        </span>
                        <span className="truncate" title={group.name}>{group.name}</span>
                        <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {group.rows.length}건
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>총계</td>
                    <td />
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{t.노출수.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{t.클릭수.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{(t.클릭률 * 100).toFixed(2)}%</td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{t.광고비 > 0 ? formatKRWShort(t.광고비) : "-"}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{t.cpc > 0 ? `${Math.round(t.cpc).toLocaleString()}원` : "-"}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{t.전환매출14 > 0 ? formatKRWShort(t.전환매출14) : "-"}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-bold" style={{ color: roasColor(t.roas, t.광고비 > 0) }}>{t.광고비 > 0 ? `${t.roas.toFixed(0)}%` : "-"}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{t.주문수14 > 0 ? t.주문수14.toLocaleString() : "-"}</td>
                    <td className="px-3 py-2.5 text-right text-xs">
                      {groupLowRoas && (
                        <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" }}>
                          제외 권장
                        </span>
                      )}
                    </td>
                  </tr>,

                  /* 하위 상세 행들 */
                  ...(isOpen ? group.rows.map((row, i) => {
                    const isLowRoas = row.광고비 > 0 && row.roas < 200;
                    return (
                      <tr
                        key={`row-${group.name}-${i}`}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          backgroundColor: isLowRoas ? "rgba(248,113,113,0.03)" : undefined,
                        }}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="py-2 pl-9 pr-3 text-xs" style={{ color: "rgba(255,255,255,0.45)", maxWidth: 180 }}>
                          <span className="block truncate" title={row.캠페인명}>└ {row.캠페인명 || "-"}</span>
                        </td>
                        <td className="px-3 py-2 text-xs" style={{ color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>{row.광고노출지면 || "-"}</td>
                        <td className="px-3 py-2 text-xs" style={{ color: "rgba(255,255,255,0.55)", maxWidth: 140 }}>
                          <span className="block truncate" title={row.키워드}>{row.키워드 || "-"}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{row.노출수.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{row.클릭수.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-xs" style={{ color: row.클릭률 > 0.01 ? "#00CFAA" : "rgba(255,255,255,0.4)" }}>{(row.클릭률 * 100).toFixed(2)}%</td>
                        <td className="px-3 py-2 text-right text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{row.광고비 > 0 ? formatKRWShort(row.광고비) : "-"}</td>
                        <td className="px-3 py-2 text-right text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{row.cpc > 0 ? `${Math.round(row.cpc).toLocaleString()}원` : "-"}</td>
                        <td className="px-3 py-2 text-right text-xs" style={{ color: row.전환매출14 > 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)" }}>{row.전환매출14 > 0 ? formatKRWShort(row.전환매출14) : "-"}</td>
                        <td className="px-3 py-2 text-right text-xs font-semibold" style={{ color: roasColor(row.roas, row.광고비 > 0) }}>{row.광고비 > 0 ? `${row.roas.toFixed(0)}%` : "-"}</td>
                        <td className="px-3 py-2 text-right text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{row.주문수14 > 0 ? row.주문수14.toLocaleString() : "-"}</td>
                        <td className="px-3 py-2 text-right text-xs">
                          {isLowRoas && (
                            <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" }}>
                              제외 권장
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }) : []),
                ];
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
