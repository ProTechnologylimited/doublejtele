import { NextResponse } from "next/server";
import { validSignature } from "@/lib/paystack";
import { confirmPayment } from "@/lib/orders";
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-paystack-signature"))) return new NextResponse("Invalid signature", { status: 401 });
  let ev: any; try { ev = JSON.parse(raw) } catch { return new NextResponse("Bad body", { status: 400 }) }
  if (ev.event === "charge.success" && typeof ev.data?.reference === "string") {
    try { await confirmPayment(ev.data.reference) } catch (e) { console.error("webhook verify failed", e); return new NextResponse("Retry", { status: 500 }) } // non-2xx makes Paystack retry
  }
  return NextResponse.json({ ok: true }); // duplicates are harmless: confirmPayment is idempotent
}
