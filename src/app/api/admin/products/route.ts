import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, audit, productSchema, uniqueSlug } from "@/lib/api";
export const POST = (req: Request) => guard(async a => {
  const { images, ...d } = productSchema.parse(await req.json());
  const p = await prisma.product.create({ data: { ...d, slug: await uniqueSlug("product", d.name), images: { create: images.map((im, sort) => ({ ...im, sort })) } } });
  await audit(a.id, "product.create", p.id);
  return NextResponse.json(p, { status: 201 });
});
