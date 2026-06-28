import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const accessCode = process.env.ACCESS_CODE;

  if (!accessCode || code !== accessCode) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("rf_access", accessCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return res;
}
