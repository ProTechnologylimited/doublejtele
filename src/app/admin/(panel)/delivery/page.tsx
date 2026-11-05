import { prisma } from "@/lib/db";
import ZoneForm from "@/components/ZoneForm";
import DeleteButton from "@/components/DeleteButton";
export const dynamic = "force-dynamic";
export default async function Delivery() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { name: "asc" } });
  return <><h1 className="mb-1 text-2xl font-bold">Delivery zones</h1>
    <p className="mb-4 text-sm text-mid">Leave state, city and LGA blank to cover everywhere; the most specific matching zone wins. Customers outside every active zone are told delivery must be confirmed.</p>
    <ZoneForm /><div className="mt-4 overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr><th className="p-3">Zone</th><th>Area</th><th>Fee</th><th>ETA</th><th>Active</th><th /></tr></thead>
      <tbody>{zones.map(z => <tr key={z.id} className="border-t border-mid/20"><td className="p-3">{z.name}</td><td>{[z.lga, z.city, z.state].filter(Boolean).join(", ") || "Everywhere"}</td>
        <td>₦{(z.fee / 100).toLocaleString("en-NG")}{z.freeOver ? ` (free over ₦${(z.freeOver / 100).toLocaleString("en-NG")})` : ""}</td><td>{z.etaMinDays}–{z.etaMaxDays} days</td><td>{z.active ? "Yes" : "No"}</td>
        <td className="p-2"><DeleteButton url={`/api/admin/delivery-zones/${z.id}`} what={z.name} /></td></tr>)}
        {!zones.length && <tr><td colSpan={6} className="p-6 text-center text-mid">No zones yet — customers cannot check out until you add one.</td></tr>}</tbody></table></div></>;
}
