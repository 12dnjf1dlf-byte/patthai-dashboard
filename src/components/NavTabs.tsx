"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "바질클럽 쿠팡", href: "/coupang" },
  { label: "남유에프엔씨 쿠팡", href: "/namyu" },
  { label: "남유쿠팡 발주기준", href: "/order" },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: "#1C1E2E" }}>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-lg px-4 py-1.5 text-sm font-medium transition-all"
            style={
              active
                ? {
                    background: "linear-gradient(135deg, #7B70EE, #00CFAA)",
                    color: "#fff",
                  }
                : {
                    color: "rgba(255,255,255,0.5)",
                  }
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
