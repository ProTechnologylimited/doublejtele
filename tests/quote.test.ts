import { describe, it, expect, vi, beforeEach } from "vitest";
const db = vi.hoisted(() => ({ product: { findMany: vi.fn() }, deliveryZone: { findMany: vi.fn() }, coupon: { findUnique: vi.fn() } }));
vi.mock("@/lib/db", () => ({ prisma: db }));
import { quote } from "@/lib/pricing";
const P = (id: string, price: number, stock: number, categoryId = "c1") => ({ id, name: id, price, stock, categoryId, active: true });
const Z = (o: any) => ({ id: o.name, state: null, city: null, lga: null, fee: 100000, etaMinDays: 1, etaMaxDays: 2, freeOver: null, active: true, ...o });
const C = (o: any = {}) => ({ code: "SAVE10", active: true, percentOff: 10, amountOff: null, minOrder: null, startsAt: null, expiresAt: null, maxUses: null, used: 0, productIds: [], categoryIds: [], ...o });
const cart = [{ productId: "a", qty: 2 }]; // 2 x ₦5,000 = 1,000,000 kobo
beforeEach(() => {
  vi.resetAllMocks();
  db.product.findMany.mockResolvedValue([P("a", 500000, 5), P("b", 100000, 1, "c2")]);
  db.deliveryZone.findMany.mockResolvedValue([Z({ name: "Lagos", state: "Lagos", fee: 300000 }), Z({ name: "Ikeja", state: "Lagos", lga: "Ikeja", fee: 200000 })]);
  db.coupon.findUnique.mockResolvedValue(null);
});
describe("quote", () => {
  it("prices from the database and uses the most specific zone", async () => {
    const q: any = await quote(cart, { state: "Lagos", lga: "Ikeja" });
    expect(q).toMatchObject({ subtotal: 1000000, deliveryFee: 200000, total: 1200000, zoneName: "Ikeja" });
  });
  it("matches locations case-insensitively", async () => { expect(((await quote(cart, { state: "lagos", lga: "IKEJA" })) as any).zoneName).toBe("Ikeja") });
  it("falls back to the broader zone", async () => { expect(((await quote(cart, { state: "Lagos", lga: "Surulere" })) as any).deliveryFee).toBe(300000) });
  it("never invents a fee for unsupported locations", async () => {
    const q: any = await quote(cart, { state: "Kano" }); expect(q.deliveryAvailable).toBe(false); expect(q.deliveryFee).toBeUndefined(); expect(q.total).toBeUndefined();
  });
  it("rejects more than the available stock", async () => { await expect(quote([{ productId: "a", qty: 6 }], { state: "Lagos" })).rejects.toThrow(/Insufficient stock/) });
  it("rejects unknown or inactive products", async () => { await expect(quote([{ productId: "zzz", qty: 1 }], { state: "Lagos" })).rejects.toThrow("Product unavailable") });
  it("gives free delivery over the zone threshold", async () => {
    db.deliveryZone.findMany.mockResolvedValue([Z({ name: "Lagos", state: "Lagos", fee: 300000, freeOver: 1000000 })]);
    expect(((await quote(cart, { state: "Lagos" })) as any).deliveryFee).toBe(0);
  });
  it("applies a percentage coupon", async () => {
    db.coupon.findUnique.mockResolvedValue(C());
    expect(await quote(cart, { state: "Lagos", lga: "Ikeja" }, "save10")).toMatchObject({ discount: 100000, couponCode: "SAVE10", total: 1100000 });
  });
  it("checks the free-delivery threshold after the discount", async () => {
    db.deliveryZone.findMany.mockResolvedValue([Z({ name: "Lagos", state: "Lagos", fee: 300000, freeOver: 1000000 })]); db.coupon.findUnique.mockResolvedValue(C());
    expect(((await quote(cart, { state: "Lagos" }, "SAVE10")) as any).deliveryFee).toBe(300000);
  });
  it.each([
    ["expired", C({ expiresAt: new Date(Date.now() - 864e5) }), /expired/],
    ["not yet active", C({ startsAt: new Date(Date.now() + 864e5) }), /not active/],
    ["used up", C({ maxUses: 3, used: 3 }), /usage limit/],
    ["below minimum order", C({ minOrder: 5000000 }), /Minimum order/],
    ["for another category", C({ categoryIds: ["c2"] }), /doesn’t apply/],
    ["disabled", C({ active: false }), /Invalid/],
  ])("rejects a coupon that is %s", async (_n, c, msg) => {
    db.coupon.findUnique.mockResolvedValue(c); const q: any = await quote(cart, { state: "Lagos" }, "SAVE10");
    expect(q.discount).toBe(0); expect(q.couponError).toMatch(msg);
  });
});
