"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const ALL_TABS = [
  { label: "전체 요약", href: "/summary", key: "summary" },
  { label: "바질클럽 쿠팡", href: "/coupang", key: "coupang" },
  { label: "바질클럽 광고", href: "/ad", key: "ad" },
  { label: "남유에프엔씨 쿠팡", href: "/namyu", key: "namyu" },
  { label: "남유쿠팡 발주기준", href: "/order", key: "order" },
  { label: "뉴트라랩 쿠팡", href: "/nutralap", key: "nutralap" },
  { label: "프롬디스 쿠팡", href: "/promidis", key: "promidis" },
];

function getAllowedTabs(): string[] {
  if (typeof document === "undefined") return [];
  try {
    const match = document.cookie.match(/dashboard_tabs=([^;]+)/);
    if (!match) return [];
    return decodeURIComponent(match[1]).split(",").filter(Boolean);
  } catch {
    return [];
  }
}

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);
  const [refreshState, setRefreshState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    setAllowedTabs(getAllowedTabs());
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshState("loading");
    try {
      await fetch("/api/revalidate", { method: "POST" });
      setRefreshState("done");
      // 현재 페이지 새로고침
      router.refresh();
      setTimeout(() => setRefreshState("idle"), 2000);
    } catch {
      setRefreshState("idle");
    }
  }, [router]);

  const visibleTabs = ALL_TABS.filter((t) => allowedTabs.includes(t.key));

  if (visibleTabs.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: "#1C1E2E" }}>
        {visibleTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-lg px-4 py-1.5 text-sm font-medium transition-all"
              style={
                active
                  ? { background: "linear-gradient(135deg, #7B70EE, #00CFAA)", color: "#fff" }
                  : { color: "rgba(255,255,255,0.5)" }
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 데이터 갱신 버튼 */}
      <button
        onClick={handleRefresh}
        disabled={refreshState === "loading"}
        title="Google Sheets 최신 데이터로 갱신"
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all"
        style={{
          backgroundColor: "#1C1E2E",
          color: refreshState === "done" ? "#00CFAA" : refreshState === "loading" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.55)",
          border: refreshState === "done" ? "1px solid rgba(0,207,170,0.3)" : "1px solid transparent",
          cursor: refreshState === "loading" ? "not-allowed" : "pointer",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 13,
            animation: refreshState === "loading" ? "spin 0.8s linear infinite" : "none",
          }}
        >
          ↻
        </span>
        {refreshState === "done" ? "완료" : refreshState === "loading" ? "갱신 중..." : "데이터 갱신"}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </button>
    </div>
  );
}
