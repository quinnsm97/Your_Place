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

# CONTRIBUTORS

- [Cat Brandt](https://github.com/catbrandt)
