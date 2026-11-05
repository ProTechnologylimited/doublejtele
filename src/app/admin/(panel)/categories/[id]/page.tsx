import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CategoryForm from "@/components/CategoryForm";
export const dynamic = "force-dynamic";
export default async function EditCategory({ params }: { params: { id: string } }) {
  const [c, cats] = await Promise.all([prisma.category.findUnique({ where: { id: params.id } }), prisma.category.findMany({ where: { id: { not: params.id } }, orderBy: { name: "asc" } })]);
  if (!c) notFound();
  return <><h1 className="mb-4 text-2xl font-bold">Edit: {c.name}</h1><CategoryForm cats={cats.map(x => ({ id: x.id, name: x.name }))} id={c.id} initial={{ name: c.name, description: c.description ?? "", sort: c.sort, active: c.active, parentId: c.parentId ?? "" }} /></>;
}
