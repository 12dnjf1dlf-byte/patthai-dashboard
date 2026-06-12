"use client";

type Props = {
  title: string;
  value: string;
  sub?: string;
  trend?: "positive" | "negative" | "neutral";
};

export default function KpiCard({ title, value, sub, trend }: Props) {
  const trendColor =
    trend === "positive"
      ? "text-emerald-400"
      : trend === "negative"
      ? "text-pink-400"
      : "text-white/50";

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>
        {value}
      </p>
      {sub && (
        <p className={`mt-1 text-sm font-medium ${trendColor}`}>{sub}</p>
      )}
    </div>
  );
}
