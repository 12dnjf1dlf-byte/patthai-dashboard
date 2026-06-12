import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "쿠팡 매출 대시보드",
  description: "쿠팡 매출 현황 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
