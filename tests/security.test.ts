import { describe, it, expect, vi } from "vitest";
import { createHmac } from "crypto";
vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn().mockResolvedValue(null) }));
import { validSignature } from "@/lib/paystack";
import { guard, productSchema, categorySchema, slugify } from "@/lib/api";
describe("webhook signature", () => {
  process.env.PAYSTACK_SECRET_KEY = "sk_test_unit";
  const body = '{"event":"charge.success"}', sig = createHmac("sha512", "sk_test_unit").update(body).digest("hex");
  it("accepts a correct signature", () => expect(validSignature(body, sig)).toBe(true));
  it("rejects tampered body, wrong or missing signature", () => { expect(validSignature(body + " ", sig)).toBe(false); expect(validSignature(body, "abc")).toBe(false); expect(validSignature(body, null)).toBe(false) });
});
describe("admin guard", () => {
  it("returns 401 and never runs the handler when not an admin", async () => {
    const fn = vi.fn(); const r = await guard(fn); expect(r.status).toBe(401); expect(fn).not.toHaveBeenCalled();
  });
});
describe("validation", () => {
  const ok = { name: "Phone X", description: "A long enough description", price: 100000, stock: 3, categoryId: "c" };
  it("accepts a valid product", () => expect(productSchema.safeParse(ok).success).toBe(true));
  it("rejects bad products", () => {
    expect(productSchema.safeParse({ ...ok, description: "short" }).success).toBe(false);
    expect(productSchema.safeParse({ ...ok, price: 0 }).success).toBe(false);
    expect(productSchema.safeParse({ ...ok, stock: -1 }).success).toBe(false);
    expect(productSchema.safeParse({ ...ok, comparePrice: 50000 }).success).toBe(false);
    expect(productSchema.safeParse({ ...ok, price: 1.5 }).success).toBe(false);
  });
  it("validates categories and slugs", () => { expect(categorySchema.safeParse({ name: "A" }).success).toBe(false); expect(slugify("Phones & Tablets!")).toBe("phones-tablets") });
});
