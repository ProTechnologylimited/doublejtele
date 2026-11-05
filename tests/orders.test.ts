import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/db", () => ({ prisma: {} })); vi.mock("@/lib/email", () => ({ sendOrderEmail: vi.fn() })); vi.mock("@/lib/paystack", () => ({ verifyTransaction: vi.fn(), refundTransaction: vi.fn() }));
import { NEXT } from "@/lib/orders";
describe("order status transitions", () => {
  it("covers every status and ends at REFUNDED", () => { expect(Object.keys(NEXT)).toHaveLength(10); expect(NEXT.REFUNDED).toEqual([]) });
  it("payment can only be confirmed from PENDING_PAYMENT", () => Object.entries(NEXT).forEach(([k, v]) => expect(v.includes("PAYMENT_CONFIRMED" as any)).toBe(k === "PENDING_PAYMENT")));
  it("cannot cancel after shipping, or skip steps", () => { expect(NEXT.SHIPPED).not.toContain("CANCELLED"); expect(NEXT.PROCESSING).not.toContain("DELIVERED"); expect(NEXT.PENDING_PAYMENT).not.toContain("SHIPPED") });
});
