# Your_Place

Website allowing users to host rooms and events and connect with people created by databaes.

## Problem

People seeking opportunities and a medium to share spaces and experiences with others who have similar interests.

## Solution

Creating Your Place, a website that allows users to host rooms and events and connect with people.

## MVP Features

- User registration and login (Authentication)
- CRUD Operations for tasks (Create, Read, Update, Delete)
- Hosts can share space locations and events
- Users can book in to spaces and events

## Database Setup (PostgreSQL)

This project uses PostgreSQL with separate **development** and **test** databases.

---

### Prerequisites
- PostgreSQL installed + running
- `psql` available in your terminal
- Node.js installed

---

### 1) Create databases

    createdb your_place_dev
    createdb your_place_test

---

### 2) Create env files

    cp .env.example .env
    cp .env.example .env.test

Now edit both files and replace `<username>` / `<password>`.

**.env**
    PORT=3000
    NODE_ENV=development
    DATABASE_URL=postgres://<username>:<password>@localhost:5432/your_place_dev
    JWT_SECRET=replace_me_with_a_random_string
    JWT_EXPIRES_IN=1d

**.env.test**
    NODE_ENV=test
    DATABASE_URL_TEST=postgres://<username>:<password>@localhost:5432/your_place_test
    JWT_SECRET=replace_me_with_a_random_string
    JWT_EXPIRES_IN=1d

---

### 3) Reset + run migrations (DEV)

    psql "$DATABASE_URL" -f db/reset.sql
    psql "$DATABASE_URL" -f db/migrations/000_create_users.sql
    psql "$DATABASE_URL" -f db/migrations/001_create_spaces.sql
    psql "$DATABASE_URL" -f db/migrations/002_create_events.sql
    psql "$DATABASE_URL" -f db/migrations/003_create_bookings.sql

---

### 4) Reset + run migrations (TEST)

    psql "$DATABASE_URL_TEST" -f db/reset.sql
    psql "$DATABASE_URL_TEST" -f db/migrations/000_create_users.sql
    psql "$DATABASE_URL_TEST" -f db/migrations/001_create_spaces.sql
    psql "$DATABASE_URL_TEST" -f db/migrations/002_create_events.sql
    psql "$DATABASE_URL_TEST" -f db/migrations/003_create_bookings.sql

---

### 5) Install deps

    npm install

---

### 6) Run server

    npm run dev

---

### 7) Run tests

    npm test

---

### Notes
- Do NOT commit `.env` or `.env.test` (they are gitignored)
- Migrations must be run in order (000 → 003)

---

## Runtime / Hardware

- **Node.js** 20+
- **PostgreSQL** 15+
- Works on Windows, macOS, and Linux
- Minimum 4GB RAM recommended for local development

---

## Key Dependencies and Why

| Package | Purpose |
|--------|---------|
| **express** | HTTP server and routing |
| **pg** | PostgreSQL driver for Node.js |
| **zod** | Request validation and schema parsing |
| **jsonwebtoken** | JWT creation and verification for auth |
| **bcryptjs** | Password hashing |
| **helmet** | Security headers |
| **cors** | Cross-origin resource sharing |

---

## Alternatives Considered

- **Validation:** Joi / Yup vs **Zod** — Chose Zod for TypeScript-friendly schemas and concise parsing.
- **DB access:** Prisma / Knex vs **raw pg** — Chose raw `pg` for learning and explicit SQL control.
- **Auth:** Session cookies vs **JWT** — Chose JWT for a stateless API style and simpler scaling.

---

## Licensing

Major dependencies use permissive licenses:

- **express**, **pg**, **zod**, **jsonwebtoken**, **bcryptjs**, **helmet**, **cors**: MIT  
- **dotenv**: BSD-2-Clause  

See each package’s `license` field in `node_modules` or [npm](https://www.npmjs.com/) for details.

---

## Security Model

### Authentication
- **JWT-based authentication** using `Authorization: Bearer <token>` headers
- Tokens are signed with `JWT_SECRET` and include user `id` and `role`
- All protected endpoints require valid JWT tokens (401 if missing/invalid)

### Authorization Rules

**Spaces & Events:**
- Create/Update/Delete: Requires `host` role
- Read: Public (no auth required)

**Bookings:**
- **Create:** Any authenticated user can create bookings for themselves (uses `req.user.id`)
- **Read:** 
  - Users can view their own bookings (`scope=mine` or default)
  - Hosts can view bookings for their hosted events/spaces (`scope=host`)
- **Update:**
  - Users can update their own bookings (all fields)
  - Hosts can only update `paymentStatus` for bookings on their events/spaces
- **Delete:** Users can delete their own bookings; hosts can delete bookings on their events/spaces

All authorization checks are enforced at the service layer with structured `ApiError` responses.

---

## Style Guide

- **Prettier** + **ESLint** (Airbnb base)
- Code uses **single quotes**, **no semicolons**, and **trailing commas** (ES5)
- Run `npm run lint` (if configured) and format with Prettier before committing

---

# CONTRIBUTORS

- [Cat Brandt](https://github.com/catbrandt)
