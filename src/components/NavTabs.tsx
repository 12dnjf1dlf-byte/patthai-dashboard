"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ALL_TABS = [
  { label: "바질클럽 쿠팡", href: "/coupang", key: "coupang" },
  { label: "남유에프엔씨 쿠팡", href: "/namyu", key: "namyu" },
  { label: "남유쿠팡 발주기준", href: "/order", key: "order" },
];

function getAllowedTabs(): string[] {
  if (typeof document === "undefined") return [];
  try {
    const match = document.cookie.match(/dashboard_user=([^;]+)/);
    if (!match) return [];
    const user = JSON.parse(decodeURIComponent(match[1]));
    return user.tabs ?? [];
  } catch {
    return [];
  }
}

export default function NavTabs() {
  const pathname = usePathname();
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);

  useEffect(() => {
    setAllowedTabs(getAllowedTabs());
  }, []);

  const visibleTabs = ALL_TABS.filter((t) => allowedTabs.includes(t.key));

  if (visibleTabs.length === 0) return null;

  return (
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
  );
}
