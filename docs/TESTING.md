# Testing

## Automated (unit)
`npm test` runs Vitest with the database, email and Paystack mocked. It covers: server-side delivery-zone matching and fees (specificity, case, free threshold, unsupported location), stock rejection, coupon rules, status-transition map, Paystack webhook signature, admin-guard 401, and product/category validation.
These do **not** cover pages, real database behaviour, Paystack, or email. Also run `npm run typecheck` and `npm run build`.

## Manual end-to-end checklist (use Paystack TEST keys and a throwaway database)
Tick each box; record failures.
1. [ ] Admin signs in at /admin/login; wrong password is refused.
2. [ ] Signed-out visit to /admin and to POST /api/admin/products returns redirect / 401.
3. [ ] Create a category; it appears in /shop filters.
4. [ ] Add a product with 2 images and a price; it appears on /, /shop and its /products page.
5. [ ] Edit the price and image; storefront updates.
6. [ ] Search by name, brand, model and category; no-match message shows.
7. [ ] Filter by category and in-stock; sort by price and name.
8. [ ] Add to cart, change quantities, refresh: cart persists and subtotals are correct.
9. [ ] Add delivery zones (e.g. Ikeja, Lagos, everywhere-else). Change location in cart: fee and ETA change.
10. [ ] A location with no matching zone shows "delivery must be confirmed" and cannot check out.
11. [ ] Out-of-stock product cannot be added or ordered; ordering more than stock is refused.
12. [ ] Coupons: valid, expired, over-limit, below-minimum, category-restricted.
13. [ ] Place an order: stock drops, order shows as Pending Payment in admin.
14. [ ] Pay with a Paystack test card: order becomes Payment Confirmed only after verification.
15. [ ] Abandon/decline a payment: order stays Pending Payment, can retry.
16. [ ] Replay the same webhook event (Paystack dashboard "resend"): no duplicate history entry or email.
17. [ ] Send a webhook with a bad signature (curl): 401.
18. [ ] Admin moves the order through statuses; invalid jumps are refused; history is recorded; emails arrive (or Notification rows show the SMTP error).
19. [ ] Cancel an unpaid order: stock is restored. Refund a paid test order: Paystack refund is requested.
20. [ ] /order/REF without the token, or with a wrong token, shows 404. /track emails a link and gives the same reply for wrong details.
21. [ ] Layout at 360px, 768px and 1280px widths: no horizontal page scroll in storefront, cart, checkout or admin tables; buttons are tappable; keyboard Tab shows focus.
22. [ ] Force an error (stop the DB): friendly error page, no stack trace or secrets in the browser.
