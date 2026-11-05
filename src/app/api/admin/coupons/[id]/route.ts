import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { guard, audit } from "@/lib/api";

type Ctx = {
  params: Promise<{ id: string }>;
};

export const PATCH = (
  req: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    const { active } = z
      .object({
        active: z.boolean()
      })
      .parse(await req.json());

    await prisma.coupon.update({
      where: { id },
      data: { active }
    });

    await audit(a.id, "coupon.toggle", id);

    return NextResponse.json({ ok: true });
  });

export const DELETE = (
  _: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    await prisma.coupon.delete({
      where: { id }
    });

    await audit(a.id, "coupon.delete", id);

    return NextResponse.json({ ok: true });
  });