# QUICK PLUGINS

A freemium Minecraft plugin marketplace built with Next.js 14 (App Router), TypeScript, Tailwind CSS,
Prisma + SQLite, and custom username/password authentication with role-based access control (RBAC).

## Features

- **Custom Auth** — username + password only, JWT session cookies (no third-party providers)
- **RBAC** — User, Plugin Maker, Developer, and Admin roles with strictly enforced protected routes
- **License System** — HWID + Minecraft IP locked license keys; licenses are hidden entirely if HWID/IP don't match
- **Plugin Marketplace** — search, filters, free/paid plugins priced in ₱ (PHP)
- **Server Listings** — status, players, version, copyable IP
- **Plugin Maker Dashboard** — submit/manage plugins, view earnings in ₱
- **Developer Docs** — resources and API reference
- **Admin "Everything" Dashboard** — user management, license management, plugin approvals, server management, sales & analytics, announcements
- **Dark theme** with cyan/purple neon accents, fully responsive, Framer Motion-ready

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (shadcn-style component primitives)
- Prisma ORM + SQLite
- jose (JWT sessions) + bcryptjs (password hashing)
- Framer Motion (available for subtle animation)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

The project already includes a working `.env` for local development:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-long-random-secret-in-production"
```

**Change `JWT_SECRET` before deploying to production.**

### 3. Set up the database

```bash
npx prisma db push
npm run db:seed
```

This creates `prisma/dev.db` (SQLite) and seeds demo data.

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Demo Accounts

All demo accounts use the password `password123`:

| Username | Role         |
|----------|--------------|
| admin    | Admin        |
| maker    | Plugin Maker |
| dev      | Developer    |
| user     | User         |

## Project Structure

```
src/
  app/                 # App Router pages & API routes
    api/                 # REST-style route handlers (auth, licenses, plugins, servers, users, admin)
    admin/               # Admin "Everything" dashboard
    plugin-maker/        # Plugin Maker dashboard + submission
    developer/           # Developer docs
    licenses/            # My Licenses + redeem
    plugins/             # Plugin marketplace + detail pages
    servers/             # Server listings
    profile/             # User profile
  components/          # Navbar, Footer, shared UI primitives
  lib/                 # Prisma client, auth helpers, utils
  middleware.ts        # RBAC route protection
prisma/
  schema.prisma        # Database schema
  seed.ts              # Demo data seeder
```

## License Security Model

- Each license key is locked to **exactly one HWID** and **one specific Minecraft server IP**.
- If a user's stored HWID doesn't match a license's HWID, that license is **completely hidden** from their account (not just disabled).
- Licenses can be marked one-time-use; once redeemed, they can't be redeemed again.
- **A license is connected to every plugin its maker publishes, not just one.** When an admin creates a
  key from `/admin/licenses`, they link it to one plugin from a Plugin Maker's catalog — that link is used
  to identify the maker, and a valid, matched license then unlocks **all** of that maker's approved plugins
  (download access is checked by matching creator, via `prisma.license.findFirst({ where: { userId, plugin: { creatorId } } })`).
  Expired licenses are rejected at download time even if HWID matches.
- Admins can create and revoke license keys at any time from `/admin/licenses`.

## Deploying to Vercel

SQLite works great for local development, but Vercel's serverless functions don't have a persistent,
writable filesystem in production — the SQLite file won't survive between requests. Before deploying,
swap to a hosted Postgres database:

1. **Provision a database.** In your Vercel project, go to **Storage → Marketplace** and connect a
   Postgres provider (**Neon** has the easiest free tier; Supabase also works). This injects a
   connection-string environment variable into your project. *(Vercel's own first-party "Vercel Postgres"
   product was retired — existing databases were migrated to Neon automatically. New projects use a
   Marketplace integration instead.)*
2. **Point Prisma at it.** Make sure a `DATABASE_URL` environment variable is set in Vercel with that
   connection string — rename the injected variable, or add a second `DATABASE_URL` var with the same
   value, if Vercel named it something else (e.g. `POSTGRES_URL`).
3. **Switch the provider** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. **Create the tables and seed data** by pointing your *local* `.env` at that same `DATABASE_URL`
   temporarily and running:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
5. **Set `JWT_SECRET`** in Vercel's Environment Variables to a new long random string (don't reuse the
   local dev placeholder).
6. **Deploy** — push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new), or run
   `npx vercel` from the project root. Vercel auto-detects Next.js; no build configuration changes are
   needed, and `postinstall` already runs `prisma generate`.

## Notes

- All prices are displayed in Philippine Pesos (₱) using `Intl.NumberFormat`.
- This is a freemium platform — there is no "Premium" tier wording anywhere in the UI.
- Plugin downloads are simulated (placeholder file URLs) since this is a demo/starter project — wire up
  real file storage (e.g. S3, Vercel Blob) for production use.
