import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({
    where: { tenantId, slug, isActive: true },
    include: { services: { where: { isActive: true }, orderBy: { name: "asc" } } }
  });

  if (!shop) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    services: shop.services.map(s => ({
      id: s.id, name: s.name, durationMin: s.durationMin, priceCents: s.priceCents
    }))
  });
}
