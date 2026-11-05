import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/lib/db", () => ({ prisma: { product: { findMany: vi.fn() }, deliveryZone: { findMany: vi.fn() }, coupon: { findUnique: vi.fn() } } }));
import { prisma } from "@/lib/db";
import { quote } from "@/lib/pricing";
const db = prisma as any;
const P = (id: string, price: number, stock = 5, categoryId = "c1") => ({ id, name: "P" + id, price, stock, categoryId });
const Z = (o: any) => ({ id: o.name, state: null, city: null, lga: null, fee: 0, freeOver: null, etaMinDays: 1, etaMaxDays: 2, active: true, ...o });
const C = (o: any = {}) => ({ id: "k", code: "SAVE10", active: true, percentOff: 10, amountOff: null, minOrder: null, startsAt: null, expiresAt: null, maxUses: null, used: 0, productIds: [], categoryIds: [], ...o });
const LAGOS = { state: "Lagos", city: "Ikeja" };
beforeEach(() => {
  db.product.findMany.mockResolvedValue([P("a", 100000), P("b", 50000, 0)]);
  db.deliveryZone.findMany.mockResolvedValue([Z({ name: "Everywhere", fee: 600000 }), Z({ name: "Lagos", state: "Lagos", fee: 350000 }), Z({ name: "Ikeja", state: "Lagos", city: "Ikeja", fee: 200000, freeOver: 500000 })]);
  db.coupon.findUnique.mockResolvedValue(null);
});
describe("delivery", () => {
  it("uses DB prices and the most specific zone", async () => {
    const q: any = await quote([{ productId: "a", qty: 2 }], LAGOS);
    expect([q.subtotal, q.deliveryFee, q.total, q.zoneName]).toEqual([200000, 200000, 400000, "Ikeja"]);
  });
  it("matches locations case-insensitively", async () => expect(((await quote([{ productId: "a", qty: 1 }], { state: " lagos ", city: "IKEJA" })) as any).zoneName).toBe("Ikeja"));
  it("falls back to state then everywhere", async () => {
    expect(((await quote([{ productId: "a", qty: 1 }], { state: "Lagos", city: "Epe" })) as any).deliveryFee).toBe(350000);
    expect(((await quote([{ productId: "a", qty: 1 }], { state: "Abuja", city: "Garki" })) as any).deliveryFee).toBe(600000);
  });
  it("applies free-delivery threshold", async () => expect(((await quote([{ productId: "a", qty: 5 }], LAGOS)) as any).deliveryFee).toBe(0));
  it("never invents a fee for unsupported locations", async () => {
    db.deliveryZone.findMany.mockResolvedValue([Z({ name: "Lagos", state: "Lagos", fee: 350000 })]);
    const q: any = await quote([{ productId: "a", qty: 1 }], { state: "Kano", city: "Kano" });
    expect(q.deliveryAvailable).toBe(false); expect(q.deliveryFee).toBeUndefined(); expect(q.total).toBeUndefined();
  });
});
describe("stock", () => {
  it("rejects out-of-stock, over-quantity and unknown products", async () => {
    await expect(quote([{ productId: "b", qty: 1 }], LAGOS)).rejects.toThrow(/Insufficient stock/);
    await expect(quote([{ productId: "a", qty: 6 }], LAGOS)).rejects.toThrow(/Insufficient stock/);
    await expect(quote([{ productId: "zzz", qty: 1 }], LAGOS)).rejects.toThrow(/unavailable/);
  });
});
describe("coupons", () => {
  const lines = [{ productId: "a", qty: 2 }];
  it("applies a percentage discount", async () => { db.coupon.findUnique.mockResolvedValue(C()); const q: any = await quote(lines, LAGOS, "save10"); expect([q.discount, q.total]).toEqual([20000, 380000]) });
  it("rejects unknown, expired, exhausted and below-minimum coupons", async () => {
    expect(((await quote(lines, LAGOS, "NOPE")) as any).couponError).toMatch(/Invalid/);
    db.coupon.findUnique.mockResolvedValue(C({ expiresAt: new Date(Date.now() - 1000) })); expect(((await quote(lines, LAGOS, "X")) as any).couponError).toMatch(/expired/);
    db.coupon.findUnique.mockResolvedValue(C({ maxUses: 3, used: 3 })); expect(((await quote(lines, LAGOS, "X")) as any).couponError).toMatch(/limit/);
    db.coupon.findUnique.mockResolvedValue(C({ minOrder: 999999 })); expect(((await quote(lines, LAGOS, "X")) as any).couponError).toMatch(/Minimum/);
  });
  it("respects category restrictions and caps fixed discounts", async () => {
    db.coupon.findUnique.mockResolvedValue(C({ categoryIds: ["other"] })); const q: any = await quote(lines, LAGOS, "X"); expect(q.discount).toBe(0); expect(q.couponError).toBeTruthy();
    db.coupon.findUnique.mockResolvedValue(C({ percentOff: null, amountOff: 99999999 })); expect(((await quote(lines, LAGOS, "X")) as any).discount).toBe(200000);
  });
});
