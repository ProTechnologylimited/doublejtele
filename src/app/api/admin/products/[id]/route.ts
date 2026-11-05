import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, audit, productSchema } from "@/lib/api";

type Ctx = {
  params: Promise<{ id: string }>;
};

export const PATCH = (
  req: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    const { images, ...d } = productSchema.parse(
      await req.json()
    );

    const p = await prisma.$transaction(async tx => {
      await tx.productImage.deleteMany({
        where: { productId: id }
      });

      return tx.product.update({
        where: { id },
        data: {
          ...d,
          images: {
            create: images.map((im, sort) => ({
              ...im,
              sort
            }))
          }
        }
      });
    });

    await audit(a.id, "product.update", p.id);

    return NextResponse.json(p);
  });

export const DELETE = (
  _: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    // Past orders keep their own name/price snapshots,
    // so deleting a product is safe for order history.

    await prisma.$transaction([
      prisma.review.deleteMany({
        where: { productId: id }
      }),
      prisma.product.delete({
        where: { id }
      })
    ]);

    await audit(a.id, "product.delete", id);

    return NextResponse.json({ ok: true });
  });