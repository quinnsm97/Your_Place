# Your_Place - Backend API

![Your Place Logo](./assets/your_place_logo.png)

---

Your Place is a backend API (front-end integration and website deployment coming soon!) that supports a platform where hosts can offer spaces and events, allowing users to book those spaces and experiences. The system is designed with two primary user roles - hosts and users - each with distinct capabilities, enforced via authentication and authorisation rules.

Hosts can create, update, and delete listings for spaces and events, providing data such as location, capacity, category, pricing and schedule. Categories including 'Create', 'Move', 'Celebrate', 'Learn' and 'Relax' enable organised filtering of current offerings, allowing users to easily discover spaces and events that align with their personal interests.

Users can browse and filter for spaces and events publically, but will require authentication in order to make, update or cancel a booking. The system enforces role-based access control so that users can only manager their own bookings, while hosts can manage bookings related to their listed spaces and/or events. All interactions with the API are  secured through JWT based authentication, ensuring that only authorised actions are permitted.

The platform is inspired by services such as Airbnb, where hosts offer spaces for users to book. However, Your Place extends this concept to include both physical spaces and hosted events, supporting a broad range of offerings such as workshops, study groups, wellness sessions and community activities.

## Problem & Solution

There is a need for a platform that enables users to connect through shared spaces and experiences. Some people want t ohost spcaes or events to engage with others who share similar interests, or as an income stream, whist others want to book spaces for individual use, group activities, or personal expereinces.

Current platforms or communities often do not provide a unified API driven backend that supports flexible hosting, event/space management, and secure booking. You Place addresses ths by offering an API that manages users, hosts, spaces, events and bookings in a structured and scalabele way.

### Your Place allows:

- Hosts to create and manage spaces and events
- Users to register, authenticate, and book events or spaces
- Secure role-based access to protected resources
- Consistent, validated and predictable API resonses

## Minimum Viable Product MVP Features

- User registration and login (Authentication)
- Role based authorisation (Host vs User)
- CRUD Operations for tasks (Create, Read, Update, Delete)
- Separate development and test environments
- Automated test suite for functionality

---

## Technologies Used

### System Hardware Requirements

Component              |  Requirement        | Relevence
-----------------------| ------------------- | ------------------------------
Node.js                | v20+                | Industry-standard JS runtime for backend
PostgreSQL             | v15+                | Production-grade relational database
RAM                    | 4GB min.            | Recommunded minimum for local develoment and database operations
OS                     | windows/macOS/Linux | Cross-platform compatibility
Internet Connection    | Required            | Required for cloning repository, installation and running the live server on URL

## Software Technologies

### Core Backend Stack

### Node.js

- Widely used in production APIs, microservices and serverless applications.
- Implements standard JavaScript (ES5+) features used in the backend project, but is capable of modern ES2022 syntax if needed.
- Provides non-blocking, event driven runtime ideal for handling requests efficiently.
**Alterntive technologies**
- Python (Django/FastAPI); Java (Spring)
**Why Node.js**
- High-level ecosystem of packages (npm)
- Shared language with the front-end
- High performance PAIs and scalability
**Licence**
- MIT - Permissive open-source licence allowing broad usage in both commerical and non-commerical projects.

### Express

- A lightweight HTTP server and routing framework for builing APIs.
- Provides middleware-based architecture, aking it eas yto add functionalities such as authentication, logging, and validation.
- Supports modular, scalable project structures and seemlessly integrates with Node.js.
**Alterntive technologies**
- Fastify; NestJS
**Why Express**
- Widely adopted in industry, making knowledge transferable and widely available.
- Minimal abstraction allows developers to learn core backend concepts while maintaining flexibility.
**Licence**
- MIT - Permissive open-source licence.

### PostgreSQL

- Relational database with strong ACID compliance and advanced SQL features.
- Supports foreign keys, contraints, triggers, and complex queries, ensuring data integrity.
- Offers robust indexing, transactional safety, and concurrency handling, making it suitable for production applications.
**Alterntive technologies**
- MYSQL; MongoDB
**Why PostgreSQL**
- Strong data integrity, reliability, and support of complex queries necessary for applications with relational data such as users, spaces, events and bookings.
**Licence**
- PostgreSQL Licence - Permissive open-source licance compatible for commerical use.

### Key Dependencies

Package       |  Purpose                     | Relevence
--------------| -------------------          | ------------------------------
pg            | PostgreSQL client for Node.js| Direct SQL control commonplace in production systems
isonwebtoken  | JWT creation and verification| Industry standard stateless authentication
bcryptjs      | Password Hashing             | Secure storage of vulnerable user credentials
zod           | Request valiidation and schema enforcement | Explicit validation
helmet        | Secure HTTP headers          | Prevents common web vulnerabilities
cors          | Cross-Origin Resource Sharing| Required for frontend communication to backend
dotenv        | Environment variable management| Secure configuration handling

### Alternatives Considered

- **Validation:** Joi / Yup vs **Zod** - Chose zod for Typescript-friendly schemas and concise parsing.
- **DB Access:** Prisma / Knex vs **raw pg** - Chose pg for learning and explicit SQL control.
- **Auth:** Session cookies vs **JWT** - Chose JWT for a statless API style and simpler scaling.

### Licencing

All major dependencies use permissive oen-source licences, including:

- MIT: pg, jsonwebtoken, bcryptjs, zod, helmet, cors
- BSD-2-Clause: dotenv

These licences allow modification, distribution, and commercial/non-commercial use, aligning with industry standards for backend development.

See each package's `licence` field in `node modules` or [npm](https://www.npmjs.com/) for details

### Development and Testing

### Jest

- Javascript testing framweork
- Used for automated API tests
**Alterntive technologies**
- Mocha; Vitest
**Why PostgreSQL**
- An all-in-one solution with assertions, mocks and coverage.

### Supertest

- HTTP assertion library
- Used to test API endpoints

### Nodemon

- Automatic restart of the server during development

## Environment Configuration

This applicaton uses separate environments to prevent test and development data conflicts. This matches real-world deployment practices and ensures safe, repeatable testing.

`.env`(Development)
```bash
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://<username>:<password>@localhost:5432/your_place_dev
JWT_SECRET=replace_me_with_a_random_string
JWT_EXPIRES_IN=1d
```

`.env.test`(Testing)
```bash
NODE_ENV=development
DATABASE_URL_TEST=postgres://<username>:<password>@localhost:5432/your_place_test
JWT_SECRET=test_secret
JWT_EXPIRES_IN=1d
```

---

## Authentication and Security

### Authentiction

- JWT based authentication using `Authorization: Bearer <token>` headers
- Tokens are signed with `JWT_Secret` and contain user `id` and `role`
- All protected endpoints require valid JWT tokens (401 if missing/invalid)

### Authorisation

**Spaces and Events**

- **Create/Update/Delete** -> Requires `host` role
- **Read** -> Public (no auth required)

**Bookings**

- **Create** -> Any authenticated user can create ookings for themselves (uses `req.user.id`)
- **Read** -> 
    - Users can view their own bookings (`scope=mine` or default)
    - Hosts can view bookings for their hosted events/spaces (`scope=host`)
- **Update** ->
    - Users can update their own bookings (all fields)
    - Hosts can only update `paymentstatus` for bookings on their events/spaces
- **Delete** -> Users can delete their own bookings; hosts can delete bookings on their events/spaces

**Note regarding Admin/Developer Role (Planned):**
During the plannning of the development of Your Place, we designed the system to support a potential admin role for development or administrative purposes. This role would have unrestricted access to all resources (spaces, events, bookings, and users) for testing, debugging, and administrative management. Due to time constraints, full admin functionality was not fully implemented, but the architecture supports its integration, and role-based access control is designed to allow seamless addition of an admin role in future iterations.

---

## Error Handling

- Centralised error-handling middleware
- Custom `ApiError` class for consistent API responses
- Database constraint errors mapped to meaningful HTTP responses

---

## Style Guide and Code Quality

### Airbnb JavaScript Guide

This projects follows the **Airbnb JavaScript Style Guide**, enforced using **ESLint** and **Prettier**.

### Why?

- Widely adopted in the industry
- Promotes readable, maintainable, and predictable code
- Encourages best practices including: Consistent naming, clear control flow, explicit error handling, and avoidance of ambiguous JavaScript patterns

### Tooling

- **ESLint** with `eslint-config-airbnb-base`
- **Prettier** for formatting consistency
- Custom rule adjustments to suit backend development (e.g. allowing `console.log`)

```bash
npm run lint
npm run lint:fix
npm run format
```

Using a recognised industry style guide demonstrates professional development practices and makes the codebase easier to collaborate on and maintain over time.

--- 

## Database Setup (PostgreSQL)

A noted in the above section [Environment Configuration](#environment-configuration), this project uses PostgreSQL with separate **development** and **test** databases.

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
PORT=5000
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