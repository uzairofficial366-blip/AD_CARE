# AD Care Pharmacy

A full-stack online pharmacy platform: prescription and OTC medicine ordering, pharmacist verification,
admin management, delivery tracking, loyalty, and more.

## Features implemented

- Email/password auth: bcrypt hashing, signed JWT session cookies, rate-limited login, generic error messages
- Role-based access: CUSTOMER, PHARMACIST, ADMIN, SUPERADMIN
- Product catalog with categories, brands, search, and filtering
- Prescription upload and pharmacist review workflow
- Shopping cart, wishlist, and checkout with multiple payment methods
- Order management with full status lifecycle tracking
- Admin console: products, orders, users, prescriptions, inventory/batches, suppliers, deliveries, promotions, reports, site settings
- Customer features: refill reminders, support tickets, address management, loyalty points, referral system
- Delivery agent assignment and tracking
- Batch inventory management with expiry tracking
- Unit tests for core business logic

## Known limitations (explicitly not implemented — not faked)

- **Object storage**: uses local disk (`storage/uploads/`) via a small `ObjectStorage` interface
  (`lib/storage/index.ts`). Swap in an S3/GCS-backed implementation of that interface for production; no
  caller code needs to change.
- **Email notifications**: only in-app-shaped data exists (no email sending). `Notification` model is in the
  schema; wiring an email provider is a follow-up.
- **Rate limiting**: in-memory, single-instance only. Replace with a shared store (e.g. Upstash Redis) before
  running multiple server instances.
- **E2E tests**: only unit tests are included. Integration/E2E (Playwright) would be the next addition.
- **Forgot/reset password**: pages are not implemented; only login/register/logout exist.

## Tech stack

Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Tailwind CSS · Zod · React Hook Form patterns
(implemented directly with `useState` for this form; swap to `react-hook-form` if you prefer)

## Local development

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to a real Postgres instance, and AUTH_SECRET
# generate a secret with: openssl rand -base64 32

npx prisma generate
npx prisma db push        # creates tables from prisma/schema.prisma
npm run prisma:seed       # creates an admin + sample user + sample applications

npm run dev
```

Seed accounts (password for all: `Pharmacy123!`):
- Super Admin: `superadmin@pharmacy.com`
- Admin: `admin@pharmacy.com`
- Pharmacist: `pharmacist@pharmacy.com`
- Customer: `customer@pharmacy.com`

## Testing

```bash
npm test
```

## Production deployment (Vercel + managed Postgres)

1. Provision a PostgreSQL database (Neon, Supabase, RDS, etc.) and set `DATABASE_URL` in Vercel's
   environment variables.
2. Set `AUTH_SECRET` to a long random value (never reuse the dev value).
3. Run `npx prisma migrate deploy` against production as part of your deploy step.
4. Replace `lib/storage/index.ts`'s `LocalDiskStorage` with an S3/GCS implementation before deploying —
   local disk storage does not persist across serverless invocations.
5. Ensure cookies are only ever set over HTTPS (already handled: `secure` is `true` when
   `NODE_ENV === "production"`).

## Architecture

```
app/
  (marketing)/        landing page, privacy, terms, contact
  (auth)/              login, register, forgot/reset password
  account/             profile, orders, addresses, wishlist, prescriptions, refill reminders, support
  admin/               dashboard, products, orders, users, prescriptions, brands, categories, batches,
                       inventory, suppliers, purchase orders, deliveries, payments, promotions, reviews,
                       refills, support, settings, site-settings, reports
  cart/                shopping cart
  checkout/            checkout flow
  categories/          category listing by slug
  offers/              promotions/offers page
  prescriptions/       prescription upload
  products/            product listing, product detail
  api/                 REST API routes for all features
lib/
  auth/                password hashing, session/JWT, rate limiting, RBAC
  db/                  Prisma client singleton
  permissions/         authorization checks
  storage/             object storage interface + local dev implementation
  email/               email helpers (not yet wired)
  pdf/                 PDF generation helpers
  types/               shared TypeScript types
prisma/
  schema.prisma        database schema (30+ models)
  seed.ts              dev seed data (users, products, categories, orders, etc.)
tests/unit/            unit tests
```

## Database schema summary

`User` → `Address`, `Order`, `CartItem`, `WishlistItem`, `Prescription`, `Review`, `SupportTicket`,
`Notification`, `LoyaltyAccount`, `Referral`, `MedicationSchedule`, `StockAlert`, `RefillReminder`.
`Product` → `Category`, `Brand`, `OrderItem`, `Batch`, `StockAdjustment`, `Review`, `CartItem`, `WishlistItem`.
`Order` → `OrderItem`, `Payment`, `Delivery`.
`Batch` → `StockAdjustment`, `Supplier`.
`PurchaseOrder` → `PurchaseOrderItem`, `Supplier`.
Comprehensive indexes on all foreign keys, status fields, slugs, SKUs, and search-critical columns.

## Permission model

- `CUSTOMER`: browse products, manage cart/wishlist, place orders, upload prescriptions, manage account
- `PHARMACIST`: everything a customer can do, plus review and approve/reject prescriptions
- `ADMIN`: everything a pharmacist can do, plus full admin panel access (products, orders, users, reports, settings)
- `SUPERADMIN`: same as ADMIN (can be extended for multi-tenant or system-level operations)
- Every check happens server-side in the route handler / server component, using the session's signed role
  — middleware is an additional layer, not the only one
