"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function CouponForm({ cats }: { cats: { id: string; name: string }[] }) {
  const r = useRouter(); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget, f = new FormData(form), v = Number(f.get("value")), pct = f.get("type") === "percent", k = (x: FormDataEntryValue | null) => x ? Math.round(Number(x) * 100) : null;
    const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: f.get("code"), percentOff: pct ? v : null, amountOff: pct ? null : Math.round(v * 100),
      minOrder: k(f.get("minOrder")), startsAt: f.get("startsAt") || null, expiresAt: f.get("expiresAt") || null, maxUses: f.get("maxUses") ? Number(f.get("maxUses")) : null, categoryIds: f.getAll("categoryIds") }) });
    const j = await res.json(); if (res.ok) { setMsg({ ok: true, t: "Coupon created." }); form.reset(); r.refresh() } else setMsg({ ok: false, t: j.error + (j.issues ? " " + JSON.stringify(j.issues) : "") });
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-3">
    <label className="text-sm">Code<input name="code" required className="input mt-1" /></label>
    <label className="text-sm">Type<select name="type" className="input mt-1"><option value="percent">Percentage (%)</option><option value="amount">Fixed amount (₦)</option></select></label>
    <label className="text-sm">Value<input name="value" type="number" min="1" step="0.01" required className="input mt-1" /></label>
    <label className="text-sm">Minimum order (₦)<input name="minOrder" type="number" step="0.01" className="input mt-1" /></label>
    <label className="text-sm">Starts<input name="startsAt" type="date" className="input mt-1" /></label><label className="text-sm">Expires<input name="expiresAt" type="date" className="input mt-1" /></label>
    <label className="text-sm">Max uses<input name="maxUses" type="number" min="1" className="input mt-1" /></label>
    <label className="text-sm md:col-span-2">Only these categories (none selected = whole store)<select name="categoryIds" multiple className="input mt-1 h-24">{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <button className="btn md:col-span-3">Create coupon</button>{msg && <p role="status" className={`md:col-span-3 text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.t}</p>}</form>;
}
