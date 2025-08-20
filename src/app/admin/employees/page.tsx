"use client";
import { useEffect, useState } from "react";
const TENANT=process.env.NEXT_PUBLIC_DEV_TENANT!; const SLUG="barbearia-dev";

export default function EmployeesPage(){
  const [items,setItems]=useState<any[]>([]);
  const [name,setName]=useState("");
  async function load(){
    const r=await fetch(`/api/employees?slug=${SLUG}`,{headers:{"x-tenant-id":TENANT}});
    setItems(await r.json());
  }
  useEffect(()=>{load();},[]);
  async function create(){
    const r=await fetch(`/api/employees`,{
      method:"POST",headers:{"content-type":"application/json","x-tenant-id":TENANT},
      body:JSON.stringify({slug:SLUG,name})
    });
    if(r.ok){ setName(""); load(); }
  }
  return (
    <div>
      <h1>Profissionais</h1>
      <div style={{display:"flex",gap:8,margin:"12px 0"}}>
        <input placeholder="Nome" value={name} onChange={e=>setName(e.target.value)}/>
        <button onClick={create} disabled={!name}>Adicionar</button>
      </div>
      <ul>{items.map(it=>(<li key={it.id}>{it.name} {it.isActive?"" :"(inativo)"}</li>))}</ul>
    </div>
  );
}
