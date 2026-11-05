import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";
import PayPanel from "@/components/PayPanel";
import SiteHeader from "@/components/SiteHeader";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function OrderPage({ params, searchParams }: { params: { ref: string }; searchParams: { t?: string; reference?: string; trxref?: string } }) {
  const o = await prisma.order.findUnique({ where: { ref: params.ref }, include: { items: true, history: { orderBy: { at: "asc" } } } });
  if (!o || !searchParams.t || searchParams.t !== o.accessToken) notFound(); // order number alone reveals nothing
  return <><SiteHeader /><main className="mx-auto max-w-2xl space-y-3 p-4"><h1 className="text-2xl font-bold">Order {o.ref}</h1>
    <p className="rounded-xl bg-white p-4">Status: <b>{o.status.replace(/_/g, " ")}</b>{o.etaFrom && o.etaTo && <> · Estimated delivery {o.etaFrom.toDateString()} – {o.etaTo.toDateString()}</>}{o.trackingNo && <> · {o.courier} {o.trackingNo}</>}</p>
    {o.status === "PENDING_PAYMENT" && <PayPanel orderRef={o.ref} token={o.accessToken} reference={searchParams.reference || searchParams.trxref} />}
    <ul className="divide-y rounded-xl bg-white">{o.items.map(i => <li key={i.id} className="flex justify-between p-3"><span>{i.nameSnapshot} × {i.qty}</span><b>{naira(i.unitPrice * i.qty)}</b></li>)}
      <li className="flex justify-between p-3"><span>Delivery ({o.zoneName})</span><b>{naira(o.deliveryFee)}</b></li><li className="flex justify-between p-3 text-lg"><span>Total</span><b className="text-dgold">{naira(o.total)}</b></li></ul>
    <ol className="rounded-xl bg-white p-4 text-sm">{o.history.map(h => <li key={h.id}>{h.at.toLocaleString("en-NG")} – {h.status.replace(/_/g, " ")}{h.note && ` (${h.note})`}</li>)}</ol>
    <p className="text-sm text-mid">Keep this page’s link private; it is your secure link to this order.</p></main></>;
}
