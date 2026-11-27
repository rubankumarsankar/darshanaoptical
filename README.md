# Darshana Optical

Darshana Optical's customer website and administration system, built with Next.js 16, React 19, TypeScript, and MySQL/TiDB Cloud.

## Project layout

```
app/
  (public pages)        page.tsx, frames/, lenses/, book/, contact/, …
  components/site/      website header, footer, page sections and forms
  components/booking/   the Book-an-eye-test popup
  admin/                admin screens (/admin, /admin/sale, /admin/bills, …)
  admin/_ui/            admin shell, menu, shared parts, simple.module.css, print.css
  api/                  public form endpoints and /api/admin/* endpoints
  lib/                  database, sessions, validation, mailers and admin helpers
db/                     schema.sql and one-off, re-runnable migration scripts
public/                 logos and website images
tests/                  unit/, integration/ (Vitest) and e2e/ (Playwright)
proxy.ts                cookie check in front of /admin
```

## Local development

Requirements: Node.js 20 or newer and a MySQL-compatible database.

```bash
npm install
copy .env.example .env.local
npm run db:migrate
npm run dev
```

The customer website is available at `http://localhost:3000` and the administration login at `http://localhost:3000/admin/login`.

## Environment variables

Copy `.env.example` to `.env.local` and configure the required values. Never commit `.env.local` or production credentials.

Required for admin authentication:

- `DATABASE_URL`: MySQL/TiDB connection string.
- `SESSION_SECRET`: random secret used to sign admin session cookies.
- `ADMIN_API_SECRET`: random secret protecting internal administrative endpoints.

Email delivery requires `SMTP_FROM` and `SMTP_PASS`. Product image uploads require the `R2_*` variables documented in `.env.example`.

Generate a suitable secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database setup

For a new database:

```bash
npm run db:migrate
```

For an existing database that needs the authentication hardening tables and columns:

```bash
npm run db:migrate:security
```

Both scripts use `DATABASE_URL` from the environment or `.env.local`. The security migration is idempotent.

## Verification

```bash
npm run lint
npm test
npm run build
```

## Deployment

Configure all required values as encrypted secrets in the production hosting environment, run the database migration, and then deploy the `main` branch.

This application requires a dynamic server runtime for its API routes, login, database, and email. Deploy it to **Cloudflare Workers** through OpenNext rather than as a static Pages export.

```bash
npm run build:cloudflare
npx wrangler deploy
```

In Cloudflare, create or use a **Workers** project (not Pages) with build command `npm run build:cloudflare` and deploy command `npx wrangler deploy`. Configure runtime secrets under **Workers & Pages → Project → Settings → Variables and Secrets** before deployment.

Additional operating instructions are available in `USER-MANUAL.md`.
