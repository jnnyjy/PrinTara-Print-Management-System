# PrinTara

PrinTara is a role-based print shop operations platform built with Next.js, TypeScript, Supabase, and PostgreSQL. It manages the workflow from customer file submission through pricing, payment, production status, pickup tracking, and business analytics.

This portfolio project demonstrates full-stack application development for a small business workflow, including authentication, authorization, private file handling, server-side validation, and database-backed reporting.

## Highlights

- Customer print-request submission with PDF, JPG, and PNG uploads
- Public order tracking without exposing customer contact details
- Staff workflow for reviewing, pricing, accepting, rejecting, and progressing jobs
- Owner dashboard for completed jobs and revenue analytics
- Payment recording, change calculation, and printable receipt previews
- Private Supabase Storage with signed file access and server-side preview proxying
- Server-side file validation using size, extension, MIME, and magic-byte checks
- Production security headers, CSP, protected routes, and role checks
- SQL migrations for permissions, analytics, cleanup, and payment workflows

## Demo workflow

1. A customer submits print specifications and files.
2. Staff reviews the request and enters the price.
3. The request becomes a production job.
4. Staff moves the job through `PRINTING`, `READY`, and `COMPLETED`.
5. Payment and receipt details are recorded.
6. Customers see the current queue through the public tracking page.
7. Owners review revenue and completion analytics.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Material UI
- Supabase Auth, PostgreSQL, Storage, and Realtime
- PostgreSQL functions and Row Level Security
- Vercel-compatible deployment

## Project structure

```text
PrinTara/
├── app/
│   ├── (hero)/              Public landing and submission pages
│   ├── api/                 Tracking and secure file proxy routes
│   ├── login/               Authentication UI
│   ├── owner/               Owner-only operations and analytics
│   ├── staff/               Staff job-management workflow
│   └── track/               Public order tracking
├── lib/
│   ├── supabase/            Browser, server, and admin clients
│   ├── auth.ts              Role helpers
│   └── theme.ts             Shared UI theme
├── public/                  Static assets
├── supabase-*.sql           Database and security migrations
├── docs/                    Architecture and security notes
├── proxy.ts                 Authenticated route guard
├── next.config.ts           Next.js and security headers
└── package.json             Scripts and dependencies
```

More detail is available in [docs/architecture.md](docs/architecture.md), [docs/database.md](docs/database.md), and [docs/security.md](docs/security.md).

## Getting started

### Prerequisites

- Node.js 20 or newer
- A Supabase project
- npm

### Install and configure

```bash
npm install
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Set these values in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY
```

Never commit `.env` or production credentials.

### Prepare Supabase

Run the SQL files in the Supabase SQL Editor in this order:

1. `supabase-public-submission-migration.sql`
2. `supabase-cashier-migration.sql`
3. `supabase-analytics-migration.sql`
4. `supabase-admin-files-migration.sql`

The migrations are designed to be reviewed and run manually. Back up or use a staging project before applying database changes.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # Start the development server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript without emitting files
npm run build      # Create a production build
npm run start      # Start the production server
```

## Security approach

PrinTara uses layered controls rather than relying on client-side UI restrictions:

- Authenticated route checks run in `proxy.ts` and server layouts.
- Sensitive server actions verify the current Supabase user and role.
- The admin Supabase client is isolated to server-only code.
- Uploads are validated on the server and stored in a private bucket.
- File previews use short-lived signed access, a same-origin proxy, `nosniff`, CSP, and an iframe sandbox.
- Production responses include security headers and a Content Security Policy.
- Supabase permissions and policies block direct anonymous writes.

See [docs/security.md](docs/security.md) for scope, assumptions, and remaining limitations.

## Deployment

PrinTara can be deployed to Vercel or another Node-compatible host:

1. Create the Supabase project and apply the reviewed SQL migrations.
2. Configure the three environment variables in the hosting platform.
3. Build with `npm run build`.
4. Confirm the `job-files` bucket is private.
5. Verify authenticated owner and staff routes in a staging environment.

## Author

**Jenny Joy Escobar**
BS Information Technology Graduate, STI College - Global City
[GitHub](https://github.com/jnnyjy)
