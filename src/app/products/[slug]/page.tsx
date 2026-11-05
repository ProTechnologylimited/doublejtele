import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
export const dynamic = "force-dynamic";
const get = (slug: string) => prisma.product.findFirst({ where: { slug, active: true }, include: { images: { orderBy: { sort: "asc" } }, category: true } });
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await get(params.slug); return p ? { title: p.name, description: p.description.slice(0, 155), alternates: { canonical: `/products/${p.slug}` }, openGraph: { title: p.name, description: p.description.slice(0, 155), images: p.images[0] ? [p.images[0].url] : [] } } : {};
}
export default async function Product({ params }: { params: { slug: string } }) {
  const p = await get(params.slug); if (!p) notFound();
  const related = await prisma.product.findMany({ where: { categoryId: p.categoryId, active: true, id: { not: p.id } }, take: 4, include: { images: { take: 1 }, category: true } });
  const specs = (p.specs && typeof p.specs === "object" ? Object.entries(p.specs as Record<string, string>) : []);
  return <><SiteHeader /><main className="mx-auto max-w-5xl p-4">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, sku: p.sku || undefined, brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
      image: p.images.map(i => i.url), offers: { "@type": "Offer", priceCurrency: "NGN", price: (p.price / 100).toFixed(2), availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } }).replace(/</g, "\\u003c") }} />
    <div className="grid gap-6 md:grid-cols-2">
      <div><img src={p.images[0]?.url} alt={p.images[0]?.alt || p.name} className="aspect-square w-full rounded-xl bg-soft object-cover" />
        <div className="mt-2 flex gap-2 overflow-x-auto">{p.images.slice(1).map(i => <img key={i.id} src={i.url} alt={i.alt || p.name} className="h-16 w-16 rounded object-cover" />)}</div></div>
      <div className="space-y-3"><span className="text-sm text-mid">{p.category.name}{p.brand && ` · ${p.brand}`}{p.model && ` ${p.model}`}</span>
        <h1 className="text-2xl font-extrabold">{p.name}</h1>
        <div className="text-2xl font-extrabold text-dgold">{naira(p.price)}{p.comparePrice && <s className="ml-2 text-base font-normal text-mid">{naira(p.comparePrice)}</s>}</div>
        <p className="text-sm">{p.stock > 0 ? `In stock (${p.stock} available)` : "Out of stock"}</p>
        <AddToCart id={p.id} stock={p.stock} />
        <p className="text-sm text-mid">Delivery fee and estimate are shown in your cart once you enter your location.</p>
        {p.warranty && <p className="text-sm"><b>Warranty:</b> {p.warranty}</p>}</div></div>
    <section className="mt-6 rounded-xl bg-white p-4"><h2 className="font-bold">Description</h2><p className="whitespace-pre-line">{p.description}</p>
      {specs.length > 0 && <dl className="mt-3 grid grid-cols-2 gap-1 text-sm">{specs.map(([k, v]) => <div key={k} className="contents"><dt className="font-bold">{k}</dt><dd>{String(v)}</dd></div>)}</dl>}</section>
    {related.length > 0 && <section className="mt-6"><h2 className="mb-2 font-bold">Related products</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{related.map(r => <ProductCard key={r.id} p={r} />)}</div></section>}</main></>;
}
