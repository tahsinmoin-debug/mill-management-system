# MillTrack: Production & Wage Management for a Clothing Mill

A bilingual (Bangla/English) web app built for a real clothing mill client in Bangladesh. It replaced paper registers for recording daily loom production and calculating workers' yard-based wages.

> Freelance project, built and maintained by [Tahsin Moin](https://github.com/tahsinmoin-debug). In use by the client.

<!-- Add 2–3 screenshots here with real worker data blurred, e.g. docs/screenshots/dashboard.png -->

## The problem

The mill paid workers per yard of fabric produced, and tracked everything on paper: who worked which machine, how many yards each day, and what each person was owed at month end. Totals were slow to calculate, rate changes were easy to apply wrongly, and there was no clear view of machine output over time.

## What it does

- **Daily production entry:** record each worker's output across one or more machines, with segment-wise yard input and a live wage preview while typing.
- **Automatic wage calculation:** one calculation engine (`src/lib/wage-calc.ts`) handles daily, monthly and yearly totals at the current per-yard rate, rounded to whole taka.
- **Reports:** weekly, monthly and yearly reports, plus printable payslips (print or save as PDF straight from the browser).
- **Machine and worker management:** add machines and workers, and mark them active, inactive or under repair.
- **Wage rate history:** the admin sets the per-yard rate, and past rates are kept.
- **Two roles:** Admin (full access, user and rate settings) and Manager (daily entry and reports).
- **Bangla and English UI:** the client's staff use it in Bangla.

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js (App Router, Server Actions), React, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Auth | Auth.js (NextAuth) credentials login, bcrypt-hashed passwords, role checks in route protection and inside every server action |
| Charts | Recharts |

The stack was chosen for a two-user internal tool: no paid APIs and no infrastructure the client has to maintain.

## Running locally

```bash
npm install
```

Create `.env.local` (git-ignored):

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
AUTH_SECRET=<generate with: npx auth secret>
ADMIN_USERNAME=<admin login name>
ADMIN_NAME=<display name>
ADMIN_PASSWORD=<at least 12 characters>
```

Then set up the database, create the admin account and start the app:

```bash
npx prisma db push
npx tsx --env-file=.env.local seed.ts
npm run dev
```

Running the seed again with a new `ADMIN_PASSWORD` resets that admin's password.

## Project structure

```
src/
  app/(dashboard)/   pages: dashboard, entry, machines, workers, reports, settings
  app/actions/       server actions (each checks the session and role)
  lib/wage-calc.ts   wage and yard calculations
  lib/guards.ts      requireUser / requireAdmin helpers
  lib/i18n.tsx       Bangla/English translations
prisma/schema.prisma data model
```
