import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guard, audit } from "@/lib/api";

type Ctx = {
  params: Promise<{ id: string }>;
};

export const DELETE = (
  _: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    await prisma.deliveryZone.delete({
      where: { id }
    });

    await audit(a.id, "zone.delete", id);

    return NextResponse.json({ ok: true });
  });