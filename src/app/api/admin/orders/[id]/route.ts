import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { guard, audit } from "@/lib/api";
import { setStatus } from "@/lib/orders";

const schema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  note: z.string().max(300).optional(),
  courier: z.string().max(80).optional(),
  trackingNo: z.string().max(80).optional(),
  etaFrom: z.string().optional(),
  etaTo: z.string().optional(),
  notes: z.string().max(1000).optional()
});

const d = (s?: string) => (s ? new Date(s) : null);

type Ctx = {
  params: Promise<{ id: string }>;
};

export const PATCH = (
  req: Request,
  { params }: Ctx
) =>
  guard(async a => {
    const { id } = await params;

    const b = schema.parse(await req.json());

    await prisma.order.update({
      where: { id },
      data: {
        courier: b.courier || null,
        trackingNo: b.trackingNo || null,
        notes: b.notes || null,
        etaFrom: d(b.etaFrom),
        etaTo: d(b.etaTo)
      }
    });

    if (b.status) {
      try {
        await setStatus(id, b.status, a.id, b.note);
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : "Unable to update order status";

        return NextResponse.json(
          { error: message },
          { status: 409 }
        );
      }
    }

    await audit(
      a.id,
      "order.update" + (b.status ? ":" + b.status : ""),
      id
    );

    return NextResponse.json({ ok: true });
  });