import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServiceSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!slug || !tenantId) return NextResponse.json({ error: "slug and tenant required" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug, isActive: true } });
  if (!shop) return NextResponse.json({ error: "shop not found" }, { status: 404 });

  const services = await prisma.service.findMany({
    where: { tenantId, barbershopId: shop.id, isActive: true },
    orderBy: { name: "asc" }
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });

  const body = await req.json();
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { slug, name, durationMin, priceCents } = parsed.data;

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug } });
  if (!shop) return NextResponse.json({ error: "shop not found" }, { status: 404 });

  const svc = await prisma.service.create({
    data: { tenantId, barbershopId: shop.id, name, durationMin, priceCents }
  });

  return NextResponse.json(svc, { status: 201 });
}
