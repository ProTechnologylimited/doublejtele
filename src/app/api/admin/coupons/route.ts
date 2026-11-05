import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { guard, audit } from "@/lib/api";
const schema = z.object({ code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only").transform(s => s.toUpperCase()),
  percentOff: z.number().int().min(1).max(100).nullish(), amountOff: z.number().int().positive().nullish(), minOrder: z.number().int().positive().nullish(),
  startsAt: z.string().nullish(), expiresAt: z.string().nullish(), maxUses: z.number().int().positive().nullish(), categoryIds: z.array(z.string()).default([]), productIds: z.array(z.string()).default([]) })
  .refine(v => !!v.percentOff !== !!v.amountOff, { message: "Set a percentage or a fixed amount, not both", path: ["percentOff"] });
export const POST = (req: Request) => guard(async a => {
  const d = schema.parse(await req.json());
  const c = await prisma.coupon.create({ data: { ...d, startsAt: d.startsAt ? new Date(d.startsAt) : null, expiresAt: d.expiresAt ? new Date(d.expiresAt + "T23:59:59") : null } });
  await audit(a.id, "coupon.create", c.id); return NextResponse.json(c, { status: 201 });
});
