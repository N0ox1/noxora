import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });
  const { name, durationMin, priceCents, isActive } = await req.json();
  const svc = await prisma.service.update({
    where: { id },
    data: { name, durationMin, priceCents, isActive }
  }).catch(() => null);
  if (!svc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(svc);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const svc = await prisma.service.update({ where: { id }, data: { isActive: false } }).catch(() => null);
  if (!svc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
