import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendOrderEmail } from "@/lib/email";
const hits = new Map<string, { n: number; t: number }>(); // per-instance; use Redis when scaling out
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "x", h = hits.get(ip), now = Date.now();
  if (!h || now - h.t > 36e5) hits.set(ip, { n: 1, t: now }); else if (++h.n > 10) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const b = z.object({ ref: z.string().max(30), email: z.string().email() }).safeParse(await req.json().catch(() => null));
  if (b.success) {
    const o = await prisma.order.findUnique({ where: { ref: b.data.ref.trim().toUpperCase() } });
    if (o && o.email.toLowerCase() === b.data.email.toLowerCase()) await sendOrderEmail(o, "Here is your order link");
  }
  return NextResponse.json({ message: "If those details match an order, we’ve emailed a private tracking link." }); // same reply either way
}
