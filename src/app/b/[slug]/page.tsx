import Link from "next/link";

async function getData(tenantId: string, slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/barbershop/public/${slug}`, {
    headers: { "x-tenant-id": tenantId }, next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error("barbershop not found");
  return res.json();
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT!;
  const data = await getData(tenantId, slug);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{data.name}</h1>
      <ul className="mt-4 space-y-2">
        {data.services.map((s: any) => (
          <li key={s.id} className="border p-3 rounded-lg">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm">{s.durationMin} min • R$ {(s.priceCents/100).toFixed(2)}</div>
            <Link className="mt-2 inline-block text-blue-600 underline"
              href={`/b/${slug}/book?serviceId=${s.id}`}>
              Agendar
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
