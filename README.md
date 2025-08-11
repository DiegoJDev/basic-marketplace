# Basic Marketplace (Next.js App Router)

Stack: Next.js (App Router), TypeScript, NextAuth (JWT), Prisma ORM (SQLite), Tailwind CSS v4, Headless UI, React Hook Form + Zod.

## Prerequisites

- Node 18+
- pnpm or npm

## Setup

1. Install deps
   ```bash
   npm install
   ```
2. Environment
   Create `.env` with:
   ```bash
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_SECRET="dev-secret-change-me"
   ```
3. Database
   ```bash
   # reset, migrate and seed
   npx prisma migrate reset --force
   ```
4. Dev server
   ```bash
   npm run dev
   ```

## Test users

- business@example.com → role BUSINESS (dashboard)
- client@example.com → role CLIENT

## Auth and roles

- Credentials provider (email only). No auto-register. Use /sign-up.
- Middleware:
  - Protege `/dashboard` para BUSINESS.
  - BUSINESS allow-list: `/dashboard*` y `/about`.
- Server protection: APIs usan `getServerSession` para verificar rol.

## Key routes

- Public: `/`, `/stores`, `/products`, `/cart`, `/orders`, `/about`.
- Dashboard (BUSINESS): `/dashboard/stores`, `/dashboard/products`, `/dashboard/orders`.

## Development helpers

- Prisma Studio: `npx prisma studio`
- Reset DB + seed: `npx prisma migrate reset --force`

## Decisions

- Prices stored in cents (Int). Zod validates bounds.
- UI in Spanish; code, enums, DB in English. `src/lib/i18n.ts` mapea etiquetas.
- Pagination via URL `?page=`; componente `Pagination` reutilizable.
