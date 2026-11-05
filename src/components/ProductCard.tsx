import Link from "next/link";
import { naira } from "@/lib/format";
type P = { slug: string; name: string; price: number; comparePrice: number | null; stock: number; images: { url: string; alt: string | null }[]; category: { name: string } };
export default function ProductCard({ p }: { p: P }) {
  return <article className="flex flex-col gap-2 rounded-xl border border-mid/30 bg-white p-3">
    <Link href={`/products/${p.slug}`} className="block aspect-square overflow-hidden rounded-lg bg-soft">
      {p.images[0] ? <img src={p.images[0].url} alt={p.images[0].alt || p.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-mid">No image</div>}</Link>
    <span className="text-xs text-mid">{p.category.name} · {p.stock > 0 ? "In stock" : "Out of stock"}</span>
    <Link href={`/products/${p.slug}`} className="font-bold">{p.name}</Link>
    <span className="font-extrabold text-dgold">{naira(p.price)}{p.comparePrice && <s className="ml-2 text-sm font-normal text-mid">{naira(p.comparePrice)}</s>}</span>
    <Link href={`/products/${p.slug}`} className="btn text-center">View Product</Link></article>;
}
