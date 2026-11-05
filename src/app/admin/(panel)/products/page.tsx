import { prisma } from "@/lib/db";
import ProductForm from "@/components/ProductForm";
import DeleteButton from "@/components/DeleteButton";
export const dynamic = "force-dynamic";
export default async function Products() {
  const [cats, products] = await Promise.all([prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { category: true } })]);
  return <><h1 className="mb-4 text-2xl font-bold">Products</h1>
    {cats.length ? <ProductForm cats={cats.map(c => ({ id: c.id, name: c.name }))} /> : <p className="rounded-xl bg-white p-4">Create a category first (run <code>npm run db:seed</code> for starters).</p>}
    <div className="mt-4 overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm">
      <thead className="bg-soft"><tr><th className="p-3">Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Visible</th><th /></tr></thead>
      <tbody>{products.map(p => <tr key={p.id} className="border-t border-mid/20"><td className="p-3">{p.name}</td><td>{p.category.name}</td>
        <td>₦{(p.price / 100).toLocaleString("en-NG")}</td><td>{p.stock}</td><td>{p.active ? "Yes" : "No"}</td>
        <td className="flex gap-2 p-2"><a className="btn !min-h-[36px]" href={`/admin/products/${p.id}`}>Edit</a><DeleteButton url={`/api/admin/products/${p.id}`} what={p.name} /></td></tr>)}
        {!products.length && <tr><td className="p-6 text-center text-mid" colSpan={6}>No products yet.</td></tr>}</tbody></table></div></>;
}
