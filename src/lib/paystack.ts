import { createHmac, timingSafeEqual } from "crypto";
const key = () => process.env.PAYSTACK_SECRET_KEY || "";
export const paystackConfigured = () => key().startsWith("sk_") && !key().includes("xxx");
async function call(path: string, init?: RequestInit) {
  const r = await fetch("https://api.paystack.co" + path, { ...init, headers: { Authorization: `Bearer ${key()}`, "content-type": "application/json" } });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.status) throw new Error(j?.message || "Paystack request failed");
  return j.data;
}
// Amounts are in kobo, the same minor unit this app stores.
export const initTransaction = (email: string, amount: number, reference: string, callback_url: string) =>
  call("/transaction/initialize", { method: "POST", body: JSON.stringify({ email, amount, reference, callback_url, currency: "NGN" }) });
export const verifyTransaction = (reference: string) => call("/transaction/verify/" + encodeURIComponent(reference));
export const refundTransaction = (transaction: string) => call("/refund", { method: "POST", body: JSON.stringify({ transaction }) });
export function validSignature(raw: string, sig: string | null) {
  if (!sig || !key()) return false;
  const a = Buffer.from(createHmac("sha512", key()).update(raw).digest("hex")), b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}
