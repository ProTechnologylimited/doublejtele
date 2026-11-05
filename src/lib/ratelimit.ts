// In-memory, per server instance. Swap for Redis/Upstash if you run more than one instance.
const b = new Map<string, { n: number; t: number }>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now(); if (b.size > 5000) b.clear();
  const h = b.get(key); if (!h || now - h.t > windowMs) { b.set(key, { n: 1, t: now }); return true }
  return ++h.n <= max;
}
export const ipOf = (req: Request) => (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
