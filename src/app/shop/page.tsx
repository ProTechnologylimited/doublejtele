import Link from "next/link";
import { prisma } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
type SP = { q?: string; cat?: string; sort?: string; avail?: string; page?: string };
const PER = 12;
export default async function Shop({ searchParams: s }: { searchParams: SP }) {
  const page = Math.max(1, Number(s.page) || 1), q = s.q?.trim();
  const where: any = { active: true, ...(s.cat ? { category: { slug: s.cat } } : {}), ...(s.avail === "in" ? { stock: { gt: 0 } } : {}),
    ...(q ? { OR: ["name", "brand", "model"].map(f => ({ [f]: { contains: q, mode: "insensitive" } })).concat([{ category: { name: { contains: q, mode: "insensitive" } } } as any]) } : {}) };
  const orderBy: any = s.sort === "pa" ? { price: "asc" } : s.sort === "pd" ? { price: "desc" } : s.sort === "name" ? { name: "asc" } : { createdAt: "desc" };
  const [cats, total, items] = await Promise.all([prisma.category.findMany({ where: { active: true }, orderBy: { sort: "asc" } }), prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * PER, take: PER, include: { images: { orderBy: { sort: "asc" }, take: 1 }, category: true } })]);
  const link = (o: Partial<SP>) => "/shop?" + new URLSearchParams(Object.entries({ ...s, ...o }).filter(([, v]) => v) as [string, string][]);
  return <><SiteHeader /><main className="mx-auto max-w-6xl p-4">
    <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={q} placeholder="Search…" aria-label="Search" className="input !w-auto flex-1" />
      <select name="cat" defaultValue={s.cat} aria-label="Category" className="input !w-auto"><option value="">All categories</option>{cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
      <select name="avail" defaultValue={s.avail} aria-label="Availability" className="input !w-auto"><option value="">All stock</option><option value="in">In stock</option></select>
      <select name="sort" defaultValue={s.sort} aria-label="Sort" className="input !w-auto"><option value="">Newest</option><option value="pa">Price: low to high</option><option value="pd">Price: high to low</option><option value="name">Name</option></select>
      <button className="btn">Apply</button></form>
    {items.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{items.map(p => <ProductCard key={p.id} p={p} />)}</div> : <p className="p-8 text-center text-mid">No products match your search.</p>}
    <nav className="mt-4 flex justify-between">{page > 1 ? <Link className="btn" href={link({ page: String(page - 1) })}>Previous</Link> : <span />}
      {page * PER < total && <Link className="btn" href={link({ page: String(page + 1) })}>Next</Link>}</nav></main></>;
}
