# Marto Marketplace Frontend

**Multi-vendor e-commerce marketplace frontend** built with Next.js App Router.

|                  |                                     |
| ---------------- | ----------------------------------- |
| **Project**      | Marto Marketplace                   |
| **Brand**        | Marto                               |
| **Website**      | *marto-online.com*                  |
| **Type**         | Multi-vendor E-commerce Marketplace |
| **Status**       | Core MVP Development                |
| **Version**      | 1.0.0                               |
| **Architecture** | Unified Next.js App (role-based)    |
| **Environment**  | Development                         |

---

## Overview

This is the official frontend for **Marto Marketplace** — a multi-vendor e-commerce platform.

A single Next.js application serves four interfaces through role-based routing:

- **Customer Website** (storefront)
- **Seller Join Portal** (public onboarding)
- **Seller Panel** (seller dashboard)
- **Super Admin Panel** (marketplace governance)

The frontend consumes the NestJS backend REST API using cookie-based JWT authentication.

> This project focuses on building a complete marketplace application **Marto Marketplace**, integrating the frontend interface with backend APIs to deliver a seamless user experience.

---

## Core Stack

| Technology                | Purpose                          |
| ------------------------- | -------------------------------- |
| **Next.js 15 (App Router)** | Framework                      |
| **TypeScript**            | Language                         |
| **Tailwind CSS**          | Styling                          |
| **React Query / TanStack**| Server state & caching           |
| **Zustand**               | Client state (auth, cart, etc.)  |
| **React Hook Form + Zod** | Forms & validation               |
| **shadcn/ui**             | UI component primitives          |
| **Lucide React**          | Icons                            |
| **next/image**            | Optimized images                 |


## Interfaces

| Interface              | Path Prefix     | Audience              | Purpose                                      |
| ---------------------- | --------------- | --------------------- | -------------------------------------------- |
| **Customer Website**   | `/`             | Customers             | Browse, search, cart, checkout, account      |
| **Seller Join Portal** | `/sell`         | Prospective sellers   | Landing + multi-step registration            |
| **Seller Panel**       | `/seller`       | Approved sellers      | Dashboard, products, orders, revenue         |
| **Super Admin Panel**  | `/admin`        | Super Admin           | Seller approval, platform settings, audit    |



## Project Structure

```
marto-ui/
├── app/                          # Next.js App Router
│   ├── (public routes)
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   ├── categories/
│   │   ├── shops/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── search/
│   │   └── ...
│   ├── account/                  # Customer account area
│   ├── sell/                     # Seller Join Portal
│   ├── seller/                   # Seller Panel
│   ├── admin/                    # Super Admin Panel
│   ├── customer/                 # Customer Auth pages (login/register)
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
│
├── components/
│   ├── storefront/               # Customer-facing components
│   ├── seller/                   # Seller panel components
│   ├── admin/                    # Admin panel components
│   ├── dashboard/                # Shared dashboard layout
│   ├── auth/                     # Auth guards & shells
│   ├── shared/                   # Shared UI pieces
│   └── ui/                       # Base UI primitives
│
├── hooks/
│   └── queries/                  # React Query hooks
│
├── lib/
│   ├── api/                      # API client & endpoints
│   ├── stores/                   # Zustand stores
│   ├── schemas/                  # Zod schemas
│   └── utils.ts
│
├── services/                     # API service layer
├── types/
└── public/
```

---

## Key Features

### Customer Website
- Homepage with featured products & shops
- Product listing, search, filters & sorting
- Category & shop browsing
- Individual shop pages
- Product detail pages
- Cart (single-seller enforcement)
- Checkout (COD + Online payment placeholder)
- Order history & tracking
- Profile & address management
- Auth flows (login, register, forgot/reset password)

### Seller Join Portal
- Landing page
- Multi-step seller registration
- Application status tracking

### Seller Panel
- Dashboard with revenue metrics
- Shop management
- Product CRUD
- Category management
- Order management + status updates
- Revenue & platform fee view
- Seller settings

### Super Admin Panel
- Dashboard (GMV, revenue, KPIs)
- Seller approval & management
- Shop / Product / Category oversight
- Order monitoring
- Platform settings (including fee configuration)
- Audit logs

---

## Authentication

- JWT stored in **HTTP-only cookies**
- All authenticated requests use `credentials: 'include'`
- Role-based route protection (`CUSTOMER`, `SELLER`, `SUPER_ADMIN`)
- Auth state managed via Zustand + React Query
- Protected routes redirect unauthenticated users

---

## API Integration

The frontend communicates with the NestJS backend via a centralized API client.

```ts
// Example
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

- All requests include credentials for cookie-based auth
- Error handling is centralized
- React Query is used for data fetching, caching, and mutations

---

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=YOUR_BACKEND_API_SERVER_URL

```

### 3. Run the development server

```bash
npm run dev
```

The app will be available at:  
**http://localhost:3000**

> Make sure the backend is running and CORS allows the frontend origin.

---

## Available Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start development server       |
| `npm run build`   | Create production build        |
| `npm run start`   | Start production server        |
| `npm run lint`    | Run ESLint                     |

---

## Design System

- Built on **shadcn/ui** + Tailwind CSS
- Consistent spacing, typography and color tokens
- Shared components: `Button`, `Input`, `DataTable`, `StatusBadge`, `EmptyState`, `ErrorState`, etc.
- Responsive (mobile-first) design
- Currency always displayed in **PKR**

---

## Development Guidelines

1. Prefer Server Components where possible
2. Use React Query for all server state
3. Keep business logic in services / hooks
4. Follow existing folder structure and naming
5. Use Zod schemas for form validation
6. Protect routes with role guards
7. Always handle Loading / Empty / Error states

---

## Demo Accounts

> For **development / testing only**. Never use in production.

| Role        | Email              | Password    |
| ----------- | ------------------ | ----------- |
| Super Admin | `admin@demo.com`   | `admin123`  |
| Seller      | `seller1@demo.com` | `seller123` |
| Customer    | `user@demo.com`    | `user123`   |

---

## Project Status

**Status:** Core MVP Development  
**Version:** 1.0.0

This frontend is designed to work seamlessly with the **Marto Marketplace** _NestJS backend_ and follows the business rules defined in the overall project documentation.

---

## License

This project is an academic initiative focused on the design and development of the **Marto Marketplace**.
