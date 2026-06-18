import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  // 로그인된 사용자만 허용
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("dashboard_user")?.value;
  if (!userCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 모든 대시보드 경로 재검증
  const paths = ["/coupang", "/ad", "/namyu", "/order", "/nutralap", "/promidis", "/summary"];
  paths.forEach((p) => revalidatePath(p));

  return NextResponse.json({ ok: true, revalidated: paths, at: new Date().toISOString() });
}
