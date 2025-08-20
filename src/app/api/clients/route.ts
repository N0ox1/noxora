import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/clients?query=jo&limit=20
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });
  const url = new URL(req.url);
  const q = (url.searchParams.get("query") || "").trim();
  const take = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const clients = await prisma.client.findMany({
    where: q ? {
      tenantId,
      OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }]
    } : { tenantId },
    orderBy: { updatedAt: "desc" },
    take,
    select: { id: true, name: true, phone: true, email: true }
  });
  return NextResponse.json(clients);
}

// POST /api/clients
export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });
  const { name, phone, email } = await req.json();
  if (!name || !phone) return NextResponse.json({ error: "name,phone required" }, { status: 400 });

  const cli = await prisma.client.upsert({
    where: { tenantId_phone: { tenantId, phone } },
    update: { name, email: email ?? null },
    create: { tenantId, name, phone, email: email ?? null }
  });
  return NextResponse.json(cli, { status: 201 });
}
