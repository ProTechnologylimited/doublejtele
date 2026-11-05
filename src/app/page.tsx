import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
export default async function Home() {
  const st = await getSettings();
  const inc = { images: { orderBy: { sort: "asc" as const }, take: 1 }, category: true };
  const [featured, latest] = await Promise.all([
    prisma.product.findMany({ where: { active: true, featured: true }, take: 8, include: inc }),
    prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 8, include: inc })]);
  const Row = ({ t, l }: { t: string; l: typeof featured }) => l.length ? <section className="mx-auto max-w-6xl p-4"><h2 className="mb-3 text-xl font-bold">{t}</h2>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{l.map(p => <ProductCard key={p.id} p={p} />)}</div></section> : null;
  return <><SiteHeader />
    {st.promoText && <div className="bg-gold p-2 text-center text-sm font-bold">{st.promoText}</div>}
    <section className="bg-ink px-4 py-12 text-center text-white"><h1 className="text-3xl font-extrabold">Premium electronics, <span className="text-gold">delivered</span>.</h1>
      <Link href="/shop" className="btn mt-4 inline-block">Shop Now</Link></section>
    <Row t="Featured products" l={featured} /><Row t="New arrivals" l={latest} />
    {!latest.length && <p className="p-8 text-center text-mid">No products yet. Add some in the admin dashboard.</p>}</>;
}
