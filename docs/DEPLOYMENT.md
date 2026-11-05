# Deployment

Needs: Node 20+, managed PostgreSQL, S3-compatible bucket, SMTP account, Paystack account. Example host: Vercel (any Node host works).

1. **Database**: create a Postgres database (Neon, Supabase, Railway, RDS…). Copy its connection string into `DATABASE_URL`.
2. **Migrate** from your machine against that URL: `npx prisma migrate deploy` (after creating the first migration locally with `npx prisma migrate dev --name init` and committing `prisma/migrations`).
3. **Admin + starter data**: with the production `DATABASE_URL` and `ADMIN_EMAIL`/`ADMIN_PASSWORD` in your local `.env`: `npm run admin:create`, optionally `npm run db:seed`. Then remove the password from `.env`.
4. **Image storage**: create a bucket, a read/write access key, public read access (or CDN), and a CORS rule allowing `PUT` from your site origin. Set the `STORAGE_*` variables.
5. **Host settings**: add every variable from `.env.example` in the host's dashboard. `NEXTAUTH_URL` must be your https site URL; generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`. Build command `npm run build`.
6. **Paystack**: put the live (or test) secret key in `PAYSTACK_SECRET_KEY`. In the Paystack dashboard set the webhook URL to `https://YOUR-DOMAIN/api/paystack/webhook`. Start with test keys and run the checklist in `docs/TESTING.md`.
7. **Email**: set `SMTP_*`. Send yourself a test order and check the Notification table for errors.
8. **Go live**: in /admin add delivery zones, categories, real products, settings and policies; delete any demo data; switch Paystack to live keys only after the checklist passes.

## Rate limiting
Limiters are in memory per instance. On serverless or multi-instance hosting, replace `src/lib/ratelimit.ts` (and the limiters in `src/lib/auth.ts` and `/api/track`) with a shared store such as Upstash Redis.

## Troubleshooting
- `prisma generate` errors: run `npx prisma format` and `npx prisma validate`.
- Login loops: `NEXTAUTH_URL`/`NEXTAUTH_SECRET` missing or http/https mismatch.
- Uploads fail with 503: `STORAGE_*` not set; with a browser CORS error: bucket CORS rule missing.
- "Online payment is not set up": `PAYSTACK_SECRET_KEY` missing or still a placeholder.
- Webhook 401: the key in the host differs from the key of the Paystack account sending events.
- Customers can't check out: no active delivery zone covers their location.
