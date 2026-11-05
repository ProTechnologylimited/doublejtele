import { prisma } from "@/lib/db";
import CategoryForm from "@/components/CategoryForm";
import DeleteButton from "@/components/DeleteButton";
export const dynamic = "force-dynamic";
export default async function Categories() {
  const cats = await prisma.category.findMany({ orderBy: [{ sort: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } });
  return <><h1 className="mb-4 text-2xl font-bold">Categories</h1>
    <CategoryForm cats={cats.map(c => ({ id: c.id, name: c.name }))} />
    <div className="mt-4 overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm">
      <thead className="bg-soft"><tr><th className="p-3">Name</th><th>Order</th><th>Products</th><th>Active</th><th /></tr></thead>
      <tbody>{cats.map(c => <tr key={c.id} className="border-t border-mid/20"><td className="p-3">{c.name}</td><td>{c.sort}</td><td>{c._count.products}</td><td>{c.active ? "Yes" : "No"}</td>
        <td className="flex gap-2 p-2"><a className="btn !min-h-[36px]" href={`/admin/categories/${c.id}`}>Edit</a><DeleteButton url={`/api/admin/categories/${c.id}`} what={c.name} /></td></tr>)}
        {!cats.length && <tr><td className="p-6 text-center text-mid" colSpan={5}>No categories yet. Add one above.</td></tr>}</tbody></table></div></>;
}
