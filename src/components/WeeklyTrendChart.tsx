"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatKRWShort, CHANNEL_COLORS } from "@/lib/format";

type Props = {
  data: { week: string; [channel: string]: string | number }[];
  channels: string[];
};

export default function WeeklyTrendChart({ data, channels }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        채널별 주차 매출 트렌드
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            {channels.map((ch) => (
              <linearGradient key={ch} id={`grad-${ch}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHANNEL_COLORS[ch] ?? "#7B70EE"} stopOpacity={0.4} />
                <stop offset="95%" stopColor={CHANNEL_COLORS[ch] ?? "#7B70EE"} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="week"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatKRWShort}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v, name) => [formatKRWShort(Number(v)), String(name)]}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
          />
          {channels.map((ch) => (
            <Area
              key={ch}
              type="monotone"
              dataKey={ch}
              stackId="1"
              stroke={CHANNEL_COLORS[ch] ?? "#7B70EE"}
              fill={`url(#grad-${ch})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
