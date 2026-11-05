"use client";
import { useState } from "react";
import { DEFAULTS } from "@/lib/settings-defaults";
const AREA = new Set(["description", "returnPolicy", "refundPolicy", "warrantyPolicy", "privacyPolicy", "terms"]);
const LABEL: Record<string, string> = { storeName: "Store name", logoUrl: "Logo image URL", description: "Store description", phone: "Business phone", email: "Business email", address: "Business address", currency: "Currency (display only for now)",
  timezone: "Time zone", facebook: "Facebook URL", instagram: "Instagram URL", x: "X/Twitter URL", whatsapp: "WhatsApp link", promoText: "Homepage promo banner text", returnPolicy: "Return policy", refundPolicy: "Refund policy",
  warrantyPolicy: "Warranty policy", privacyPolicy: "Privacy policy", terms: "Terms and conditions" };
export default function SettingsForm({ s }: { s: typeof DEFAULTS }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    const j = await res.json(); setMsg(res.ok ? { ok: true, t: "Settings saved." } : { ok: false, t: j.error });
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl bg-white p-4 md:grid-cols-2">
    {(Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]).map(k => <label key={k} className={`text-sm ${AREA.has(k) ? "md:col-span-2" : ""}`}>{LABEL[k]}
      {AREA.has(k) ? <textarea name={k} defaultValue={s[k]} rows={4} className="input mt-1" /> : <input name={k} defaultValue={s[k]} className="input mt-1" />}</label>)}
    <button className="btn md:col-span-2">Save settings</button>{msg && <p role="status" className={`md:col-span-2 text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.t}</p>}</form>;
}
