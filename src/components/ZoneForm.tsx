"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ZoneForm() {
  const r = useRouter(); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget, f = new FormData(form), k = (v: FormDataEntryValue | null) => v ? Math.round(Number(v) * 100) : null;
    const res = await fetch("/api/admin/delivery-zones", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      name: f.get("name"), state: f.get("state") || undefined, city: f.get("city") || undefined, lga: f.get("lga") || undefined, fee: k(f.get("fee")) ?? 0,
      etaMinDays: Number(f.get("min")), etaMaxDays: Number(f.get("max")), freeOver: k(f.get("freeOver")), sameDay: f.get("sameDay") === "on", express: f.get("express") === "on", active: f.get("active") === "on" }) });
    const j = await res.json(); if (res.ok) { setMsg({ ok: true, t: "Zone saved." }); form.reset(); r.refresh() } else setMsg({ ok: false, t: j.error + (j.issues ? " " + JSON.stringify(j.issues) : "") });
  }
  const I = (n: string, l: string, p = {}) => <label className="text-sm">{l}<input name={n} className="input mt-1" {...p} /></label>;
  return <form onSubmit={submit} className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-3">
    {I("name", "Zone name", { required: true })}{I("state", "State")}{I("city", "City")}{I("lga", "LGA")}
    {I("fee", "Delivery fee (₦)", { type: "number", min: 0, step: "0.01", required: true })}{I("freeOver", "Free delivery over (₦, optional)", { type: "number", step: "0.01" })}
    {I("min", "ETA min days", { type: "number", min: 0, required: true })}{I("max", "ETA max days", { type: "number", min: 0, required: true })}
    <div className="flex flex-wrap items-end gap-4 text-sm"><label><input name="sameDay" type="checkbox" /> Same-day</label><label><input name="express" type="checkbox" /> Express</label><label><input name="active" type="checkbox" defaultChecked /> Active</label></div>
    <button className="btn md:col-span-3">Add delivery zone</button>{msg && <p role="status" className={`md:col-span-3 text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.t}</p>}</form>;
}
