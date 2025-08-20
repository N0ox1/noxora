"use client";
import { useEffect, useState } from "react";
const TENANT=process.env.NEXT_PUBLIC_DEV_TENANT!;

export default function ClientsPage(){
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState({name:"",phone:"",email:""});
  async function load(){
    const r=await fetch(`/api/clients`,{headers:{"x-tenant-id":TENANT}});
    setItems(await r.json());
  }
  useEffect(()=>{load();},[]);
  async function create(){
    const r=await fetch(`/api/clients`,{
      method:"POST",headers:{"content-type":"application/json","x-tenant-id":TENANT},
      body:JSON.stringify({name:form.name,phone:form.phone,email:form.email||undefined})
    });
    if(r.ok){ setForm({name:"",phone:"",email:""}); load(); }
  }
  return (
    <div>
      <h1>Clientes</h1>
      <div style={{display:"grid",gap:8,maxWidth:420,margin:"12px 0"}}>
        <input placeholder="Nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Telefone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input placeholder="Email (opcional)" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <button onClick={create} disabled={!form.name || !form.phone}>Adicionar</button>
      </div>
      <ul>{items.map(it=>(<li key={it.id}>{it.name} • {it.phone}</li>))}</ul>
    </div>
  );
}
