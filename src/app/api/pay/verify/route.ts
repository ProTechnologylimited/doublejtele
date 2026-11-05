import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { confirmPayment } from "@/lib/orders";
const MSG: Record<string, string> = { confirmed: "Payment confirmed. Thank you!", already: "Payment already confirmed.", pending: "Payment is still pending.", failed: "Payment failed. You can try again.", mismatch: "Payment amount mismatch; the store will review it.", unknown: "Payment not found." };
export async function POST(req: Request) {
  const b = z.object({ ref: z.string(), token: z.string(), reference: z.string() }).safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const p = await prisma.payment.findUnique({ where: { reference: b.data.reference }, include: { order: true } });
  if (!p || p.order.ref !== b.data.ref || p.order.accessToken !== b.data.token) return NextResponse.json({ message: MSG.unknown }, { status: 404 });
  try { return NextResponse.json({ message: MSG[await confirmPayment(p.reference)] }) } catch { return NextResponse.json({ message: "Could not verify yet. Refresh in a moment." }, { status: 502 }) }
}
