import Link from "next/link";
import { getSettings } from "@/lib/settings";
import HideOnAdmin from "./HideOnAdmin";
export default async function SiteFooter() {
  const s = await getSettings(), soc = ([["Facebook", s.facebook], ["Instagram", s.instagram], ["X", s.x], ["WhatsApp", s.whatsapp]] as const).filter(([, u]) => u);
  return <HideOnAdmin><footer className="mt-8 bg-ink px-4 py-8 text-sm text-gray-300"><div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    <div><b className="text-gold">{s.storeName}</b><p>{s.description}</p></div>
    <div>{s.phone && <p>Phone: {s.phone}</p>}{s.email && <p>Email: {s.email}</p>}{s.address && <p>{s.address}</p>}{soc.map(([n, u]) => <a key={n} href={u} className="mr-3 underline">{n}</a>)}</div>
    <nav className="flex flex-col gap-1">{([["returns", "Returns"], ["refunds", "Refunds"], ["warranty", "Warranty"], ["privacy", "Privacy"], ["terms", "Terms"]] as const).map(([k, l]) => <Link key={k} href={`/policies/${k}`} className="hover:text-gold">{l}</Link>)}
      <Link href="/track" className="hover:text-gold">Track order</Link></nav></div></footer></HideOnAdmin>;
}
