import { OrderStatus as S } from "@prisma/client";
import { prisma } from "./db";
import { verifyTransaction, refundTransaction } from "./paystack";
import { sendOrderEmail } from "./email";
export const NEXT: Record<S, S[]> = {
  PENDING_PAYMENT: ["PAYMENT_CONFIRMED", "CANCELLED"], PAYMENT_CONFIRMED: ["ORDER_CONFIRMED", "CANCELLED", "REFUNDED"],
  ORDER_CONFIRMED: ["PROCESSING", "CANCELLED", "REFUNDED"], PROCESSING: ["READY_FOR_DISPATCH", "CANCELLED", "REFUNDED"],
  READY_FOR_DISPATCH: ["SHIPPED", "CANCELLED"], SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"], OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["REFUNDED"], CANCELLED: ["REFUNDED"], REFUNDED: [],
};
const NOTIFY = new Set<S>(["PAYMENT_CONFIRMED", "ORDER_CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"]);
// Idempotent: safe to call from the webhook and the return page, any number of times.
export async function confirmPayment(reference: string) {
  const pay = await prisma.payment.findUnique({ where: { reference }, include: { order: true } });
  if (!pay) return "unknown";
  if (pay.status === "SUCCESS" || pay.status === "REFUNDED") return "already";
  const v = await verifyTransaction(reference); // never trust the webhook body or redirect alone
  if (v.status !== "success") {
    if (v.status === "failed" || v.status === "abandoned") await prisma.payment.updateMany({ where: { reference, status: "PENDING" }, data: { status: v.status === "failed" ? "FAILED" : "CANCELLED" } });
    return v.status === "failed" ? "failed" : "pending";
  }
  if (v.amount !== pay.amount || v.currency !== "NGN") return "mismatch";
  const done = await prisma.$transaction(async tx => {
    const r = await tx.payment.updateMany({ where: { reference, status: { in: ["PENDING", "FAILED", "CANCELLED"] } }, data: { status: "SUCCESS", verifiedAt: new Date() } });
    if (r.count !== 1) return false;
    const o = await tx.order.findUniqueOrThrow({ where: { id: pay.orderId } });
    const note = o.status === "PENDING_PAYMENT" ? "Payment verified with Paystack" : "Payment received while order was " + o.status + " – review and refund if needed";
    await tx.order.update({ where: { id: o.id }, data: { ...(o.status === "PENDING_PAYMENT" ? { status: "PAYMENT_CONFIRMED" as S } : {}), history: { create: { status: o.status === "PENDING_PAYMENT" ? "PAYMENT_CONFIRMED" : o.status, note } } } });
    return o.status === "PENDING_PAYMENT";
  });
  if (done) sendOrderEmail(pay.order, "Payment confirmed").catch(() => {});
  return "confirmed";
}
export async function setStatus(orderId: string, to: S, actorId: string, note?: string) {
  const o = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payments: true } });
  if (!o) throw new Error("Order not found");
  if (!NEXT[o.status].includes(to)) throw new Error(`Cannot move from ${o.status} to ${to}`);
  if (to === "PAYMENT_CONFIRMED") throw new Error("Payment is confirmed only by verification with the payment provider");
  if (to === "REFUNDED") {
    const paid = o.payments.find(p => p.status === "SUCCESS");
    if (!paid) throw new Error("No successful payment to refund");
    await refundTransaction(paid.reference);
  }
  await prisma.$transaction(async tx => {
    if (to === "CANCELLED") for (const i of o.items) if (i.productId) await tx.product.updateMany({ where: { id: i.productId }, data: { stock: { increment: i.qty } } });
    if (to === "REFUNDED") await tx.payment.updateMany({ where: { orderId: o.id, status: "SUCCESS" }, data: { status: "REFUNDED" } });
    await tx.order.update({ where: { id: o.id }, data: { status: to, ...(to === "SHIPPED" ? { dispatchedAt: new Date() } : {}), history: { create: { status: to, note, actorId } } } });
  });
  if (NOTIFY.has(to)) sendOrderEmail(o, `Your order is now ${to.replace(/_/g, " ").toLowerCase()}`).catch(() => {});
}
