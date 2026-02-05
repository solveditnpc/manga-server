import { NextResponse, NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);

  headers.set("x-pathname", req.nextUrl.pathname);
  headers.set("x-search", req.nextUrl.search);
  
  return NextResponse.next({
    request: { headers },
  });
}

export const config = {
  matcher: "/:path*",
};
