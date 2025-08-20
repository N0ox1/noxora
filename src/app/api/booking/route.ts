import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validators";

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });

  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { slug, serviceId, employeeId, startAt, client } = parsed.data;
  const start = new Date(startAt);

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug, isActive: true } });
  if (!shop) return NextResponse.json({ error: "shop not found" }, { status: 404 });

  const svc = await prisma.service.findFirst({ where: { tenantId, id: serviceId, barbershopId: shop.id, isActive: true } });
  if (!svc) return NextResponse.json({ error: "service not found" }, { status: 404 });

  const emp = await prisma.employee.findFirst({ where: { tenantId, id: employeeId, barbershopId: shop.id, isActive: true } });
  if (!emp) return NextResponse.json({ error: "employee not found" }, { status: 404 });

  const end = new Date(start.getTime() + svc.durationMin * 60_000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // conflito: qualquer agendamento ativo que sobreponha o intervalo
      const conflicts = await tx.appointment.findMany({
        where: {
          tenantId,
          employeeId: emp.id,
          status: { in: ["confirmed", "pending"] },
          OR: [{ startAt: { lt: end }, endAt: { gt: start } }]
        },
        select: { id: true, startAt: true, endAt: true }
      });
      if (conflicts.some(c => overlaps(c.startAt, c.endAt, start, end))) throw new Error("time_conflict");

      const cli = await tx.client.upsert({
        where: { tenantId_phone: { tenantId, phone: client.phone } },
        update: { name: client.name, email: client.email ?? null },
        create: { tenantId, name: client.name, phone: client.phone, email: client.email ?? null }
      });

      const appt = await tx.appointment.create({
        data: {
          tenantId,
          barbershopId: shop.id,
          employeeId: emp.id,
          clientId: cli.id,
          serviceId: svc.id,
          startAt: start,
          endAt: end,
          status: "confirmed"
        }
      });

      return { apptId: appt.id, startAt: appt.startAt, endAt: appt.endAt };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    if (e?.message === "time_conflict") {
      return NextResponse.json({ error: "conflict" }, { status: 409 });
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
