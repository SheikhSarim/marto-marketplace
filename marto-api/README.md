# Marto Marketplace API

**Multi-vendor e-commerce marketplace backend REST API** built with NestJS, PostgreSQL and TypeORM.

|                  |                                     |
| ---------------- | ----------------------------------- |
| **Project**      | Marto Marketplace                   |
| **Brand**        | Marto                               |
| **Website**      | *marto-online.com*                  |
| **Type**         | Multi-vendor E-commerce Marketplace |
| **Status**       | Core MVP Development                |
| **Version**      | 1.0.0                               |
| **Architecture** | Modular Monolith                    |
| **Environment**  | Development                         |

---

## Overview

Marto Marketplace is a scalable multi-vendor e-commerce backend platform.

The API allows independent sellers to register and manage shops, categories and products, while customers can browse products, manage their cart, place orders and submit reviews.

The platform also provides **Super Admin** capabilities for seller approval, marketplace governance, platform fee configuration, revenue tracking and audit management.

> This project focuses on **backend REST API** development.

---

## Core Stack

| Technology                              | Purpose              |
| --------------------------------------- | -------------------- |
| **NestJS 12**                           | Framework            |
| **TypeScript**                          | Language             |
| **PostgreSQL**                          | Database             |
| **TypeORM**                             | ORM                  |
| **JWT**                                 | Authentication       |
| **HTTP-only Cookies**                   | Secure Token Storage |
| **bcrypt**                              | Password hashing     |
| **class-validator / class-transformer** | Validation           |
| **Swagger / OpenAPI**                   | API Documentation    |
| **cookie-parser**                       | Cookies              |

**Future plans**

- Frontend: ReactJS + Tailwind CSS
- Authentication: Refresh Token Rotation
- Scaling: Redis, Queues, Kafka, Microservices

---

## User Roles

### Customer

- Register and login
- Browse shops, categories and products
- Search and filter products
- Add products to cart
- Manage addresses
- Checkout and place orders
- View order history and track order status
- Submit ratings and reviews

> Authentication is mandatory before checkout and order placement.

### Seller

- Register through seller onboarding
- Login and manage seller profile
- Manage shop information
- Manage categories and products
- View shop-specific orders
- Update order processing status
- Track gross sales, platform fees and net revenue

> A seller must be **approved by Super Admin** before selling products.  
> Each seller must own **at least one shop**.

### Super Admin

- Manage and approve sellers
- Enable / disable sellers, shops, products and categories
- Manage platform settings and configure transaction fees
- View marketplace orders
- Track platform revenue and GMV
- Review audit records

> Super Admin **cannot** directly edit seller-owned product information.

---

## Core Business Rules

### Single Seller Per Order

Each order can contain products from **only one seller**.

This rule keeps the MVP checkout and order processing simple and allows future implementation of multi-seller order splitting.

### Platform Fee

- Default platform transaction fee: **PKR 10**
- Charged per completed transaction/order
- Configurable by Super Admin

### Seller Approval Lifecycle

```
Pending → Approved → Active Selling
```

### Disabled Entities

Disabled sellers, shops, products and categories must be **immediately hidden** from customer-facing APIs.

### Historical Records

Removing or disabling sellers/products must **not** physically destroy historical order or financial records.  
Historical transactions must remain available for reporting and auditing.

### Order Lifecycle

```
Pending → Confirmed → Processing → Shipped → Delivered
```

Cancellation may occur according to the applicable business rules.

---

## Authentication

Authentication uses **JWT-based authentication with HTTP-only cookies**.

- Access tokens are stored in **HTTP-only cookies**
- Authentication cookies are sent automatically with authenticated requests
- Protected APIs require a valid authentication cookie
- Cookies should be configured with appropriate `HttpOnly`, `Secure`, `SameSite`, and expiration settings
---

## API Documentation

After starting the development server:

```bash
npm run start:dev
```

| Resource     | URL                            |
| ------------ | ------------------------------ |
| Swagger UI   | http://localhost:3000/api      |
| Swagger JSON | http://localhost:3000/api-json |

---

## Validation

Global request validation is enabled using NestJS `ValidationPipe`.

**Current configuration:**

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`
- `enableImplicitConversion: true`

DTOs should use `class-validator` decorators for request validation.

---

## CORS

The backend currently supports local frontend development origins:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

Credentials are enabled to support cookie-based authentication where required.

> Production origins should be configured through environment variables instead of hard-coded development origins.

---

## Project Structure

```
src/
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── interfaces/
│   ├── pagination/
│   ├── pipes/
│   └── utils/
│
├── config/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── sellers/
│   ├── shops/
│   ├── categories/
│   ├── products/
│   ├── addresses/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   ├── platform-fees/
│   ├── reviews/
│   ├── platform-settings/
│   ├── audit/
│   └── admin/
│
├── app.module.ts
└── main.ts
```

---

## Modules

| Module                | Responsibility                           |
| --------------------- | ---------------------------------------- |
| **Auth**              | Registration, login, JWT authentication  |
| **Users**             | Customer account management              |
| **Sellers**           | Seller onboarding and seller management  |
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

---

## Installation

Clone the project and install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root.

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

---

## Running the Application

| Mode                       | Command               |
| -------------------------- | --------------------- |
| Development                | `npm run start:dev`   |
| Development with debugging | `npm run start:debug` |
| Production build           | `npm run build`       |
| Production                 | `npm run start:prod`  |

---

## Testing

| Type       | Command              |
| ---------- | -------------------- |
| Unit tests | `npm run test`       |
| Watch mode | `npm run test:watch` |
| Coverage   | `npm run test:cov`   |
| End-to-end | `npm run test:e2e`   |

---

## Database

- **PostgreSQL** + **TypeORM**
- Schema changes should be handled through TypeORM migrations

| Resource   | Path                      |
| ---------- | ------------------------- |
| Migrations | `src/database/migrations` |
| Seed data  | `src/database/seeds`      |

---

## Logging & Auditing

Every controller/API endpoint should provide structured logging.

The project should use NestJS Logger (or a dedicated logging provider) to track:

- Request activity
- Errors
- Important business operations
- Authentication events
- Seller actions
- Admin actions
- Order lifecycle events
- Payment events
- Security-related events

Audit logging should preserve important marketplace activities for production troubleshooting and governance.

---

## Security Requirements

The backend should implement:

- JWT authentication
- Password hashing
- Role-based access control (RBAC)
- DTO validation
- Request sanitization
- Rate limiting
- Secure error handling
- Audit logging
- Secure cookie configuration (where cookies are used)
- Environment-based secrets
- Database constraints
- Authorization checks at service/API level

---

## Performance & Scalability

The MVP is designed with future scalability in mind.

**Potential future improvements:**

```
Redis → Caching → Queue Management → Microservices → Kafka → Horizontal Scaling
```

High-concurrency scenarios (e.g. flash sales) require inventory operations designed to **prevent overselling**.

### Future Scaling Roadmap

| Phase                                  | Focus                                                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1 — Core MVP**                 | Authentication, RBAC, Sellers, Shops, Categories, Products, Cart, Checkout, Orders, Payments, Platform fees, Reviews, Admin governance, Audit logging |
| **Phase 2 — Optimization**             | Database indexing, Query optimization, Pagination, API response optimization, Image optimization, Caching                                             |
| **Phase 3 — Distributed Architecture** | Redis, Background jobs, Queue management, Microservices, Kafka, Event-driven architecture                                                             |
| **Phase 4 — High Scale**               | Horizontal scaling, Load balancing, Advanced caching, Database optimization, Read replicas, Distributed tracing, Advanced monitoring                  |

---

## Currency

| Setting              | Value      |
| -------------------- | ---------- |
| Marketplace currency | **PKR**    |
| Default platform fee | **PKR 10** |

---

## API Design Principles

- RESTful resource design
- Consistent HTTP status codes
- DTO-based validation
- Clear error responses
- Pagination for large collections
- Filtering and search where applicable
- Role-based authorization
- Service-layer business logic
- Database transactions for critical operations
- Structured logging
- Swagger documentation

---

## Development Guidelines

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

---

## Demo Accounts

> For **prototype / testing** purposes only.  
> These credentials must **never** be used in production.

| Role        | Email              | Password    |
| ----------- | ------------------ | ----------- |
| Super Admin | `admin@demo.com`   | `admin123`  |
| Seller      | `seller1@demo.com` | `seller123` |
| Customer    | `user@demo.com`    | `user123`   |

---

## Project Status

**Status:** Approved for Core MVP Development  
**Version:** 1.0.0

The initial objective is to deliver a robust, secure and scalable multi-vendor marketplace REST API that can later serve as the foundation for a distributed / high-scale e-commerce architecture.

---

## License

This project is developed as part of the **Marto Marketplace** backend engineering and architecture project.
