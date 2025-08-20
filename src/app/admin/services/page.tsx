"use client";
import { useEffect, useState } from "react";
const TENANT = process.env.NEXT_PUBLIC_DEV_TENANT!;
const SLUG = "barbearia-dev";

export default function ServicesPage() {
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState({name:"",durationMin:30,priceCents:3000});
  const [msg,setMsg]=useState("");

  async function load(){
    const r=await fetch(`/api/services?slug=${SLUG}`,{headers:{"x-tenant-id":TENANT}});
    setItems(await r.json());
  }
  useEffect(()=>{load();},[]);

  async function create(){
    setMsg("");
    const r=await fetch(`/api/services`,{
      method:"POST",
      headers:{"content-type":"application/json","x-tenant-id":TENANT},
      body:JSON.stringify({slug:SLUG,...form})
    });
    if(r.ok){ setForm({name:"",durationMin:30,priceCents:3000}); load(); } else setMsg("erro");
  }

  return (
    <div>
      <h1>Serviços</h1>
      <div style={{display:"grid",gap:8,maxWidth:420,margin:"12px 0"}}>
        <input placeholder="Nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input type="number" placeholder="Duração (min)" value={form.durationMin} onChange={e=>setForm({...form,durationMin:+e.target.value})}/>
        <input type="number" placeholder="Preço (centavos)" value={form.priceCents} onChange={e=>setForm({...form,priceCents:+e.target.value})}/>
        <button onClick={create} disabled={!form.name}>Adicionar</button>
        {msg && <small>{msg}</small>}
      </div>
      <ul>
        {items.map(it=>(
          <li key={it.id}>{it.name} • {it.durationMin} min • R$ {(it.priceCents/100).toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
