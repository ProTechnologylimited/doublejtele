import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, audit, categorySchema } from "@/lib/api";

type Ctx = {
  params: Promise<{ id: string }>;
};

export const PATCH = (
  req: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    const d = categorySchema.partial().parse(await req.json());

    const c = await prisma.category.update({
      where: { id },
      data: {
        ...d,
        imageUrl: d.imageUrl || null
      }
    });

    await audit(a.id, "category.update", c.id);

    return NextResponse.json(c);
  });

export const DELETE = (
  _: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    const [products, children] = await Promise.all([
      prisma.product.count({
        where: { categoryId: id }
      }),
      prisma.category.count({
        where: { parentId: id }
      })
    ]);

    if (products || children) {
      return NextResponse.json(
        {
          error:
            "Move or delete this category's products and subcategories first"
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    await audit(a.id, "category.delete", id);

    return NextResponse.json({ ok: true });
  });