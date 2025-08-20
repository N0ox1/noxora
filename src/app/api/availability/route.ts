import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function addMin(d: Date, m: number) { return new Date(d.getTime() + m * 60_000); }

export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const employeeId = url.searchParams.get("employeeId");
  const serviceId = url.searchParams.get("serviceId");
  const date = url.searchParams.get("date"); // YYYY-MM-DD

  if (!slug || !employeeId || !serviceId || !date)
    return NextResponse.json({ error: "slug, employeeId, serviceId, date required" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug, isActive: true } });
  if (!shop) return NextResponse.json({ error: "shop not found" }, { status: 404 });

  const svc = await prisma.service.findFirst({ where: { tenantId, id: serviceId, barbershopId: shop.id, isActive: true } });
  if (!svc) return NextResponse.json({ error: "service not found" }, { status: 404 });

  const emp = await prisma.employee.findFirst({ where: { tenantId, id: employeeId, barbershopId: shop.id, isActive: true } });
  if (!emp) return NextResponse.json({ error: "employee not found" }, { status: 404 });

  // janela simplificada [09:00,18:00) UTC. Ajuste fuso depois.
  const dayStart = new Date(`${date}T09:00:00.000Z`);
  const dayEnd   = new Date(`${date}T18:00:00.000Z`);
  const stepMin = 15;

  const appts = await prisma.appointment.findMany({
    where: {
      tenantId, employeeId: emp.id,
      startAt: { lt: dayEnd }, endAt: { gt: dayStart },
      status: { in: ["confirmed", "pending"] }
    },
    select: { startAt: true, endAt: true }
  });

  const slots: string[] = [];
  for (let t = new Date(dayStart); t < dayEnd; t = addMin(t, stepMin)) {
    const start = t;
    const end = addMin(start, svc.durationMin);
    if (end > dayEnd) break;
    const conflict = appts.some(a => start < a.endAt && a.startAt < end);
    if (!conflict) slots.push(start.toISOString());
  }

  return NextResponse.json({ slots });
}
