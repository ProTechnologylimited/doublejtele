import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";
export const dynamic = "force-dynamic";
export default async function Orders({ searchParams: s }: { searchParams: { q?: string; status?: string; from?: string; to?: string } }) {
  const q = s.q?.trim();
  const where: any = { ...(s.status && s.status in OrderStatus ? { status: s.status } : {}),
    ...(s.from || s.to ? { createdAt: { ...(s.from ? { gte: new Date(s.from) } : {}), ...(s.to ? { lte: new Date(s.to + "T23:59:59") } : {}) } } : {}),
    ...(q ? { OR: ["ref", "name", "phone", "email"].map(f => ({ [f]: { contains: q, mode: "insensitive" } })) } : {}) };
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  return <><h1 className="mb-4 text-2xl font-bold">Orders</h1>
    <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={q} placeholder="Order no., name, phone…" aria-label="Search" className="input !w-auto flex-1" />
      <select name="status" defaultValue={s.status} aria-label="Status" className="input !w-auto"><option value="">All statuses</option>{Object.keys(OrderStatus).map(k => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}</select>
      <input type="date" name="from" defaultValue={s.from} aria-label="From date" className="input !w-auto" /><input type="date" name="to" defaultValue={s.to} aria-label="To date" className="input !w-auto" /><button className="btn">Filter</button></form>
    <div className="overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr><th className="p-3">Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>{orders.map(o => <tr key={o.id} className="border-t border-mid/20"><td className="p-3"><Link className="font-bold underline" href={`/admin/orders/${o.id}`}>{o.ref}</Link></td>
        <td>{o.name}<div className="text-xs text-mid">{o.phone}</div></td><td>{naira(o.total)}</td><td>{o.status.replace(/_/g, " ")}</td><td>{o.createdAt.toLocaleDateString("en-NG")}</td></tr>)}
        {!orders.length && <tr><td colSpan={5} className="p-6 text-center text-mid">No orders found.</td></tr>}</tbody></table></div></>;
}
