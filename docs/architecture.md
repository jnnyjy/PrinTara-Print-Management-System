# Architecture

## Request flow

```text
Customer browser
    │
    ├── Public submission server action
    │       ├── Validates fields and file content
    │       ├── Writes through the server-only Supabase admin client
    │       └── Uploads to private Storage
    │
    └── Public tracking API
            └── Returns a deliberately limited queue view

Staff/owner browser
    │
    └── proxy.ts + server layout checks
            └── Server actions and Supabase server client
                    └── PostgreSQL and private Storage
```

## Application boundaries

- `app/(hero)` contains public customer-facing pages.
- `app/staff` contains staff operations and production workflow.
- `app/owner` contains owner-only operations and analytics.
- `app/api` contains request handlers that need an HTTP boundary.
- `lib/supabase` contains the browser, server, and server-only admin clients.
- `proxy.ts` performs an early route check; layouts and server actions repeat authorization checks.
- SQL files document database permissions, functions, indexes, and Storage policies.

## Core workflow

```text
PENDING request
    ├── ACCEPTED → PRINTING → READY → COMPLETED
    └── REJECTED
```

The database remains the source of truth for requests, jobs, payments, and file references. The UI reflects server state and does not independently grant permissions.
