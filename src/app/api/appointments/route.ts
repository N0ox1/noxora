import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/appointments?slug=barbearia-dev&date=YYYY-MM-DD
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const date = url.searchParams.get("date");
  if (!slug || !date) return NextResponse.json({ error: "slug,date required" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug } });
  if (!shop) return NextResponse.json({ error: "shop not found" }, { status: 404 });

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  const appts = await prisma.appointment.findMany({
    where: { 
      tenantId, 
      barbershopId: shop.id, 
      startAt: { gte: start, lte: end }
    },
    orderBy: { startAt: "asc" },
    include: {
      service: { select: { name: true, durationMin: true } },
      employee: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, phone: true } }
    }
  });

  return NextResponse.json(appts);
}
