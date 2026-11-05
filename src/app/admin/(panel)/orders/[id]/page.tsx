import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";
import { NEXT } from "@/lib/orders";
import OrderControls from "@/components/OrderControls";
export const dynamic = "force-dynamic";
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
export default async function OrderDetail({ params }: { params: { id: string } }) {
  const o = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true, payments: true, history: { orderBy: { at: "asc" } } } });
  if (!o) notFound(); const a = o.address as any;
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Invoice / Order {o.ref}</h1>
    <section className="grid gap-2 rounded-xl bg-white p-4 text-sm md:grid-cols-2"><div><b>{o.name}</b><br />{o.email}<br />{o.phone}</div>
      <div>{a.line}<br />{[a.lga, a.city, a.state, a.country].filter(Boolean).join(", ")}{a.notes && <><br /><i>{a.notes}</i></>}</div>
      <div>Status: <b>{o.status.replace(/_/g, " ")}</b><br />Payment: {o.payments.map(p => `${p.provider} ${p.status}`).join(", ") || "none yet"}</div><div>Placed {o.createdAt.toLocaleString("en-NG")}</div></section>
    <ul className="divide-y rounded-xl bg-white text-sm">{o.items.map(i => <li key={i.id} className="flex justify-between p-3"><span>{i.nameSnapshot} × {i.qty}</span><b>{naira(i.unitPrice * i.qty)}</b></li>)}
      <li className="flex justify-between p-3"><span>Delivery ({o.zoneName})</span><b>{naira(o.deliveryFee)}</b></li><li className="flex justify-between p-3 text-base"><span>Total</span><b>{naira(o.total)}</b></li></ul>
    <OrderControls id={o.id} next={NEXT[o.status].filter(s => s !== "PAYMENT_CONFIRMED")} d={{ courier: o.courier || "", trackingNo: o.trackingNo || "", etaFrom: iso(o.etaFrom), etaTo: iso(o.etaTo), notes: o.notes || "" }} />
    <ol className="rounded-xl bg-white p-4 text-sm print:hidden">{o.history.map(h => <li key={h.id}>{h.at.toLocaleString("en-NG")} – {h.status.replace(/_/g, " ")}{h.note && ` (${h.note})`}</li>)}</ol></div>;
}
