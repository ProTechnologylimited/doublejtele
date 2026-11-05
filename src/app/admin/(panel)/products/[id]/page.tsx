import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/ProductForm";
export const dynamic = "force-dynamic";
export default async function EditProduct({ params }: { params: { id: string } }) {
  const [p, cats] = await Promise.all([prisma.product.findUnique({ where: { id: params.id }, include: { images: { orderBy: { sort: "asc" } } } }), prisma.category.findMany({ orderBy: { name: "asc" } })]);
  if (!p) notFound();
  const initial = { name: p.name, description: p.description, price: p.price / 100, comparePrice: p.comparePrice ? p.comparePrice / 100 : undefined, stock: p.stock, categoryId: p.categoryId,
    brand: p.brand ?? "", model: p.model ?? "", sku: p.sku ?? "", warranty: p.warranty ?? "", featured: p.featured, bestSeller: p.bestSeller, active: p.active, images: p.images.map(i => i.url) };
  return <><h1 className="mb-4 text-2xl font-bold">Edit: {p.name}</h1><ProductForm cats={cats.map(c => ({ id: c.id, name: c.name }))} initial={initial} id={p.id} /></>;
}
