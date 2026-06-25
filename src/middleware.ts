import { NextRequest, NextResponse } from "next/server";

const TAB_ROUTES: Record<string, string> = {
  "/coupang": "coupang",
  "/ad": "ad",
  "/order": "order",
  "/nutralap": "nutralap",
  "/promidis": "promidis",
  "/summary": "summary",
};

// 로그인 없이 공개 접근 허용 경로
const PUBLIC_PATHS = ["/namyu"];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const userCookie = req.cookies.get("dashboard_user")?.value;

  if (!userCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 탭별 권한 체크
  const pathname = req.nextUrl.pathname;
  const requiredTab = TAB_ROUTES[pathname];

  if (requiredTab) {
    try {
      const user = JSON.parse(userCookie);
      if (!user.tabs?.includes(requiredTab)) {
        // 권한 없으면 첫 번째 허용 탭으로
        const firstTab = user.tabs?.[0];
        const tabToRoute: Record<string, string> = {
          coupang: "/coupang", ad: "/ad", namyu: "/namyu",
          order: "/order", nutralap: "/nutralap", promidis: "/promidis", summary: "/summary",
        };
        const dest = firstTab ? (tabToRoute[firstTab] ?? "/login") : "/login";
        return NextResponse.redirect(new URL(dest, req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next|favicon.ico).*)"],
};
