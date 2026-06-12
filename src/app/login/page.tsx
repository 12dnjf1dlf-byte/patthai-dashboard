"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (res.ok) {
      const { tabs } = await res.json();
      // 첫 번째 허용 탭으로 이동
      const first = tabs?.[0];
      const dest = first === "coupang" ? "/coupang"
        : first === "namyu" ? "/namyu"
        : first === "order" ? "/order"
        : "/coupang";
      router.push(dest);
      router.refresh();
    } else {
      setError("아이디 또는 비밀번호가 틀렸습니다.");
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ backgroundColor: "#13141F" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: "#1C1E2E" }}
      >
        <h1 className="mb-2 text-xl font-bold" style={{ color: "rgba(255,255,255,0.87)" }}>
          쿠팡 매출 대시보드
        </h1>
        <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          아이디와 비밀번호를 입력하세요
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디"
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: "#13141F",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.87)",
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: "#13141F",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.87)",
            }}
          />
          {error && <p className="text-sm text-pink-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #7B70EE, #00CFAA)" }}
          >
            {loading ? "확인 중..." : "입장"}
          </button>
        </form>
      </div>
    </main>
  );
}
