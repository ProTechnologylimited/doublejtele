import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/ratelimit";
describe("rateLimit", () => {
  it("blocks after the limit, per key", () => {
    expect([1, 2, 3].map(() => rateLimit("k1", 2, 1000))).toEqual([true, true, false]); expect(rateLimit("k2", 2, 1000)).toBe(true);
  });
});
