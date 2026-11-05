import { prisma } from "@/lib/db";
import CouponForm from "@/components/CouponForm";
import DeleteButton from "@/components/DeleteButton";
import ToggleButton from "@/components/ToggleButton";
export const dynamic = "force-dynamic";
export default async function Coupons() {
  const [cats, cs] = await Promise.all([prisma.category.findMany({ orderBy: { name: "asc" } }), prisma.coupon.findMany({ orderBy: { code: "asc" } })]);
  return <><h1 className="mb-4 text-2xl font-bold">Coupons</h1><CouponForm cats={cats.map(c => ({ id: c.id, name: c.name }))} />
    <div className="mt-4 overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr><th className="p-3">Code</th><th>Discount</th><th>Used</th><th>Expires</th><th>Active</th><th /></tr></thead>
      <tbody>{cs.map(c => <tr key={c.id} className="border-t border-mid/20"><td className="p-3 font-bold">{c.code}</td><td>{c.percentOff ? c.percentOff + "%" : "₦" + ((c.amountOff || 0) / 100).toLocaleString("en-NG")}</td>
        <td>{c.used}{c.maxUses ? ` / ${c.maxUses}` : ""}</td><td>{c.expiresAt ? c.expiresAt.toLocaleDateString("en-NG") : "—"}</td><td>{c.active ? "Yes" : "No"}</td>
        <td className="flex gap-2 p-2"><ToggleButton url={`/api/admin/coupons/${c.id}`} active={c.active} /><DeleteButton url={`/api/admin/coupons/${c.id}`} what={c.code} /></td></tr>)}
        {!cs.length && <tr><td colSpan={6} className="p-6 text-center text-mid">No coupons yet.</td></tr>}</tbody></table></div></>;
}
