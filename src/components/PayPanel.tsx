"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
const H = { "content-type": "application/json" };
export default function PayPanel({ orderRef, token, reference }: { orderRef: string; token: string; reference?: string }) {
  const r = useRouter(); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!reference) return; (async () => {
    setMsg("Checking your payment…");
    const res = await fetch("/api/pay/verify", { method: "POST", headers: H, body: JSON.stringify({ ref: orderRef, token, reference }) });
    setMsg((await res.json()).message || ""); r.refresh(); })() }, [reference]);
  async function pay() {
    setBusy(true); setMsg("");
    const res = await fetch("/api/pay", { method: "POST", headers: H, body: JSON.stringify({ ref: orderRef, token }) }), j = await res.json();
    if (res.ok) location.href = j.url; else { setMsg(j.error); setBusy(false) }
  }
  return <div className="rounded-xl bg-white p-4"><button className="btn" onClick={pay} disabled={busy}>{busy ? "Redirecting…" : "Pay now"}</button>{msg && <p role="status" className="mt-2 text-sm">{msg}</p>}</div>;
}
