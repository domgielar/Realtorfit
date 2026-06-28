import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "rf_access";
const GATE_PATH = "/gate";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the gate page and its form action
  if (pathname.startsWith(GATE_PATH)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  const accessCode = process.env.ACCESS_CODE;

  if (!accessCode || cookie?.value === accessCode) {
    return NextResponse.next();
  }

  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = GATE_PATH;
  return NextResponse.redirect(gateUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
