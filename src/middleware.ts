import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const host = req.headers.get("host") || "";
  const xTenant = req.headers.get("x-tenant-id");

  const sub = host.split(".")[0];
  const tenantFromSub = sub && sub !== "www" ? sub : null;
  const needsTenant = url.pathname.startsWith("/api/barbershop/public") || url.pathname.startsWith("/b/");

  if (needsTenant && !xTenant && !tenantFromSub) return new NextResponse("Missing X-Tenant-Id", { status: 400 });

  const res = NextResponse.next();
  if (tenantFromSub && !xTenant) res.headers.set("x-tenant-id", tenantFromSub);
  return res;
}

export const config = { matcher: ["/api/:path*", "/b/:path*"] };
