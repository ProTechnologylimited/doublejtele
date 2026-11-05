import { describe, it, expect, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { validSignature, paystackConfigured } from "@/lib/paystack";
beforeEach(() => { process.env.PAYSTACK_SECRET_KEY = "sk_test_unit" });
const sign = (b: string, k = "sk_test_unit") => createHmac("sha512", k).update(b).digest("hex");
describe("webhook signature", () => {
  it("accepts a correct signature", () => { expect(validSignature('{"a":1}', sign('{"a":1}'))).toBe(true) });
  it("rejects tampered bodies, wrong keys and missing headers", () => {
    expect(validSignature('{"a":2}', sign('{"a":1}'))).toBe(false); expect(validSignature('{"a":1}', sign('{"a":1}', "other"))).toBe(false); expect(validSignature("x", null)).toBe(false); expect(validSignature("x", "short")).toBe(false);
  });
  it("reports unconfigured placeholder keys", () => { process.env.PAYSTACK_SECRET_KEY = "sk_test_xxx"; expect(paystackConfigured()).toBe(false) });
});
