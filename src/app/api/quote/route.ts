import { rateLimit, ipOf } from "@/lib/ratelimit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { quote } from "@/lib/pricing";
import { lineSchema, locSchema } from "@/lib/schemas";
export async function POST(req: Request) {
  if (!rateLimit("quote:" + ipOf(req), 60, 60000)) return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
  const b = z.object({ lines: z.array(lineSchema).min(1).max(50), location: locSchema, coupon: z.string().max(40).optional() }).safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try { return NextResponse.json(await quote(b.data.lines, b.data.location, b.data.coupon)) }
  catch (e: any) { return NextResponse.json({ error: e.message?.startsWith("Insufficient") || e.message === "Product unavailable" ? e.message : "Could not price your cart" }, { status: 409 }) }
}
