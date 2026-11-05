import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";
const naira = (k: number) => "₦" + (k / 100).toLocaleString("en-NG");
export default async function Dashboard() {
  const [byStatus, sales, products, low, customers] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ["PENDING_PAYMENT", "CANCELLED", "REFUNDED"] } } }),
    prisma.product.count(), prisma.product.count({ where: { stock: { lte: 5 }, active: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);
  const n = (s: string) => byStatus.find(x => x.status === s)?._count ?? 0;
  const cards: [string, string | number][] = [
    ["Total sales", naira(sales._sum.total ?? 0)], ["Total orders", byStatus.reduce((t, x) => t + x._count, 0)],
    ["Pending payment", n("PENDING_PAYMENT")], ["Processing", n("PROCESSING")], ["Shipped", n("SHIPPED")],
    ["Delivered", n("DELIVERED")], ["Cancelled", n("CANCELLED")], ["Products", products], ["Low stock (≤5)", low], ["Customers", customers]];
  return <><h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{cards.map(([k, v]) =>
      <div key={k} className="rounded-xl border border-mid/30 bg-white p-4"><div className="text-sm text-mid">{k}</div><div className="text-xl font-extrabold text-dgold">{v}</div></div>)}</div></>;
}
