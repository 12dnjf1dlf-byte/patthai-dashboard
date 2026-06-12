"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  {
    label: "전체",
    value: "전체",
    gradient: "linear-gradient(135deg, #7B70EE, #00CFAA)",
    glow: "0 0 16px rgba(123,112,238,0.5)",
  },
  {
    label: "온라인",
    value: "온라인",
    gradient: "linear-gradient(135deg, #4A9EFF, #7B70EE)",
    glow: "0 0 16px rgba(74,158,255,0.5)",
  },
  {
    label: "오프라인",
    value: "오프라인",
    gradient: "linear-gradient(135deg, #00CFAA, #4A9EFF)",
    glow: "0 0 16px rgba(0,207,170,0.5)",
  },
];

export default function ChannelFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("channel") ?? "전체";

  function select(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "전체") {
      next.delete("channel");
    } else {
      next.set("channel", value);
    }
    router.push(`?${next.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => select(opt.value)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
            style={
              active
                ? {
                    background: opt.gradient,
                    boxShadow: opt.glow,
                    color: "#fff",
                  }
                : {
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.6)",
                  }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
