"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { formatKRWShort } from "@/lib/format";

type Props = {
  data: { menu: string; value: number; orders: number }[];
};

export default function TopMenuChart({ data }: Props) {
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C1E2E" }}>
      <p className="mb-4 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.87)" }}>
        메뉴별 TOP 10
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 80, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="topMenuGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7B70EE" />
              <stop offset="100%" stopColor="#00CFAA" />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            tickFormatter={formatKRWShort}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="menu"
            tick={{ fill: "rgba(255,255,255,0.87)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(v) => [formatKRWShort(Number(v)), "매출"]}
            contentStyle={{ backgroundColor: "#1C1E2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.87)" }}
            itemStyle={{ color: "#00CFAA" }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="url(#topMenuGrad)">
            <LabelList
              dataKey="orders"
              position="right"
              formatter={(v) => `${v}건`}
              style={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
