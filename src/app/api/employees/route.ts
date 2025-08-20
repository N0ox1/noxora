import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/employees?slug=barbearia-dev
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug, isActive: true } });
  if (!shop) return NextResponse.json({ error: "shop not found" }, { status: 404 });

  const employees = await prisma.employee.findMany({
    where: { tenantId, barbershopId: shop.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, isActive: true }
  });
  return NextResponse.json(employees);
}

// POST /api/employees
export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id") || "";
  if (!tenantId) return NextResponse.json({ error: "tenant required" }, { status: 400 });
  const { slug, name, isActive = true } = await req.json();
  if (!slug || !name) return NextResponse.json({ error: "slug,name required" }, { status: 400 });

  const shop = await prisma.barbershop.findFirst({ where: { tenantId, slug } });
  if (!shop) return NextResponse.json({ error: "shop not found" }, { status: 404 });

  const emp = await prisma.employee.create({ data: { tenantId, barbershopId: shop.id, name, isActive } });
  return NextResponse.json(emp, { status: 201 });
}
