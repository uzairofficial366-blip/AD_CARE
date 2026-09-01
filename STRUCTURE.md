# AD CARE Pharmacy — Full Website Structure

> **Stack:** Next.js 14 (App Router) + Prisma ORM (SQLite) + Tailwind CSS + TypeScript
> **Auth:** JWT sessions via `jose` (HTTP-only cookies, 7-day expiry)
> **Database:** SQLite (file: `prisma/dev.db`)
> **Seed credentials:** `admin@pharmacy.com` / `pharmacist@pharmacy.com` / `customer@pharmacy.com` — all use password `Pharmacy123!`

---

## 1. Tech Stack & Config Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: next 14, prisma 5.19, jose, bcryptjs, lucide-react, zod, react-hook-form |
| `tailwind.config.ts` | Design tokens: `paper` (#FAF8F3), `ink` (#1E293B), `seal` (#2F6F62), `brick` (#B91C1C), `line` (#E2E8F0) |
| `tsconfig.json` | TypeScript config with `@/` path alias |
| `postcss.config.js` | Tailwind + autoprefixer |
| `next.config.js` | Next.js config |
| `middleware.ts` | Protects `/admin/*` routes (requires ADMIN/PHARMACIST), redirects logged-in users away from `/login` and `/register` |
| `.env` | `DATABASE_URL="file:./dev.db"` + `AUTH_SECRET` |
| `vitest.config.ts` | Test config for unit tests |

---

## 2. Database Schema (Prisma — SQLite)

### Models (16 total)

```
User
├── id: String (cuid, PK)
├── name: String
├── email: String (unique)
├── passwordHash: String
├── role: String (CUSTOMER | PHARMACIST | ADMIN)
├── phone: String?
├── isActive: Boolean (default: true)
├── createdAt/updatedAt: DateTime
└── Relations: addresses, orders, prescriptions, reviewedPrescriptions, cartItems, wishlistItems, refillReminders, reviews, supportTickets, ticketMessages, auditLogs

Category
├── id, name, slug (unique), description?, image?, parentId?, isVisible
├── Self-referential parent/children (subcategories)
└── Relations: products

Brand
├── id, name, slug (unique), logo?, description?, isVisible
└── Relations: products

Product
├── id, name, slug (unique), description, sku (unique)
├── price, salePrice?, stockQuantity
├── isPrescriptionRequired, dosageForm?, activeIngredients?
├── usageInstructions?, warnings?, imageUrl?
├── categoryId, brandId?
├── ratingAverage, ratingCount
├── isFeatured, isVisible
└── Relations: cartItems, wishlistItems, orderItems, refillReminders, reviews, category, brand

Prescription
├── id, userId, patientName, patientAge?
├── fileUrl, fileName, fileMimeType
├── status: PENDING_REVIEW | UNDER_PHARMACIST_REVIEW | APPROVED | REJECTED | CLARIFICATION_REQUESTED
├── pharmacistNotes?, reviewedById?, reviewedAt?
└── Relations: user, reviewedBy, auditLogs, orders

PrescriptionAuditLog
├── id, prescriptionId, actorId, oldStatus?, newStatus, notes?
└── Relations: prescription, actor

CartItem
├── id, userId, productId, quantity
└── @@unique([userId, productId])

WishlistItem
├── id, userId, productId
└── @@unique([userId, productId])

Address
├── id, userId, fullName, phone, street, city, state, zipCode, country, isDefault
└── Relations: user, orders

Order
├── id, orderNumber (unique), userId, addressId?, shippingAddressJson
├── status: PENDING | PRESCRIPTION_VERIFICATION | PROCESSING | SHIPPED | DELIVERED | CANCELLED
├── paymentStatus: PENDING | PAID | FAILED | REFUNDED
├── paymentMethod: CARD | CASH_ON_DELIVERY | WALLET | BANK_TRANSFER
├── subtotal, discountAmount, shippingFee, totalAmount
├── prescriptionId?, notes?, cancelReason?
├── deliveryAgentName?, estimatedDelivery?
└── Relations: user, address, prescription, items, tickets

OrderItem
├── id, orderId, productId, productName, unitPrice, quantity, isPrescriptionRequired, totalPrice
└── Relations: order, product

Coupon
├── id, code (unique), discountType (PERCENTAGE | FIXED), discountValue
├── minOrderAmount, expiresAt?, isActive

SiteSetting
├── id, key (unique), value, label

RefillReminder
├── id, userId, productId, frequencyDays, nextRefillDate, notes?, isActive
└── Relations: user, product

Review
├── id, userId, productId, rating (1-5), comment, isApproved
└── Relations: user, product

SupportTicket
├── id, ticketNumber (unique), userId, orderId?
├── subject, category, status (OPEN | IN_PROGRESS | RESOLVED | CLOSED), priority
└── Relations: user, order, messages

TicketMessage
├── id, ticketId, senderId, message
└── Relations: ticketRef, sender

AuditLog
├── id, actorId?, action, entityType, entityId, metadata?
└── Relations: actor
```

---

## 3. File Structure

```
app/
├── layout.tsx                          # Root layout — metadata, font, globals.css
├── globals.css                         # Tailwind directives + custom CSS
├── error.tsx                           # Global error boundary (client component)
├── not-found.tsx                       # 404 page
│
├── (auth)/                             # Auth route group (no layout wrapper)
│   ├── login/page.tsx                  # Login form — client component
│   ├── register/page.tsx               # Registration form — client component
│   ├── forgot-password/page.tsx        # Request password reset email — client
│   └── reset-password/page.tsx         # Set new password with token — client (wrapped in Suspense)
│
├── (marketing)/                        # Marketing route group
│   ├── page.tsx                        # HOMEPAGE — featured products, hero, categories, trust badges (server)
│   ├── terms/page.tsx                  # Terms of Service (server)
│   ├── privacy/page.tsx                # Privacy Policy (server)
│   └── contact/page.tsx                # Contact form → creates support ticket (client)
│
├── products/
│   ├── page.tsx                        # Product catalog — search, filter, sort (server with searchParams)
│   └── [id]/page.tsx                   # Product detail — reviews, add to cart (server)
│
├── categories/
│   └── [slug]/page.tsx                 # Products filtered by category (server)
│
├── cart/page.tsx                       # Shopping cart — localStorage-based (client)
├── checkout/page.tsx                   # Checkout — address, payment, order creation (client)
├── offers/page.tsx                     # Discounted products + active coupons (server)
│
├── prescriptions/
│   └── upload/page.tsx                 # Upload prescription file — client component
│
├── account/                            # Customer account pages
│   ├── profile/page.tsx                # Edit name, phone, change password (client)
│   ├── orders/page.tsx                 # Order history (server, requires auth)
│   ├── orders/[id]/page.tsx            # Order detail (server, requires auth + ownership check)
│   ├── orders/[id]/client.tsx          # Order detail client — cancel button, invoice download
│   ├── prescriptions/page.tsx          # Prescription history (server, requires auth)
│   ├── addresses/page.tsx              # Saved addresses CRUD (client)
│   ├── wishlist/page.tsx               # Wishlist — localStorage-based (client)
│   ├── refill-reminders/page.tsx       # Refill reminders CRUD (client)
│   └── support/page.tsx                # Support tickets + conversation thread (client)
│
├── admin/                              # Admin panel
│   ├── layout.tsx                      # Admin nav bar (minimal — needs sidebar)
│   ├── page.tsx                        # Dashboard — metrics, recent orders, pending Rx (server)
│   ├── products/page.tsx               # Product CRUD — create/edit/delete (client)
│   ├── inventory/page.tsx              # Stock management — inline edit quantities (client)
│   ├── orders/page.tsx                 # Order management — status, delivery agent (client)
│   ├── prescriptions/page.tsx          # Prescription review — approve/reject modal (client)
│   ├── promotions/page.tsx             # Coupon CRUD (client)
│   ├── users/page.tsx                  # User management — role/active toggle (client)
│   ├── support/page.tsx                # Support ticket management (client)
│   ├── reports/page.tsx                # Audit trail logs (server)
│   └── site-settings/page.tsx          # Toggle site sections on/off (client)
│
├── api/                                # API routes
│   ├── auth/
│   │   ├── login/route.ts              # POST — email+password → JWT cookie
│   │   ├── register/route.ts           # POST — create account
│   │   ├── logout/route.ts             # POST — clear cookie
│   │   ├── forgot-password/route.ts    # POST — send reset email (mock)
│   │   └── reset-password/route.ts     # POST — verify token + set new password
│   │
│   ├── products/
│   │   ├── route.ts                    # GET — list products (search, filter, sort, pagination)
│   │   └── [id]/route.ts               # GET — single product
│   │
│   ├── categories/route.ts             # GET — list categories
│   ├── brands/route.ts                 # GET — list brands
│   │
│   ├── cart/route.ts                   # GET/POST/PUT/DELETE — server-side cart (unused by UI)
│   ├── orders/route.ts                 # POST — create order (requires auth)
│   ├── orders/[id]/cancel/route.ts     # POST — cancel own order
│   │
│   ├── payments/route.ts               # POST — mock payment processing
│   ├── coupons/validate/route.ts       # POST — validate coupon code
│   │
│   ├── prescriptions/upload/route.ts   # POST — upload prescription file (requires auth)
│   ├── reviews/route.ts                # POST — submit product review
│   ├── wishlist/route.ts               # POST — toggle wishlist item
│   ├── refill-reminders/route.ts       # GET/POST/PUT/DELETE — refill reminders
│   ├── refill-reminders/[id]/route.ts  # PUT/DELETE — single reminder
│   │
│   ├── addresses/route.ts              # GET/POST — list/create addresses
│   ├── addresses/[id]/route.ts         # PUT/DELETE — update/delete address
│   │
│   ├── support/
│   │   ├── tickets/route.ts            # GET/POST — list/create tickets
│   │   └── tickets/[id]/messages/route.ts  # POST — add message to ticket
│   │
│   ├── account/
│   │   ├── profile/route.ts            # GET/PUT — view/update profile
│   │   └── password/route.ts           # PUT — change password (requires current password)
│   │
│   ├── storage/[...key]/route.ts       # GET — serve uploaded files
│   │
│   └── admin/
│       ├── products/route.ts           # GET/POST — list/create products (requires admin)
│       ├── products/[id]/route.ts      # GET/PUT/DELETE — single product (requires admin)
│       ├── products/toggle-visibility/route.ts  # POST — toggle isVisible (requires admin)
│       ├── orders/list/route.ts        # GET — list all orders (requires admin)
│       ├── orders/[id]/route.ts        # PATCH — update order status/agent (requires admin)
│       ├── prescriptions/route.ts      # GET — list all prescriptions (requires admin)
│       ├── prescriptions/[id]/route.ts # PATCH — approve/reject prescription (requires pharmacist/admin)
│       ├── coupons/route.ts            # GET/POST — list/create coupons (requires admin)
│       ├── coupons/[id]/route.ts       # PUT/DELETE — update/delete coupon (requires admin)
│       ├── users/route.ts              # GET/PUT — list/update users (requires admin)
│       ├── support/route.ts            # GET/PUT — list/update support tickets (requires admin)
│       └── site-settings/route.ts      # GET/PUT — site settings (no auth guard currently)

components/
├── layout/
│   ├── header.tsx                      # Site header — search, nav, cart icon, user menu, mobile drawer
│   └── footer.tsx                      # Site footer — links, newsletter, branding
│
├── ui/
│   ├── button.tsx                      # Reusable Button — primary/secondary/ghost/danger variants
│   └── status-badge.tsx                # Status badge — maps status strings to colored pills
│
├── products/
│   ├── product-card.tsx                # Product card — image, price, heart toggle, add to cart
│   ├── product-filters.tsx             # Filter sidebar — category, brand, Rx, price, search
│   ├── add-to-cart-button.tsx          # Add to cart button with localStorage + confirmation
│   ├── review-section.tsx              # Reviews list + avg rating display
│   └── review-form.tsx                 # Star rating + comment form
│
└── prescriptions/
    └── prescription-uploader.tsx       # File upload form with drag-and-drop

lib/
├── db/prisma.ts                        # Prisma client singleton (global caching for dev HMR)
├── auth/
│   ├── session.ts                      # JWT session — createSession, getSession, destroySession
│   ├── password.ts                     # bcrypt hash/verify + password strength checker
│   ├── admin.ts                        # requireAdmin() — checks session for ADMIN/PHARMACIST role
│   └── rate-limit.ts                   # Simple in-memory rate limiter
├── email/index.ts                      # Email templates — orderConfirmation, prescriptionStatus, orderShipped
├── pdf/invoice.ts                      # HTML invoice generator
├── storage/
│   ├── index.ts                        # File storage abstraction (local filesystem)
│   ├── file-signature.ts              # Detect file type from magic bytes
│   └── signed-url.ts                  # Signed URL generation
├── permissions/index.ts                # Role-based permission checks
├── types/pharmacy.ts                   # TypeScript types/enums for pharmacy domain
```

---

## 4. Page Routes

| Route | Component Type | Auth Required | Description |
|-------|---------------|---------------|-------------|
| `/` | Server | No | Homepage — hero, featured products, categories, trust badges |
| `/login` | Client | No (redirects if logged in) | Login form |
| `/register` | Client | No (redirects if logged in) | Registration form |
| `/forgot-password` | Client | No | Request password reset |
| `/reset-password` | Client | No (needs token) | Set new password |
| `/products` | Server | No | Product catalog with search/filter |
| `/products/[id]` | Server | No | Product detail with reviews |
| `/categories/[slug]` | Server | No | Products by category |
| `/cart` | Client | No | Shopping cart (localStorage) |
| `/checkout` | Client | No (needs cart items) | Checkout flow |
| `/offers` | Server | No | Discounted products + coupons |
| `/terms` | Server | No | Terms of service |
| `/privacy` | Server | No | Privacy policy |
| `/contact` | Client | No | Contact form (creates support ticket) |
| `/prescriptions/upload` | Client | Yes | Upload prescription file |
| `/account/profile` | Client | Yes | Edit profile + change password |
| `/account/orders` | Server | Yes | Order history |
| `/account/orders/[id]` | Server | Yes | Order detail (ownership check) |
| `/account/prescriptions` | Server | Yes | Prescription history |
| `/account/addresses` | Client | Yes | Saved addresses CRUD |
| `/account/wishlist` | Client | No (localStorage) | Wishlist |
| `/account/refill-reminders` | Client | Yes | Refill reminders CRUD |
| `/account/support` | Client | Yes | Support tickets |
| `/admin` | Server | Admin/Pharmacist | Dashboard |
| `/admin/products` | Client | Admin/Pharmacist | Product CRUD |
| `/admin/inventory` | Client | Admin/Pharmacist | Stock management |
| `/admin/orders` | Client | Admin/Pharmacist | Order management |
| `/admin/prescriptions` | Client | Admin/Pharmacist | Prescription review |
| `/admin/promotions` | Client | Admin/Pharmacist | Coupon CRUD |
| `/admin/users` | Client | Admin/Pharmacist | User management |
| `/admin/support` | Client | Admin/Pharmacist | Support ticket management |
| `/admin/reports` | Server | Admin/Pharmacist | Audit trail |
| `/admin/site-settings` | Client | Admin/Pharmacist | Toggle site sections |

---

## 5. API Routes

| Endpoint | Methods | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/login` | POST | No | Login with email+password |
| `/api/auth/register` | POST | No | Create account |
| `/api/auth/logout` | POST | No | Destroy session |
| `/api/auth/forgot-password` | POST | No | Send reset email (mock) |
| `/api/auth/reset-password` | POST | No | Verify token + reset password |
| `/api/products` | GET | No | List products (search, filter, sort) |
| `/api/products/[id]` | GET | No | Get single product |
| `/api/categories` | GET | No | List categories |
| `/api/brands` | GET | No | List brands |
| `/api/cart` | GET/POST/PUT/DELETE | No | Server-side cart CRUD |
| `/api/orders` | POST | Yes | Create order |
| `/api/orders/[id]/cancel` | POST | Yes | Cancel own order |
| `/api/payments` | POST | No | Process payment (mock) |
| `/api/coupons/validate` | POST | No | Validate coupon code |
| `/api/prescriptions/upload` | POST | Yes | Upload prescription file |
| `/api/reviews` | POST | Yes | Submit product review |
| `/api/wishlist` | POST | Yes | Toggle wishlist item |
| `/api/refill-reminders` | GET/POST/PUT/DELETE | Yes | Refill reminders CRUD |
| `/api/refill-reminders/[id]` | PUT/DELETE | Yes | Single reminder |
| `/api/addresses` | GET/POST | Yes | List/create addresses |
| `/api/addresses/[id]` | PUT/DELETE | Yes | Update/delete address |
| `/api/support/tickets` | GET/POST | Yes | List/create support tickets |
| `/api/support/tickets/[id]/messages` | POST | Yes | Add message to ticket |
| `/api/account/profile` | GET/PUT | Yes | View/update profile |
| `/api/account/password` | PUT | Yes | Change password |
| `/api/storage/[...key]` | GET | No | Serve uploaded files |
| `/api/admin/products` | GET/POST | Admin | List/create products |
| `/api/admin/products/[id]` | GET/PUT/DELETE | Admin | Single product CRUD |
| `/api/admin/products/toggle-visibility` | POST | Admin | Toggle product visibility |
| `/api/admin/orders/list` | GET | Admin | List all orders |
| `/api/admin/orders/[id]` | PATCH | Admin | Update order status/agent |
| `/api/admin/prescriptions` | GET | Admin | List all prescriptions |
| `/api/admin/prescriptions/[id]` | PATCH | Pharmacist/Admin | Approve/reject prescription |
| `/api/admin/coupons` | GET/POST | Admin | List/create coupons |
| `/api/admin/coupons/[id]` | PUT/DELETE | Admin | Update/delete coupon |
| `/api/admin/users` | GET/PUT | Admin | List/update users |
| `/api/admin/support` | GET/PUT | Admin | List/update support tickets |
| `/api/admin/site-settings` | GET/PUT | No (needs guard) | Site settings |

---

## 6. Component Library

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `Header` | `components/layout/header.tsx` | `user?`, `cartCount?` | Site header with search, nav, cart, user menu, mobile drawer |
| `Footer` | `components/layout/footer.tsx` | none | Site footer with links, branding |
| `Button` | `components/ui/button.tsx` | `variant`, `loading`, `children` | Reusable button (primary/secondary/ghost/danger) |
| `StatusBadge` | `components/ui/status-badge.tsx` | `status` | Colored badge for order/prescription/ticket statuses |
| `ProductCard` | `components/products/product-card.tsx` | full product data | Product card with image, price, heart, add-to-cart |
| `ProductFilters` | `components/products/product-filters.tsx` | categories, brands, searchParams | Filter sidebar with URL-based navigation |
| `AddToCartButton` | `components/products/add-to-cart-button.tsx` | `product` | Add to cart with localStorage + confirmation feedback |
| `ReviewSection` | `components/products/review-section.tsx` | `productId`, `ratingAverage`, `ratingCount`, `reviews`, `isLoggedIn` | Reviews list + rating display |
| `ReviewForm` | `components/products/review-form.tsx` | `productId`, `onReviewAdded` | Star rating + comment form |
| `PrescriptionUploader` | `components/prescriptions/prescription-uploader.tsx` | none | File upload with drag-and-drop |

---

## 7. Design System (Tailwind)

### Colors
- **paper** `#FAF8F3` — background
- **ink** `#1E293B` — primary text
- **ink-soft** `#64748B` — secondary text
- **seal** `#2F6F62` — primary brand (teal-green)
- **seal-dark** `#1A4040` — hover state
- **brick** `#B91C1C` — danger/red
- **line** `#E2E8F0` — borders

### Also used (Tailwind defaults)
- `slate-*` — used extensively in admin/account pages
- `teal-*` — primary action color throughout
- `amber-*` — prescription/warning states
- `emerald-*` — success/in-stock states
- `red-*` — error/out-of-stock states

### Typography
- **font-display** — Source Serif 4 (headings)
- **font-sans** — Inter (body)
- **font-mono** — IBM Plex Mono (code/SKU)

### Border radius
- **rounded-card** — `0.75rem` (12px)

---

## 8. Auth Flow

1. User submits login form → `POST /api/auth/login`
2. Server verifies password with bcrypt, creates JWT session cookie
3. `lib/auth/session.ts` — `getSession()` reads cookie, verifies JWT with jose
4. `lib/auth/admin.ts` — `requireAdmin()` checks session role for admin routes
5. `middleware.ts` — protects `/admin/*` page routes (not API routes)
6. Session expires after 7 days

---

## 9. Key Features Implemented

- [x] Product catalog with search, category/brand filters, Rx filter, sort
- [x] Product detail with reviews, ratings, add-to-cart
- [x] Shopping cart (localStorage-based)
- [x] Checkout with order creation + mock payment
- [x] Prescription upload with file type validation (magic bytes)
- [x] Prescription review workflow (pharmacist approve/reject with notes)
- [x] Order management (status updates, delivery agent assignment)
- [x] Inventory stock management (inline editing)
- [x] Coupon/promotion CRUD with validation
- [x] User management (role/active toggle)
- [x] Support ticket system with conversation threads
- [x] Refill reminders CRUD
- [x] Address management (saved addresses)
- [x] Wishlist (localStorage-based)
- [x] Account profile + password change
- [x] Forgot/reset password flow
- [x] Email notifications (mock — logs to console)
- [x] Invoice HTML generation + download
- [x] Admin dashboard with metrics
- [x] Admin site settings (toggle sections)
- [x] Audit trail for prescription reviews
- [x] File storage abstraction (local filesystem)
- [x] Rate limiting utility
- [x] Role-based permissions

---

## 10. Seed Data

The database is seeded with:
- **3 users:** Admin, Pharmacist, Customer (all with `Pharmacy123!`)
- **Categories:** Medicine, Vitamins & Supplements, Personal Care, Medical Devices, Skincare
- **Brands:** Cipla, Sun Pharma, HealthVit, DermaCare, MedTech
- **Products:** ~20 sample products across categories (mix of Rx and OTC)
- **Coupons:** WELCOME10 (10% off), FLAT5 ($5 off)
- **Site Settings:** top_announcement, rx_section, refill_callout, loyalty_program

---

## 11. Known Gaps / Future Work

- No real payment gateway integration (mock only)
- No actual email sending (logs to console)
- Cart is localStorage-only (server-side cart API exists but is unused)
- Wishlist is localStorage-only (server-side API exists but is unused)
- No pagination on product catalog or admin lists
- No admin category/brand management UI
- Admin layout needs proper sidebar navigation
- No product slug-based URLs (uses database ID)
- No CSRF protection on API routes
- Admin API auth guard not applied to site-settings route
- No loading skeletons — uses text-based loading states
