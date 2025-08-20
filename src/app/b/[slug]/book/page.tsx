"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";

const TENANT = process.env.NEXT_PUBLIC_DEV_TENANT!;

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const serviceId = search.get("serviceId") || "";

  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [client, setClient] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/employees?slug=${slug}`, { headers: { "x-tenant-id": TENANT } })
      .then(r => r.json()).then(setEmployees).catch(() => setEmployees([]));
  }, [slug]);

  useEffect(() => {
    if (employees.length && !employeeId) setEmployeeId(employees[0].id);
  }, [employees, employeeId]);

  useEffect(() => {
    if (!slug || !employeeId || !serviceId || !date) return;
    setSlots([]);
    fetch(`/api/availability?slug=${slug}&employeeId=${employeeId}&serviceId=${serviceId}&date=${date}`, {
      headers: { "x-tenant-id": TENANT }
    })
      .then(r => r.json())
      .then(d => setSlots(Array.isArray(d.slots) ? d.slots : []))
      .catch(() => setSlots([]));
  }, [slug, employeeId, serviceId, date]);

  const slotLocal = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const canConfirm = useMemo(() =>
    serviceId && employeeId && slot && client.name.length >= 2 && client.phone.length >= 8,
  [serviceId, employeeId, slot, client]);

  async function confirm() {
    setLoading(true); setMsg("");
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "content-type": "application/json", "x-tenant-id": TENANT },
      body: JSON.stringify({
        slug, serviceId, employeeId, startAt: slot,
        client: { name: client.name, phone: client.phone, email: client.email || undefined }
      })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setMsg(data?.error === "conflict" ? "Horário indisponível." : "Erro ao confirmar."); return; }
    setMsg("Agendamento confirmado.");
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Agendar</h1>

      <section>
        <label className="block text-sm font-medium">Profissional</label>
        <select className="mt-1 border rounded p-2 w-full"
          value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Data</label>
          <input type="date" className="mt-1 border rounded p-2 w-full"
            value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Horário</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {slots.length === 0 && <span className="text-sm text-gray-500">Sem horários</span>}
            {slots.map(s => (
              <button key={s}
                onClick={() => setSlot(s)}
                className={`px-3 py-2 rounded border ${slot===s ? "bg-black text-white" : "bg-white"}`}>
                {slotLocal(s)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Nome</label>
          <input className="mt-1 border rounded p-2 w-full"
            value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Telefone (WhatsApp)</label>
          <input className="mt-1 border rounded p-2 w-full"
            value={client.phone} onChange={e => setClient({ ...client, phone: e.target.value })} />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Email (opcional)</label>
          <input className="mt-1 border rounded p-2 w-full"
            value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />
        </div>
      </section>

      <button
        onClick={confirm}
        disabled={!canConfirm || loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Confirmando..." : "Confirmar agendamento"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
