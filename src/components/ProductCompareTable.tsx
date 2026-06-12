"use client";

type Row = {
  name: string;
  qty25: number;
  qty26: number;
  avg25: number;
  avg26: number;
};

type Props = { data: Row[] };

function pct(a: number, b: number) {
  if (!a) return b > 0 ? "+100%" : "-";
  const r = ((b - a) / a) * 100;
  return `${r >= 0 ? "▲" : "▼"}${Math.abs(r).toFixed(1)}%`;
}

function pctColor(a: number, b: number) {
  if (!a) return b > 0 ? "#00CFAA" : "rgba(255,255,255,0.3)";
  return b >= a ? "#00CFAA" : "#F87171";
}

export default function ProductCompareTable({ data }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        품목별 수량
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["품목명", "2025 수량", "2026 수량", "성장률", "전년 월평균", "올해 월평균", "증감률"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                className="transition-colors hover:bg-white/5"
              >
                <td className="px-3 py-2.5 font-medium" style={{ color: "rgba(255,255,255,0.87)", maxWidth: 200 }}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
