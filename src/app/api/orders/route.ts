import { rateLimit, ipOf } from "@/lib/ratelimit";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { quote } from "@/lib/pricing";
import { sendOrderEmail } from "@/lib/email";
import { lineSchema } from "@/lib/schemas";
const body = z.object({ lines: z.array(lineSchema).min(1).max(50), name: z.string().trim().min(2).max(100), email: z.string().email(), phone: z.string().trim().min(7).max(20),
  address: z.string().trim().min(5).max(300), country: z.string().default("Nigeria"), state: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(80),
  lga: z.string().max(80).optional(), notes: z.string().max(500).optional(), coupon: z.string().max(40).optional() });
// Prices, stock and the delivery fee are recomputed here; nothing money-related is taken from the browser.
export async function POST(req: Request) {
  if (!rateLimit("orders:" + ipOf(req), 10, 3600000)) return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
  const p = body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Please check your details", issues: p.error.flatten().fieldErrors }, { status: 400 });
  const d = p.data;
  try {
    const q = await quote(d.lines, { state: d.state, city: d.city, lga: d.lga }, d.coupon);
    if (q.couponError) return NextResponse.json({ error: q.couponError }, { status: 422 });
    if (!q.deliveryAvailable) return NextResponse.json({ error: q.message }, { status: 422 });
    const ref = "DJ-" + randomBytes(5).toString("hex").toUpperCase(), accessToken = randomBytes(16).toString("hex"), now = Date.now(), day = 864e5;
    await prisma.$transaction(async tx => {
      for (const it of q.items) { // atomic oversell guard
        const r = await tx.product.updateMany({ where: { id: it.productId, stock: { gte: it.qty } }, data: { stock: { decrement: it.qty } } });
        if (r.count !== 1) throw new Error("Insufficient stock: " + it.nameSnapshot);
      }
      if (q.couponCode) { // enforce usage limit atomically
        const c = await tx.coupon.findUniqueOrThrow({ where: { code: q.couponCode } });
        const r = await tx.coupon.updateMany({ where: { id: c.id, ...(c.maxUses != null ? { used: { lt: c.maxUses } } : {}) }, data: { used: { increment: 1 } } });
        if (r.count !== 1) throw new Error("Coupon usage limit reached");
      }
      await tx.order.create({ data: { ref, accessToken, name: d.name, email: d.email, phone: d.phone, address: JSON.parse(JSON.stringify({ line: d.address, country: d.country, state: d.state, city: d.city, lga: d.lga, notes: d.notes })),
        subtotal: q.subtotal, discount: q.discount, couponCode: q.couponCode, deliveryFee: q.deliveryFee, total: q.total, zoneName: q.zoneName, etaFrom: new Date(now + q.etaMinDays * day), etaTo: new Date(now + q.etaMaxDays * day),
        items: { create: q.items }, history: { create: { status: "PENDING_PAYMENT", note: "Order placed" } } } });
    });
    const order = await prisma.order.findUnique({ where: { ref } });
    if (order) sendOrderEmail(order, "We received your order").catch(() => {});
    return NextResponse.json({ ref, token: accessToken }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: /^(Insufficient|Coupon)/.test(e.message) ? e.message : "Could not place order" }, { status: 409 });
  }
}
