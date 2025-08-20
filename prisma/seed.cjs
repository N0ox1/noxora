const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const tenantId = "dev-tenant-1";

  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: { id: tenantId, name: "Tenant Dev", plan: "BASIC", isActive: true },
  });

  const shop = await prisma.barbershop.upsert({
    where: { tenantId_slug: { tenantId, slug: "barbearia-dev" } },
    update: {},
    create: { tenantId, name: "Barbearia Dev", slug: "barbearia-dev", isActive: true },
  });

  await prisma.employee.upsert({
    where: { id: "emp-dev-1" },
    update: {},
    create: { id: "emp-dev-1", tenantId, barbershopId: shop.id, name: "João", isActive: true },
  });

  await prisma.service.createMany({
    data: [
      { tenantId, barbershopId: shop.id, name: "Corte", durationMin: 30, priceCents: 4000 },
      { tenantId, barbershopId: shop.id, name: "Barba",  durationMin: 20, priceCents: 3000 },
    ],
    skipDuplicates: true,
  });

  console.log("Seed ok");
}

main().catch(e => { console.error(e); process.exit(1); })
      .finally(() => prisma.$disconnect());
