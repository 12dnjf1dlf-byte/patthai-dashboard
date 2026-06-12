import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type User = {
  username: string;
  password: string;
  name: string;
  tabs: string[]; // 허용 탭: "coupang" | "namyu" | "order"
};

const USERS: User[] = [
  { username: "cxzwhdfhr", password: "whdfhr1!", name: "관리자", tabs: ["coupang", "namyu", "order"] },
  { username: "바질클럽", password: "qkwlf1!", name: "바질클럽", tabs: ["coupang"] },
  { username: "남유에프엔씨", password: "skadb1!", name: "남유에프엔씨", tabs: ["namyu", "order"] },
];

function getUsers(): User[] {
  try {
    const env = process.env.DASHBOARD_USERS;
    return env ? JSON.parse(env) : USERS;
  } catch {
    return USERS;
  }
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    "dashboard_user",
    JSON.stringify({ name: user.name, tabs: user.tabs }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );

  return NextResponse.json({ ok: true, tabs: user.tabs });
}
