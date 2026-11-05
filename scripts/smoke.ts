// Run against a running server: BASE_URL=http://localhost:3000 npm run test:smoke
const base = process.env.BASE_URL || "http://localhost:3000"; let fail = 0;
async function t(name: string, fn: () => Promise<boolean>) { let ok = false; try { ok = await fn() } catch (e) { console.log("  error:", (e as Error).message) } console.log(ok ? "PASS" : "FAIL", name); if (!ok) fail++ }
const post = (p: string, body: unknown, h: Record<string, string> = {}) => fetch(base + p, { method: "POST", headers: { "content-type": "application/json", ...h }, body: JSON.stringify(body), redirect: "manual" });
(async () => {
  await t("storefront home loads", async () => (await fetch(base + "/")).status === 200);
  await t("shop loads", async () => (await fetch(base + "/shop")).status === 200);
  await t("unknown page gives 404", async () => (await fetch(base + "/no-such-page")).status === 404);
  await t("robots.txt blocks /admin", async () => (await (await fetch(base + "/robots.txt")).text()).includes("Disallow: /admin"));
  await t("sitemap.xml exists", async () => (await fetch(base + "/sitemap.xml")).status === 200);
  await t("admin page redirects when signed out", async () => { const r = await fetch(base + "/admin", { redirect: "manual" }); return r.status >= 300 && r.status < 400 });
  await t("admin API refuses anonymous POST", async () => [401, 307, 302].includes((await post("/api/admin/products", {})).status));
  await t("admin API does not leak data to anonymous GET", async () => (await fetch(base + "/api/admin/categories", { redirect: "manual" })).status !== 200);
  await t("quote rejects a malformed body", async () => (await post("/api/quote", { nope: 1 })).status === 400);
  await t("order page needs the secret token", async () => (await fetch(base + "/order/DJ-0000000000?t=bad")).status === 404);
  await t("webhook rejects a bad signature", async () => (await post("/api/paystack/webhook", { event: "charge.success" }, { "x-paystack-signature": "bad" })).status === 401);
  console.log(fail ? `\n${fail} check(s) failed` : "\nAll smoke checks passed"); process.exit(fail ? 1 : 0);
})();
