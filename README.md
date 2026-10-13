# Marto Marketplace

**Multi-vendor e-commerce marketplace**

|                  |                                                                  |
| ---------------- | ---------------------------------------------------------------- |
| **Project**      | Marto Marketplace                                                |
| **Brand**        | Marto                                                            |
| **Website**      | *marto-online.com*                                               |
| **Type**         | Multi-vendor E-commerce Marketplace                              |
| **Currency**     | PKR                                                              |
| **Platform Fee** | PKR 10 per completed transaction/order (configurable)            |
| **Version**      | 1.0.0                                                            |
| **Status**       | Core MVP Development                                             |
| **Architecture** | Modular Monolith (backend) + 4 frontend interfaces               |

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Repository Layout](#3-repository-layout)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Core Business Rules](#5-core-business-rules)
6. [Frontend](#6-frontend)
7. [Backend](#7-backend)
8. [Data Model](#8-data-model)
9. [Authentication & Security](#9-authentication--security)
10. [Getting Started](#10-getting-started)
11. [Demo Accounts](#11-demo-accounts)
12. [Logging & Auditing](#12-logging--auditing)
13. [MVP Scope & Roadmap](#13-mvp-scope--roadmap)
14. [Open Points / Clarifications](#14-open-points--clarifications)
15. [Development Guidelines](#15-development-guidelines)
16. [License](#16-license)

---

## 1. Overview

Marto is a scalable multi-vendor marketplace. Independent sellers register through a public onboarding portal, get approved by the Super Admin, create shops, categories and products, and process orders. Customers browse shops and products, manage a cart and addresses, place orders and track them. The platform automatically calculates a fixed transaction fee on every order.

**Marketplace lifecycle (minimum complete MVP):**

```
Seller onboarding → Product publishing → Customer purchase → Order management → Platform revenue tracking
```

**End-to-end flow:**

```
Seller Join Portal → Registration → Pending → Super Admin approves → Active Seller
→ Seller login → Create shop → Create categories → Add products → Products published
→ Customer browses → Selects shop → Product detail → Checkout → Order created
→ Seller manages order / Super Admin views order → Delivered
→ Platform fee (PKR 10) → Platform revenue
```

---

## 2. System Architecture

The system has **four frontend interfaces** talking to **one backend REST API**.

```
┌──────────────────┐┌──────────────────┐┌──────────────┐┌────────────┐
│ Customer Website ││ Seller Join      ││ Seller Panel ││ Super Admin|
│                  ││ Portal (public)  ││              ││            |
└────────┬─────────┘└────────┬─────────┘└──────┬───────┘└──────┬─────┘ 
         └───────────────────┴─────────────────┴───────────────┘
                                      │   HTTP-only cookie (JWT)
                           ┌──────────▼───────────┐
                           │   Marto REST API     │
                           │  NestJS · TypeORM    │
                           └──────────┬───────────┘
                                      │
                           ┌──────────▼───────────┐
                           │     PostgreSQL       │
                           └──────────────────────┘
```

| Layer              | Technology                                                       |
| ------------------ | ---------------------------------------------------------------- |
| Frontend (planned) | ReactJS + Tailwind CSS                                           |
| Backend            | NestJS (TypeScript), modular monolith                            |
| Database           | PostgreSQL + TypeORM (migrations)                                |
| Auth               | JWT in HTTP-only cookies, RBAC                                   |
| API docs           | Swagger / OpenAPI                                                |

---

## 3. Repository Layout

> Suggested layout. Adjust to your actual repo structure (monorepo or separate repos).

```
marto/
├── backend/                 # NestJS REST API (see §7)
├── frontend/
│   ├── customer-web/        # Customer Website
│   ├── seller-portal/       # Seller Join Portal (public onboarding)
│   ├── seller-panel/        # Seller dashboard
│   └── admin-panel/         # Super Admin dashboard
└── README.md
```

> The BRD allows the Seller Panel and Super Admin Panel to be delivered as **one role-based Admin Panel**. The Stitch screen list treats them as separate groups (S-series and A-series); either implementation works as long as role-based routing is enforced.

---

## 4. User Roles & Permissions

| Role            | Description                                  |
| --------------- | -------------------------------------------- |
| **CUSTOMER**    | Purchases products from the marketplace      |
| **SELLER**      | Owns and manages a shop (after approval)     |
| **SUPER_ADMIN** | Controls and governs the entire marketplace  |

| Feature                | Customer | Seller   | Super Admin |
| ---------------------- | :------: | :------: | :---------: |
| Browse products        | ✓        | ✓        | ✓           |
| Buy product            | ✓        | Optional | No          |
| Manage own shop        | No       | ✓        | ✓           |
| Manage own products    | No       | ✓        | ✓*          |
| View own orders        | ✓        | ✓        | ✓           |
| View all orders        | No       | No       | ✓           |
| Manage sellers         | No       | No       | ✓           |
| Manage platform        | No       | No       | ✓           |
| Manage platform fee    | No       | No       | ✓           |

\* Per the project rules the Super Admin **cannot directly edit seller-owned product information** — only enable/disable/remove. The frontend therefore shows products read-only (screens A07, A08).

---

## 5. Core Business Rules

| ID    | Rule                                                              |
| ----- | ----------------------------------------------------------------- |
| BR-01 | Every seller must have an approved account before selling.        |
| BR-02 | Every seller must have at least one shop.                         |
| BR-03 | Products must belong to a seller and a shop.                      |
| BR-04 | Disabled sellers cannot sell products.                            |
| BR-05 | Disabled shops cannot be displayed to customers.                  |
| BR-06 | Disabled products cannot be purchased.                            |
| BR-07 | Disabled categories cannot be displayed to customers.             |
| BR-08 | An order can contain products from **only one seller**.           |
| BR-09 | Platform fee is charged per transaction/order.                    |
| BR-10 | Default platform fee is **PKR 10**.                               |
| BR-11 | Super Admin can modify the platform fee.                          |
| BR-12 | Seller can only access their own shop/products/orders/revenue.    |
| BR-13 | Super Admin can access marketplace-wide information.              |
| BR-14 | Removing a seller must not physically delete historical orders.   |
| BR-15 | Historical financial records must remain available for reporting. |

### Seller lifecycle

```
Registration → Pending → (Super Admin approval) → Approved → Active Selling
```
Seller statuses: `Pending`, `Approved`, `Disabled`, `Removed`.

### Statuses

| Entity   | Statuses                                     |
| -------- | -------------------------------------------- |
| Shop     | `Active`, `Disabled`                         |
| Product  | `Active`, `Disabled`, `Out of Stock`, `Removed` |
| Category | `Active`, `Disabled`, `Removed`              |

### Order lifecycle

```
Pending → Confirmed → Processing → Shipped → Delivered
Pending / Confirmed / Processing → Cancelled
```
Sellers can only perform permitted transitions.

### Platform fee & revenue

```
Product price      = PKR 1,000
Platform fee       = PKR 10
Seller earning     = PKR 990
Platform revenue   = Completed transactions × Platform fee
```

Seller dashboard metrics: Gross Sales, Platform Fees, Net Revenue, Total Orders, Average Order Value.

### Single-seller order model

A customer can buy Product 1 + Product 2 from Seller A, but **not** Product 1 (Seller A) + Product 3 (Seller B) in one order. Checkout must clearly communicate this rule. The data model (Order + OrderItem) is built so multi-seller checkout can be added later.

### Disabling a seller (cascade)

- Seller cannot operate normally
- Shop becomes unavailable
- Products become unavailable to customers
- Existing order records remain available for reporting

---

## 6. Frontend

### 6.1 Interfaces

| Interface            | Audience         | Purpose                                                         |
| -------------------- | ---------------- | --------------------------------------------------------------- |
| **Customer Website** | Customers        | Browse, search, cart, checkout, orders, account                 |
| **Seller Join Portal** | Prospective sellers | Landing page, 3-step registration, application status         |
| **Seller Panel**     | Approved sellers | Dashboard, shop, products, categories, orders, revenue, settings |
| **Super Admin Panel**| Super Admin      | Governance: sellers, shops, products, categories, orders, revenue, settings, audit |

### 6.2 Planned stack & conventions

- **ReactJS + Tailwind CSS** (per backend roadmap)
- Mobile-first customer experience; responsive variants: **Mobile (390px)**, **Tablet (768px)**
- Cookie-based auth (`credentials: 'include'` on every API call) — no tokens in `localStorage`
- Route guards by role (`CUSTOMER`, `SELLER`, `SUPER_ADMIN`)
- Pagination, search, filtering and sorting on all major listings
- Empty / Loading / Error states for listings, cart, orders and tables
- Dark mode as a refinement pass
- Currency always displayed in **PKR**
- Notifications: simulated in UI for the prototype; designed to plug into a real notification service later

> The BRD's prototype phase used HTML, CSS, vanilla JavaScript, dummy JSON and LocalStorage (no backend). The production frontend replaces that with real API calls.

### 6.3 Screen Catalog

**57 screens total** — 25 public, 32 protected.

| Group              | Screens | Public | Protected |
| ------------------ | :-----: | :----: | :-------: |
| Customer Website   | 27      | 17     | 10        |
| Seller Join Portal | 6       | 6      | 0         |
| Seller Panel       | 10      | 1      | 9         |
| Super Admin Panel  | 14      | 1      | 13        |

#### Customer Website (C-series)

| ID   | Screen                                              | Type            | Access                       |
| ---- | --------------------------------------------------- | --------------- | ---------------------------- |
| C01  | Homepage                                            | Page            | Public                       |
| C01A | General Storefront (Top Rated Products & Stores)    | Page            | Public                       |
| C02  | Mega-menu (all categories)                          | Overlay         | Public                       |
| C03  | Search overlay (command-palette style)              | Overlay         | Public                       |
| C04  | Mini-cart drawer                                    | Drawer          | Public                       |
| C05  | Login                                               | Page            | Guest only                   |
| C06  | Sign up                                             | Page            | Guest only                   |
| C07  | "Login required to checkout"                        | Modal           | Guest only                   |
| C08  | Product listing / Search results                    | Page            | Public                       |
| C09  | Categories                                          | Page            | Public                       |
| C10  | Shops (all active shops)                            | Page            | Public                       |
| C11  | Individual Storefront: Home tab                     | Page            | Public                       |
| C11A | Individual Storefront: All Products tab             | Sub-page (tab)  | Public                       |
| C11B | Individual Storefront: Reviews tab                  | Sub-page (tab)  | Public                       |
| C11C | Individual Storefront: About tab                    | Sub-page (tab)  | Public                       |
| C12  | Product detail                                      | Page            | Public                       |
| C13  | Cart (grouped by seller)                            | Page            | Public view; checkout needs login |
| C14  | Checkout: Online payment                            | Page            | CUSTOMER                     |
| C15  | Checkout: Cash on Delivery                          | Page (variant)  | CUSTOMER                     |
| C16  | Checkout success                                    | Page            | CUSTOMER                     |
| C17  | My Orders                                           | Page (account)  | CUSTOMER                     |
| C18  | Checkout / Order detail                             | Sub-page        | CUSTOMER                     |
| C19  | Profile                                             | Page (account)  | CUSTOMER                     |
| C20  | Saved addresses                                     | Page (account)  | CUSTOMER                     |
| C21  | Wishlist                                            | Page (account)  | CUSTOMER                     |
| C22  | Notifications                                       | Page (account)  | CUSTOMER                     |
| C23  | Write a review                                      | Modal           | CUSTOMER                     |

#### Seller Join Portal (P-series)

| ID  | Screen                                         | Type        |
| --- | ---------------------------------------------- | ----------- |
| P01 | Landing page                                   | Page        |
| P02 | Registration, Step 1: Business information     | Page (step) |
| P03 | Registration, Step 2: Shop information         | Page (step) |
| P04 | Registration, Step 3: Account                  | Page (step) |
| P05 | Application submitted                          | Page        |
| P06 | Application status (lookup + tracker)          | Page        |

#### Seller Panel (S-series)

| ID  | Screen                                   | Type            | Access          |
| --- | ---------------------------------------- | --------------- | --------------- |
| S01 | Seller login                             | Page            | Public          |
| S02 | Dashboard                                | Page            | SELLER          |
| S03 | My Shop                                  | Page            | SELLER          |
| S04 | Products list                            | Page            | SELLER          |
| S05 | Add / Edit product                       | Sub-page (form) | SELLER          |
| S06 | Categories                               | Page            | SELLER          |
| S07 | Orders list                              | Page            | SELLER          |
| S08 | Order detail (with status update)        | Sub-page        | SELLER          |
| S09 | Revenue (incl. platform fee settlement)  | Page            | SELLER          |
| S10 | Settings                                 | Page            | SELLER          |

#### Super Admin Panel (A-series)

| ID  | Screen                          | Type      | Access      |
| --- | ------------------------------- | --------- | ----------- |
| A01 | Admin login                     | Page      | Public      |
| A02 | Dashboard                       | Page      | SUPER_ADMIN |
| A03 | Sellers list                    | Page      | SUPER_ADMIN |
| A04 | Seller detail                   | Sub-page  | SUPER_ADMIN |
| A05 | Disable seller confirmation     | Dialog    | SUPER_ADMIN |
| A06 | Shops list                      | Page      | SUPER_ADMIN |
| A07 | Products list (no Edit)         | Page      | SUPER_ADMIN |
| A08 | Product view (read-only)        | Sub-page  | SUPER_ADMIN |
| A09 | Categories                      | Page      | SUPER_ADMIN |
| A10 | Orders (Checkouts view)         | Page      | SUPER_ADMIN |
| A11 | Checkout detail (read-only)     | Sub-page  | SUPER_ADMIN |
| A12 | Platform revenue                | Page      | SUPER_ADMIN |
| A13 | Platform settings               | Page      | SUPER_ADMIN |
| A14 | Audit logs                      | Page      | SUPER_ADMIN |

### 6.4 Frontend feature details

**Customer discovery**
- Home: promotional banners, categories, popular shops, best/recommended products, new arrivals, deals
- Search by product name, brand, category, shop
- Filters: category, price, seller/shop, rating, availability
- Sorting: price low→high, price high→low, newest, popular, rating
- Shop listing: logo, name, rating, product count; shop detail: info, categories, products, in-shop search, delivery info, status

**Checkout steps**

| Step | Contents                                                       |
| ---- | -------------------------------------------------------------- |
| 1    | Product, quantity, price                                       |
| 2    | Delivery address: name, phone, address, city, postal code      |
| 3    | Delivery option and delivery fee                               |
| 4    | Payment: Cash on Delivery; Online Payment (placeholder)        |
| 5    | Order summary: subtotal, delivery fee, total → order ID        |

**Seller registration fields**

| Business info          | Shop info                                  | Account info                |
| ---------------------- | ------------------------------------------ | --------------------------- |
| Seller name            | Shop name, description, logo               | Email                       |
| Business name          | Shop category                              | Password                    |
| Email, phone           | Delivery information                       | Confirm password            |
| CNIC / business ID     |                                            |                             |
| Address, city          |                                            |                             |

**Seller order list columns:** Order ID, Customer, Product, Quantity, Amount, Platform fee, Seller earning, Date, Status.

**Super Admin order filters:** Order ID, Customer, Seller, Shop, Product, Status, Date.

**Super Admin dashboard KPIs:** Total / Active / Disabled Sellers, Total Shops, Total / Active Products, Total / Completed Orders, Platform Revenue, GMV.
**Charts:** Orders over time, Revenue over time, Seller performance, Product performance, Order status distribution.

**Notifications (simulated in prototype)**

| Customer          | Seller              | Super Admin              |
| ----------------- | ------------------- | ------------------------ |
| Order placed      | Seller approved     | New seller application   |
| Order confirmed   | New order           | New order                |
| Order shipped     | Order cancelled     | Seller activity          |
| Order delivered   | Product disabled    |                          |
| Order cancelled   |                     |                          |

---

## 7. Backend

**Marto Marketplace API** — multi-vendor e-commerce backend REST API built with NestJS, PostgreSQL and TypeORM. The backend focuses purely on the REST API.

### 7.1 Core stack

| Technology                              | Purpose              |
| --------------------------------------- | -------------------- |
| **NestJS**                              | Framework            |
| **TypeScript**                          | Language             |
| **PostgreSQL**                          | Database             |
| **TypeORM**                             | ORM                  |
| **JWT**                                 | Authentication       |
| **HTTP-only Cookies**                   | Secure token storage |
| **bcrypt**                              | Password hashing     |
| **class-validator / class-transformer** | Validation           |
| **Swagger / OpenAPI**                   | API documentation    |
| **cookie-parser**                       | Cookie handling      |

### 7.2 Project structure

```
src/
├── common/
│   ├── constants/  decorators/  dto/  enums/  exceptions/  filters/
│   ├── guards/  interceptors/  interfaces/  pagination/  pipes/  utils/
├── config/
├── database/
│   ├── migrations/
│   └── seeds/
├── modules/
│   ├── auth/  users/  sellers/  shops/  categories/  products/
│   ├── addresses/  cart/  checkout/  orders/  payments/
│   ├── platform-fees/  reviews/  platform-settings/  audit/  admin/
├── app.module.ts
└── main.ts
```

### 7.3 Modules

| Module                | Responsibility                           |
| --------------------- | ---------------------------------------- |
| **Auth**              | Registration, login, JWT authentication  |
| **Users**             | Customer account management              |
| **Sellers**           | Seller onboarding and management         |
| **Shops**             | Seller shop management                   |
| **Categories**        | Product category management              |
| **Products**          | Product listing and management           |
| **Addresses**         | Customer delivery addresses              |
| **Cart**              | Single-seller shopping cart              |
| **Checkout**          | Checkout validation and order initiation |
| **Orders**            | Order creation and lifecycle management  |
| **Payments**          | Payment records and payment status       |
| **Platform Fees**     | Marketplace transaction fees             |
| **Reviews**           | Product/shop reviews and ratings         |
| **Platform Settings** | Configurable marketplace settings        |
| **Audit**             | Audit trail and activity records         |
| **Admin**             | Super Admin governance APIs              |

### 7.4 Frontend ↔ Backend mapping

| Frontend area                    | Backend modules                                       |
| -------------------------------- | ----------------------------------------------------- |
| Customer: Home / Search / Shops  | Products, Categories, Shops                           |
| Customer: Cart / Checkout        | Cart, Checkout, Addresses, Payments, Orders           |
| Customer: Orders / Profile       | Orders, Users, Addresses                              |
| Customer: Reviews                | Reviews                                               |
| Seller Join Portal               | Auth, Sellers, Shops                                  |
| Seller Panel                     | Shops, Products, Categories, Orders, Platform Fees    |
| Super Admin Panel                | Admin, Sellers, Shops, Products, Categories, Orders, Platform Settings, Platform Fees, Audit |

### 7.5 API design principles

- RESTful resource design with consistent HTTP status codes
- DTO-based validation and clear error responses
- Pagination for large collections; filtering and search where applicable
- Role-based authorization at controller **and** service level
- Business logic in the service layer
- Database transactions for critical operations (checkout, order creation, stock updates)
- Structured logging and Swagger documentation

### 7.6 Validation

Global `ValidationPipe`:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`
- `enableImplicitConversion: true`

### 7.7 CORS

Local development origins:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

Credentials are enabled for cookie-based auth. **Production origins must come from environment variables**, not hard-coded values.

### 7.8 Performance & scalability

High-concurrency scenarios (e.g. flash sales) require inventory operations that **prevent overselling**.

| Phase                                  | Focus                                                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1 — Core MVP**                 | Authentication, RBAC, Sellers, Shops, Categories, Products, Cart, Checkout, Orders, Payments, Platform fees, Reviews, Admin governance, Audit logging |
| **Phase 2 — Optimization**             | Database indexing, query optimization, pagination, API response optimization, image optimization, caching                                             |
| **Phase 3 — Distributed Architecture** | Redis, background jobs, queue management, microservices, Kafka, event-driven architecture                                                             |
| **Phase 4 — High Scale**               | Horizontal scaling, load balancing, advanced caching, DB optimization, read replicas, distributed tracing, advanced monitoring                        |

---

## 8. Data Model

**Core entities:** User, Seller, Shop, Product, Category, Order, OrderItem, Address, Review, PlatformSettings.

```
Seller
└── Shop
    ├── Products
    ├── Categories
    └── Orders

User
├── Addresses
└── Orders

Order ── User, Seller, Shop, OrderItems
Product ── Seller, Shop, Category
```

### Order + OrderItem (recommended structure)

Even though one seller per order is enforced today, orders use an Order + OrderItem structure to keep multi-seller checkout possible later.

| Order            | OrderItem   |
| ---------------- | ----------- |
| id               | id          |
| userId           | orderId     |
| sellerId         | productId   |
| shopId           | quantity    |
| subtotal         | unitPrice   |
| deliveryFee      | subtotal    |
| platformFee      |             |
| total            |             |
| paymentStatus    |             |
| orderStatus      |             |
| createdAt        |             |

Also store `sellerEarning`, `paymentMethod` and `updatedAt` on the order (required by the BRD's order structure).

### Product attributes

Product ID, Seller ID, Shop ID, Category ID, name, description, SKU, price, discount, final price, images, stock, brand, tags, weight, prepaid flag, status, created/updated date.

### Platform settings

| Setting                | Default   |
| ---------------------- | --------- |
| Currency               | PKR       |
| Transaction fee        | PKR 10    |
| Seller approval        | Required  |
| Multi-seller checkout  | Disabled  |

Also configurable: platform name, default order settings and other marketplace settings.

### Historical records

Sellers, shops, products and categories are **soft-removed** (status-based), never physically deleted, so orders and financial records stay intact for reporting and auditing.

---

## 9. Authentication & Security

Authentication uses **JWT with HTTP-only cookies**.

- Access token stored in an HTTP-only cookie, sent automatically with requests
- Protected APIs require a valid auth cookie
- Cookie config: `HttpOnly`, `Secure` (production), `SameSite`, and expiry
- Refresh token rotation is planned (env vars for refresh secret/expiry already exist)
- Authentication is mandatory before checkout and order placement

**Security requirements**

- JWT authentication, bcrypt password hashing
- Role-based access control (RBAC) + authorization checks at service/API level
- DTO validation and request sanitization
- Rate limiting
- Secure error handling (no stack traces/internal details to clients)
- Secure file uploads
- Audit logging
- Environment-based secrets, database constraints

---

## 10. Getting Started

### Backend

```bash
cd backend
npm install
```

Create `.env` in the backend root:

```env
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=database
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
```

> **Never** commit real secrets or passwords to Git.

| Mode                       | Command               |
| -------------------------- | --------------------- |
| Development                | `npm run start:dev`   |
| Development with debugging | `npm run start:debug` |
| Production build           | `npm run build`       |
| Production                 | `npm run start:prod`  |

| Test type  | Command              |
| ---------- | -------------------- |
| Unit       | `npm run test`       |
| Watch      | `npm run test:watch` |
| Coverage   | `npm run test:cov`   |
| End-to-end | `npm run test:e2e`   |

**API docs** (after `npm run start:dev`):

| Resource     | URL                            |
| ------------ | ------------------------------ |
| Swagger UI   | http://localhost:3000/api      |
| Swagger JSON | http://localhost:3000/api-json |

**Database:** schema changes go through TypeORM migrations (`src/database/migrations`); seed data lives in `src/database/seeds`.

### Frontend

> Commands below assume a Vite + React setup (dev server on `5173`, which is already in the CORS allow-list). Update to match your final setup.

```bash
cd frontend/customer-web   # or seller-portal / seller-panel / admin-panel
npm install
npm run dev
```

Suggested frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

> The backend dev server defaults to port `3000`, which is also a listed CORS origin. When running the API and a frontend together locally, run the frontend on a different port (`3001` or `5173`).

---

## 11. Demo Accounts

> For **prototype / testing only**. Never use these credentials in production.

| Role        | Email              | Password    |
| ----------- | ------------------ | ----------- |
| Super Admin | `admin@demo.com`   | `admin123`  |
| Seller      | `seller1@demo.com` | `seller123` |
| Customer    | `user@demo.com`    | `user123`   |

---

## 12. Logging & Auditing

Every controller/API endpoint should provide structured logging (NestJS Logger or a dedicated provider) covering:

- Request activity and errors
- Authentication and security events
- Seller actions and Admin actions
- Order lifecycle events and payment events
- Important business operations

Audit records preserve key marketplace activity for troubleshooting and governance; the Super Admin reviews them in the **Audit logs** screen (A14).

---

## 13. MVP Scope & Roadmap

### MVP (production-ready)

| Customer               | Seller                  | Super Admin                 |
| ---------------------- | ----------------------- | --------------------------- |
| Home                   | Registration            | Dashboard                   |
| Categories             | Login                   | Seller management           |
| Shops                  | Shop management         | Shop management             |
| Product listing        | Product CRUD            | Product management          |
| Product details        | Category CRUD           | Category management         |
| Search                 | Order management        | Order management            |
| Single-seller checkout | Revenue dashboard       | Revenue                     |
| Order placement        |                         | Platform fee configuration  |
| Order tracking         |                         |                             |
| Profile & addresses    |                         |                             |

### Future scope

Multi-seller cart · online payment gateways · delivery/logistics integrations · seller payouts · automated commission settlement · coupons & promotions · flash sales · wishlist · reviews & ratings · product variants · inventory alerts · seller analytics · loyalty · push/email/SMS/WhatsApp notifications · seller subscription plans · multiple commission models · refunds & returns · dispute management · tax management · advanced reporting · warehouse management · location-based seller discovery.

Scalability targets: multiple sellers per order, multiple warehouses, multiple delivery providers.

---

## 14. Open Points / Clarifications

These are places where the source documents (BRD, backend README, Stitch screen list) don't fully line up. Worth settling before implementation:

| # | Topic | Detail |
| - | ----- | ------ |
| 1 | **Cart grouped by seller (C13)** | The Stitch cart groups items by seller, but BR-08 allows only one seller per order. Decide the UX: block adding items from a second seller, or let the cart hold several sellers and require checkout one seller at a time. The backend README describes a *single-seller cart*. |
| 2 | **Wishlist (C21) and Reviews (C11B, C23)** | The BRD lists Wishlist and Reviews as *future scope*, but the Stitch screens include them and the backend has a Reviews module in Phase 1. Confirm whether they are in the MVP. |
| 3 | **Online payment (C14)** | The BRD says Online Payment is a *placeholder* (only COD is functional). The Stitch screens include a full online-payment checkout. Confirm the intended behavior. |
| 4 | **Platform fee timing** | The BRD flow applies the fee when an order is **Delivered** ("completed transactions × fee"). Make sure the backend only counts fees for delivered orders, and decide what happens to cancelled orders. |
| 5 | **Stock reservation** | Overselling must be prevented. Decide whether stock is reserved at order placement or at confirmation. |
| 6 | **Panel structure** | One role-based Admin Panel (BRD) vs separate Seller Panel and Super Admin Panel (Stitch). |

---

## 15. Development Guidelines

Before creating a new endpoint:

1. Define the business rule
2. Define the DTO
3. Define authorization requirements
4. Implement service-layer logic
5. Add controller endpoint
6. Add validation
7. Add Swagger decorators
8. Add structured logging
9. Handle expected errors
10. Add tests where applicable

Frontend screens should follow the Stitch screen IDs (e.g. `C12`, `S05`, `A07`) in file/route naming so design, code and QA stay traceable to each other.

---

## 16. License

This project is developed as part of the **Marto Marketplace** engineering and architecture project.