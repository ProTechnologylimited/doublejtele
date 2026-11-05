# Double J Tele World

**Status: Release candidate (Stages 1–6). **Never executed: no install, build, test run or payment call has happened.** See docs/TESTING.md** (no network was available to install dependencies). Expect small type or runtime fixes on first `npm run dev`.

## Included
- `preview/index.html` – storefront preview (demo data, no real payments).
- `prisma/schema.prisma`, `prisma/seed.ts` (starter categories only, no fake products).
- Auth: NextAuth credentials, 8h JWT sessions, `middleware.ts` + a second server-side check in the admin layout and every `/api/admin/*` handler. No public registration; the admin is created by `npm run admin:create`. Login attempts are rate-limited per instance (use Redis when scaling out).
- Admin: dashboard (real DB counts), category create/delete, product create/delete with multi-image upload and previews, audit log entries.
- `src/lib/pricing.ts` – server-side cart pricing and delivery-zone matching (not wired to a checkout yet).

## Setup
1. `cp .env.example .env`, fill it in (never commit `.env`). Use Node 20+.
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `npm run db:seed` (optional starter categories)
5. Set `ADMIN_EMAIL` and a 12+ character `ADMIN_PASSWORD`, run `npm run admin:create`, then delete the password from `.env`.
6. `npm run dev` → http://localhost:3000/admin

## Image storage
Any S3-compatible bucket (Cloudflare R2, AWS S3). Set the `STORAGE_*` variables, make the bucket publicly readable (or front it with a CDN) and add a CORS rule allowing `PUT` from your site origin. Without it, uploads return a clear "not configured" error.

## Stage 3 (storefront, cart, checkout, delivery)
- `/` home, `/shop` (search, category, availability, sort, pagination), `/products/[slug]` all read from the database.
- `/cart`: localStorage cart; `/api/quote` re-prices from the database and matches delivery zones; `/api/orders` re-validates everything and decrements stock atomically (no overselling). Orders start as **Pending Payment**; there is no payment yet.
- `/order/[ref]?t=TOKEN`: private order page (token required; order number alone shows nothing).
- `/admin/delivery`: add/delete delivery zones, fees, ETAs, free-delivery thresholds. Until a zone exists nobody can check out.
- Popularity sort, brand/price-range filters, coupons, guest-status lookup by email, accounts and variations are not built.

## Stage 4 (payments, orders, notifications, tracking)
- **Paystack**: `/api/pay` starts a transaction (amount from the stored order); return page and `/api/paystack/webhook` both call `confirmPayment()`, which re-verifies with Paystack, checks amount/currency, and flips the payment once (idempotent). Webhook signature (HMAC-SHA512) is validated. Without a real `sk_` key the Pay button says payment isn't set up. Set the webhook URL in the Paystack dashboard. Use `sk_test_` keys for sandbox.
- **Admin orders** (`/admin/orders`): search by order no./name/phone/email, filter by status and date, detail view, status moves limited by a transition map with history, courier/tracking/ETA, internal notes, print invoice, refund via Paystack's refund API (asks for confirmation). Cancelling restocks items. "Payment Confirmed" can only come from verification.
- **Email**: nodemailer via SMTP; every message is logged in `Notification` (with the error if SMTP is missing). `/track` emails a private link to the address on file instead of revealing order data.
- Not built: manual bank-transfer/cash-on-delivery methods, enable/disable payment methods, SMS/WhatsApp sender, courier live tracking, partial refunds, customer accounts.

## Stage 5 (settings, coupons, SEO, hardening, edit screens)
- `/admin/settings`: store name, logo URL, description, contact, social links, currency/time zone (stored, display still ₦), homepage promo banner, return/refund/warranty/privacy/terms (public at `/policies/[slug]`, shown in the footer).
- `/admin/coupons`: percentage or fixed, min order, start/expiry, max uses (enforced atomically at order time), category restriction. Validated server-side in `quote()`; product-level restriction works in the API (`productIds`) but has no UI.
- Edit screens for products and categories (category sort number = display order). Delivery zones can still only be added/deleted.
- SEO: per-page titles, canonical + Open Graph on products, Product JSON-LD, `/sitemap.xml`, `/robots.txt` (admin, api, cart, order, track disallowed), custom 404 and error pages.
- Hardening: security headers, rate limits on quote/orders/pay/track/login (per-instance memory; use Redis if scaling out). No CSP yet. Tax settings and per-event email toggles are not built.

## Stage 6
- `npm test` (vitest) and `npm run test:smoke`; manual 22-point checklist and fixes found in review: `docs/TESTING.md`.
- Production guide, env vars, troubleshooting: `docs/DEPLOYMENT.md`.

## Known gaps
Edit-product and edit-category screens (the PATCH APIs exist), category reordering UI, category images, variations UI, order/delivery/coupon/settings admin, storefront pages, checkout, Paystack, email, SEO files, tests.

## Next
Stage 6 (done): `tests/`, `docs/TESTING.md`, `docs/DEPLOYMENT.md`. Earlier plan was: tests and deployment guide.
