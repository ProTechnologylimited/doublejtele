import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { guard, audit } from "@/lib/api";
const zoneSchema = z.object({ name: z.string().trim().min(2).max(100), state: z.string().trim().max(80).optional(), city: z.string().trim().max(80).optional(), lga: z.string().trim().max(80).optional(),
  fee: z.number().int().min(0), etaMinDays: z.number().int().min(0).max(60), etaMaxDays: z.number().int().min(0).max(60), freeOver: z.number().int().positive().nullish(),
  sameDay: z.boolean().default(false), express: z.boolean().default(false), active: z.boolean().default(true) }).refine(z => z.etaMaxDays >= z.etaMinDays, { message: "Max days must be ≥ min days", path: ["etaMaxDays"] });
export const POST = (req: Request) => guard(async a => {
  const d = zoneSchema.parse(await req.json());
  const z = await prisma.deliveryZone.create({ data: { ...d, state: d.state || null, city: d.city || null, lga: d.lga || null } });
  await audit(a.id, "zone.create", z.id); return NextResponse.json(z, { status: 201 });
});
