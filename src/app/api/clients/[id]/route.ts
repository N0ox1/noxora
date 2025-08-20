import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });
  const { name, phone, email } = await req.json();
  const cli = await prisma.client.update({ where: { id }, data: { name, phone, email: email ?? null } }).catch(() => null);
  if (!cli) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(cli);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // hard delete simples (ok no MVP)
  const cli = await prisma.client.delete({ where: { id } }).catch(() => null);
  if (!cli) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
