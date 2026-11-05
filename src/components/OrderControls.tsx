"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type D = { courier: string; trackingNo: string; etaFrom: string; etaTo: string; notes: string };
export default function OrderControls({ id, next, d }: { id: string; next: string[]; d: D }) {
  const r = useRouter(); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (f.status === "REFUNDED" && !confirm("This sends a refund request to Paystack. Continue?")) return;
    const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, status: f.status || undefined }) });
    const j = await res.json(); if (res.ok) { setMsg({ ok: true, t: "Saved." }); r.refresh() } else setMsg({ ok: false, t: j.error });
  }
  const I = (n: keyof D, l: string, t = "text") => <label className="text-sm">{l}<input name={n} type={t} defaultValue={d[n]} className="input mt-1" /></label>;
  return <form onSubmit={submit} className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-2 print:hidden">
    <label className="text-sm">Move to status<select name="status" className="input mt-1"><option value="">(no change)</option>{next.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></label>
    <label className="text-sm">Status note<input name="note" className="input mt-1" /></label>
    {I("courier", "Courier")}{I("trackingNo", "Tracking number")}{I("etaFrom", "Estimated delivery from", "date")}{I("etaTo", "Estimated delivery to", "date")}
    <label className="text-sm md:col-span-2">Internal notes (never shown to customer)<textarea name="notes" defaultValue={d.notes} rows={2} className="input mt-1" /></label>
    <div className="flex gap-2 md:col-span-2"><button className="btn">Save</button><button type="button" className="btn !bg-ink !text-gold" onClick={() => window.print()}>Print invoice</button></div>
    {msg && <p role="status" className={`md:col-span-2 text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.t}</p>}</form>;
}
