"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("비밀번호가 틀렸습니다.");
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
        <h1
          className="mb-2 text-xl font-bold"
          style={{ color: "rgba(255,255,255,0.87)" }}
        >
          쿠팡 매출 대시보드
        </h1>
        <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          비밀번호를 입력하세요
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
            style={{
              backgroundColor: "#13141F",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.87)",
            }}
          />
          {error && (
            <p className="text-sm text-pink-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #7B70EE, #00CFAA)",
            }}
          >
            {loading ? "확인 중..." : "입장"}
          </button>
        </form>
      </div>
    </main>
  );
}
