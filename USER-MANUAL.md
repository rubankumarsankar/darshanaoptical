# Darshana Optical — User Manual

*Clear, step-by-step instructions for using the website and the shop management panel.*

**System:** Darshana Optical · Harur, Tamil Nadu · ☎ 88705 71536
**Website:** https://darshanaoptical.com · **Admin panel:** https://darshanaoptical.com/admin/login

## Contents

1. [What this system does](#1-what-this-system-does)
2. [Who can do what — roles](#2-who-can-do-what--roles)
3. [Part A — For visitors (public website)](#3-part-a--for-visitors-public-website)
4. [Part B — Signing in to the Admin Panel](#4-part-b--signing-in-to-the-admin-panel)
5. [Part C — Daily counter work (everyone)](#5-part-c--daily-counter-work-everyone)
6. [Part D — Money and reports (manager & owner)](#6-part-d--money-and-reports-manager--owner)
7. [Part E — Owner only](#7-part-e--owner-only)
8. [First-time setup & deployment](#8-first-time-setup--deployment)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)
10. [Golden rules](#10-golden-rules)

---

## 1. What this system does

| Part | Who uses it | What it does |
|---|---|---|
| **Public website** | Customers | Shows the shop, frames, lenses, offers; lets anyone **book an eye test** or **send an inquiry** |
| **Admin panel** | Shop staff | Runs the whole shop: customers, eye tests, sales and bills, orders, stock, purchases, expenses, reports |

The two are connected: a booking made on the website appears straight away in the admin panel under **Bookings**, and both the shop owner and the customer receive an email automatically.

---

## 2. Who can do what — roles

There are three kinds of account. The owner sets each person's access in **Settings → Staff**; the **Can see money** switch turns a front-desk account into a manager account.

| Screen or action | Front desk | Can see money (manager) | Owner (admin) |
|---|---|---|---|
| Home, New sale, Bills, Bookings, Customers, Eye test, Orders, Products, Stock, Take payment, New stock arrived | ✅ | ✅ | ✅ |
| Shop totals on Home ("Sold today"), **Money**, **Monthly report** | — | ✅ | ✅ |
| Cancel a bill | — | ✅ | ✅ |
| Settings → **Bills & tax**, **Activity** | — | ✅ | ✅ |
| Settings → **Shop details**, **Staff**, **Email alerts** | — | — | ✅ |
| Delete a customer or product | — | — | ✅ |
| Biggest discount allowed (default) | 5 % | 15 % | 100 % |

> The owner can change the discount limits in **Settings → Staff**. Every bill is re-checked on the server, so nobody can get past the limit by changing the screen.

---

## 3. Part A — For visitors (public website)

### 3.1 Browse the shop
Open the website. From the menu you can explore **Frames**, **Lenses**, **Progressive Lenses**, **Eye Testing**, **Offers**, **Gallery**, and use **Lens Finder / Frame Finder** guides. A floating **WhatsApp button** chats with the shop directly.

### 3.2 Book an eye test (no login needed)
1. Click **Book Eye Test** (or open `/book-eye-test`).
2. Fill in: **Name**, **Phone** (must be a valid number — 7 to 15 digits, may start with `+` and may contain spaces or hyphens), optional email, preferred **date & time**, whether you currently wear glasses, and any notes.
3. Press **Submit**.
4. You will see a success message. The shop receives an alert email, and if you gave an email address you receive a confirmation too.
   - Maximum 5 bookings per 10 minutes from one connection — if you see *"Too many requests"*, wait a little or call the shop.

### 3.3 Contact the shop
Open **Contact**, fill in name, phone, what you're interested in, and your message. The shop is notified by email and will call you back.

---

## 4. Part B — Signing in to the Admin Panel

1. Go to **/admin** (e.g. `darshanaoptical.com/admin`). Anyone not signed in is taken to the sign-in page.
2. Enter your **email** and **password** (the owner creates accounts in **Settings → Staff**). On a shared counter computer, people who signed in before appear as tiles — tap your name and type only the password.
3. You land on **Home**.
4. Tap the **sign-out button** next to your name at the bottom of the menu when you finish, especially on shared computers.

**Good to know:**
- After **8 wrong passwords within 15 minutes**, that email (and the computer's IP) is locked out for **15 minutes**. Wait, or ask the owner.
- Sessions last 7 days, but changing a password or switching off an account ends its sessions straight away.
- If the screen says **"Can't connect right now"**, the shop's internet or the server is down. You are still signed in — check the connection and press **Try again**.
- On a phone the menu sits at the bottom of the screen; **More** opens the rest.

---

## 5. Part C — Daily counter work (everyone)

### 5.1 Home (`/admin`)
Shows what needs doing today: late orders, glasses that have arrived, today's bookings, orders ready but customer not told, low stock and new website messages. Each line has a button that takes you straight to the job. People who can see money also see **Sold today**, **Received** and **To collect**.

### 5.2 New sale (`/admin/sale`) — the main counter screen
A step-by-step sale:
1. **Customer** — search by name or mobile number, or add a new customer.
2. **Power** — use the latest eye test, or carry on without one.
3. **Items** — add frames, lenses and services. Stock is checked as you go.
4. **Discount** — you can't give more than your limit; the screen tells you the limit.
5. **Payment** — pay in full, half, nothing now, or another amount; choose cash, UPI, card or bank.
6. **Done** — print the bill or send it on WhatsApp.

The server works out the totals again before saving, and bill numbers never repeat.

### 5.3 Bills (`/admin/bills`)
Every bill, newest first; search by bill number, name or phone. Open a bill to **print** it, **send it on WhatsApp**, **email it**, **take a payment** or (managers and owner) **cancel** it. Old `/admin/invoices` links still work.

### 5.4 Bookings (`/admin/bookings`)
Three tabs:
- **Eye test bookings** — today, tomorrow and the day after. **+ Add booking** for phone or walk-in bookings; **Start eye test** when the customer arrives; **Cancel** if they can't come.
- **All bookings** — every booking from the website or the counter, any date, newest first. Filter by New, Confirmed, Done or Cancelled; **WhatsApp**, **Call**, **Mark confirmed** or **Cancel**.
- **Website messages** — everything sent from the website's Contact page. **WhatsApp** or **Call** the customer, then **Mark replied** or **Close**.

### 5.5 Customers (`/admin/customers`)
Search by name or mobile number. Each customer shows their eye tests, bills, what they still owe, and buttons to start a sale, test eyes, or message them. **+ Add customer** needs a name and a 10-digit mobile number.

### 5.6 Eye test (`/admin/eye-test`)
Pick the customer, enter the power for each eye (SPH, CYL, Axis, ADD, PD), vision and a recommendation, and save. Then **Print prescription**, **Send on WhatsApp** or **Start sale with this power**. The prescription page is at `/admin/prescriptions/<id>`.

### 5.7 Orders (`/admin/orders`)
Glasses being made, step by step from **New** to **Collected**. Tap the next step to move an order along. When it's ready, **Tell customer** sends a WhatsApp message. Late orders are shown first.

### 5.8 Take payment (`/admin/take-payment`)
Find the customer, see what they owe on each bill, enter the amount and method, and save. The money is put against their oldest bills first.

### 5.9 Products (`/admin/products`)
Every frame, lens, sunglass, accessory and service, with price, stock and photo. **+ Add product** to add one; open a product to change it.

### 5.10 Stock (`/admin/stock`) and New stock arrived (`/admin/new-stock`)
- **Stock** shows what's in the shop and what's running low. Tabs: **Deliveries** (supplier bills), **Suppliers**, **History** (every stock movement).
- **New stock arrived** — pick the supplier, add what came in and how much was paid. Stock goes up automatically.

---

## 6. Part D — Money and reports (manager & owner)

### 6.1 Money (`/admin/money`)
Pick a month to see **money in**, **money out** and **what you kept**. Tabs:
- **Who owes you** — customers with unpaid bills, with WhatsApp reminders.
- **Payments** — every payment taken, with the bill and who took it.
- **Expenses** — rent, salary, electricity and so on. Add an expense to record one; delete a wrong entry.

### 6.2 Monthly report (`/admin/report`)
A plain-words summary of the month: sales, bills, expenses, what you kept, a comparison with last month, what sold most and where money went. **Download PDF** or **Send to my WhatsApp**.

### 6.3 Settings — Bills & tax, Activity
- **Bills & tax** — GST and other bill extras.
- **Activity** — who did what and when (every create and change is recorded).

---

## 7. Part E — Owner only

### 7.1 Settings → Shop details
Shop name, tagline, phone, WhatsApp number, email, address, GSTIN, **opening hours** and the **logo** printed on bills. (Opening hours and logo need the one-time database update `npm run db:migrate:shop-details` — see 8.2.)

### 7.2 Settings → Staff
Add staff, change their name, phone or password, switch **Can see money** on or off, and set the **biggest discount allowed** for each kind of account.

### 7.3 Settings → Email alerts
Choose which emails the shop receives.

---

## 8. First-time setup & deployment

### 8.1 Requirements
Node.js 20+, a **TiDB Cloud / MySQL** database, a **Gmail account with an App Password** (for emails), and optionally a **Cloudflare R2 bucket** (for product photos).

### 8.2 Steps
```bash
npm install                   # 1. install dependencies
cp .env.example .env.local    # 2. create the environment file, then edit it (see below)
node db/migrate.mjs           # 3. create all tables + seed users (FIRST TIME ONLY)
node db/migrate_security.mjs  # 4. idempotent security migration (safe to re-run)
npm run db:migrate:shop-details  # 5. opening hours + logo columns (safe to re-run)
npm run dev                   # 6. development server at http://localhost:3000
npm run build && npm start    # production mode
```

> **Updating an older existing database?** Two extra one-off scripts exist:
> `node db/migrate_public_forms.mjs` adds the `appointments` and `inquiries` tables (needed for website bookings/inquiries), and `node db/add_image_column.mjs` adds the product photo column. Both are safe to re-run — on a fresh database, step 3 already includes them.

### 8.3 Environment variables (`.env.local`)
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | TiDB/MySQL connection string (`mysql://user:pass@host:4000/dbname`) |
| `SESSION_SECRET` | Random 32+ hex chars — signs admin session cookies. **Keep secret.** |
| `ADMIN_API_SECRET` | Random 32+ hex chars — protects the two public GET counters |
| `SMTP_FROM` / `SMTP_PASS` | Gmail address + 16-char App Password (myaccount.google.com → Security → App Passwords) |
| `R2_*` (5 values) | Cloudflare R2 bucket + public URL for product images |
| `SEED_ADMIN_PASSWORD` etc. | Optional: set before the very first `db/migrate.mjs` run to choose initial passwords; otherwise random ones are printed once |

> `db/migrate.mjs` prints each seeded user's email and password exactly once — copy them immediately. Default seeded accounts: `admin@darshana.com`, `manager@darshana.com`, `staff@darshana.com`.

### 8.4 Deploying updates
```bash
npm test          # everything must pass
npm run build     # must compile
npm start         # (or deploy to your host; keep env vars set on the host)
```
If `db/schema.sql` changed, check `db/` for a new migration script and run it — they are all idempotent.

---

### 8.5 Backup and restore

Take a logical MySQL backup before every deployment and retain daily backups off the production machine. Never store an unencrypted database dump in the repository.

```bash
# Backup (replace connection details locally; never commit them)
mysqldump --single-transaction --routines --events --databases darshana_optical > darshana-optical-backup.sql

# Restore only to the intended database, preferably a staging copy first
mysql darshana_optical < darshana-optical-backup.sql
```

After restoring, run idempotent migrations, verify admin login, open a recent invoice, and compare customer/invoice counts before allowing staff to use the system.

### 8.6 Cancellation and refund workflow

Only the owner or a manager may cancel a bill (open it in **Bills** and cancel it there). Cancellation is final: it marks the invoice cancelled, restores stock for non-service items, and records a negative refund entry for each original payment method (cash, UPI, card, or bank). Confirm the actual customer refund has been completed before cancellation. Do not cancel an invoice merely to edit it; use a corrective sale or credit process with an audit note instead.

## 9. Troubleshooting & FAQ

| Problem | Cause & fix |
|---|---|
| **"Too many requests" on the booking form** | The 5-per-10-minutes limit was hit. Wait 10 minutes or call the shop. |
| **"a valid phone number is required" when booking** | The phone field needs 7–15 digits (e.g. `9876543210` or `+91 98765 43210`). Letters and symbols like `(` `)` are not accepted. |
| **"Invalid email or password" but I'm sure it's right** | After 8 failures you're locked 15 minutes. Wait, or have an admin verify the account is **Active**. |
| **Redirected to login even after signing in** | Your session was revoked (password/role changed) — sign in again. |
| **"Discount exceeds the limit for your role"** | Intentional. Ask a manager or the owner to make the sale, or ask the owner to raise the limit in **Settings → Staff**. |
| **Product missing in New sale** | Stock is 0 or the product is switched off — record it in **New stock arrived** or fix it in **Products**. |
| **"Can't connect right now"** | The internet or server is down. You are still signed in — fix the connection and press **Try again**. |
| **Saving opening hours or logo fails** | Run `npm run db:migrate:shop-details` once. |
| **Emails not arriving** | Check `SMTP_FROM`/`SMTP_PASS` in `.env.local`; the Gmail App Password must be current (16 chars). The booking still saves even if email fails. |
| **Invoice number looks skipped** | Numbers come from a collision-safe counter; cancelled invoices still consume a number. Normal. |
| **Product photo won't upload** | Only images (JPG/PNG/WebP) are allowed — SVG is rejected for security; check R2 settings. |
| **`DATABASE_URL` error on start** | `.env.local` missing or incomplete — compare with `.env.example`. |
| **Forgot admin password** | Another owner account resets it in **Settings → Staff**; or set `SEED_ADMIN_PASSWORD` and re-run `node db/migrate.mjs` (does not delete data). |

---

## 10. Golden rules

1. **Logout** on shared counter computers.
2. **Never share passwords** — create separate staff accounts so the audit log is meaningful.
3. Check **Home** every morning — it lists today's bookings, ready orders and new website messages.
4. Record every delivery in **New stock arrived** — reports and low-stock alerts depend on it.
5. Record every payment with **Take payment** (or from the bill) — never adjust balances by hand.
6. Only the owner changes **Shop details** and **Staff**; every change is recorded in **Settings → Activity**.
7. After any code update: run `npm test` and `npm run build` before restarting.

