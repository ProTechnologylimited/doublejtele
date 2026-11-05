import { rateLimit, ipOf } from "@/lib/ratelimit";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { initTransaction, paystackConfigured } from "@/lib/paystack";
export async function POST(req: Request) {
  if (!rateLimit("pay:" + ipOf(req), 10, 600000)) return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
  const b = z.object({ ref: z.string(), token: z.string() }).safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (!paystackConfigured()) return NextResponse.json({ error: "Online payment is not set up yet. Please contact the store." }, { status: 503 });
  const o = await prisma.order.findUnique({ where: { ref: b.data.ref } });
  if (!o || o.accessToken !== b.data.token || o.status !== "PENDING_PAYMENT") return NextResponse.json({ error: "Order not payable" }, { status: 404 });
  const reference = `${o.ref}-${randomBytes(4).toString("hex")}`;
  try {
    await prisma.payment.create({ data: { orderId: o.id, provider: "paystack", reference, amount: o.total } });
    const d = await initTransaction(o.email, o.total, reference, `${process.env.NEXTAUTH_URL}/order/${o.ref}?t=${o.accessToken}`);
    return NextResponse.json({ url: d.authorization_url });
  } catch { return NextResponse.json({ error: "Could not start payment. Try again." }, { status: 502 }) }
}
