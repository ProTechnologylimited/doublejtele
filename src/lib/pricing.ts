import { prisma } from "./db";
// Server-side only. Never accept prices, discounts or delivery fees from the browser.
export type Line = { productId: string; qty: number };
const naira = (k: number) => "₦" + (k / 100).toLocaleString("en-NG");
export async function quote(lines: Line[], loc: { state?: string; city?: string; lga?: string }, couponCode?: string) {
  const products = await prisma.product.findMany({ where: { id: { in: lines.map(l => l.productId) }, active: true } });
  let subtotal = 0;
  const items = lines.map(l => {
    const p = products.find(x => x.id === l.productId);
    if (!p) throw new Error("Product unavailable");
    if (l.qty < 1 || l.qty > p.stock) throw new Error(`Insufficient stock: ${p.name}`);
    subtotal += p.price * l.qty;
    return { productId: p.id, nameSnapshot: p.name, unitPrice: p.price, qty: l.qty };
  });
  let discount = 0, appliedCoupon: string | undefined, couponError: string | undefined;
  if (couponCode?.trim()) {
    const c = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } }), now = new Date();
    const bad = !c || !c.active ? "Invalid coupon code" : c.startsAt && c.startsAt > now ? "This coupon is not active yet" : c.expiresAt && c.expiresAt < now ? "This coupon has expired"
      : c.maxUses != null && c.used >= c.maxUses ? "This coupon has reached its usage limit" : c.minOrder && subtotal < c.minOrder ? `Minimum order for this coupon is ${naira(c.minOrder)}` : null;
    if (bad || !c) couponError = bad ?? "Invalid coupon code";
    else {
      const open = !c.productIds.length && !c.categoryIds.length;
      const base = items.reduce((t, it) => { const p = products.find(x => x.id === it.productId)!; return t + (open || c.productIds.includes(p.id) || c.categoryIds.includes(p.categoryId) ? it.unitPrice * it.qty : 0) }, 0);
      if (!base) couponError = "This coupon doesn’t apply to the items in your cart";
      else { discount = Math.min(base, c.percentOff ? Math.floor(base * c.percentOff / 100) : c.amountOff || 0); appliedCoupon = c.code }
    }
  }
  const zones = await prisma.deliveryZone.findMany({ where: { active: true } });
  const n = (v?: string | null) => (v || "").trim().toLowerCase();
  const fits = (z: any) => (!z.lga || n(z.lga) === n(loc.lga)) && (!z.city || n(z.city) === n(loc.city)) && (!z.state || n(z.state) === n(loc.state));
  const score = (z: any) => (z.lga ? 4 : 0) + (z.city ? 2 : 0) + (z.state ? 1 : 0); // most specific matching zone wins
  const zone = zones.filter(fits).sort((a, b) => score(b) - score(a))[0];
  const base = { items, subtotal, discount, couponCode: appliedCoupon, couponError };
  if (!zone) return { ...base, deliveryAvailable: false as const, message: "Delivery availability must be confirmed for this location." };
  const deliveryFee = zone.freeOver != null && subtotal - discount >= zone.freeOver ? 0 : zone.fee;
  return { ...base, deliveryAvailable: true as const, deliveryFee, total: subtotal - discount + deliveryFee, zoneName: zone.name, etaMinDays: zone.etaMinDays, etaMaxDays: zone.etaMaxDays };
}
