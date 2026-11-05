import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, audit, categorySchema, uniqueSlug } from "@/lib/api";
export const GET = () => guard(async () => NextResponse.json(await prisma.category.findMany({ orderBy: { sort: "asc" } })));
export const POST = (req: Request) => guard(async a => {
  const d = categorySchema.parse(await req.json());
  const c = await prisma.category.create({ data: { ...d, imageUrl: d.imageUrl || null, slug: await uniqueSlug("category", d.name) } });
  await audit(a.id, "category.create", c.id);
  return NextResponse.json(c, { status: 201 });
});
