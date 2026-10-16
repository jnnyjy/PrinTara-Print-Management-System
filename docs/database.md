# Database design

## Main entities

- `job_requests` stores customer-submitted specifications and review state.
- `job_request_files` maps uploaded Storage objects to requests.
- `jobs` stores accepted production work and status transitions.
- `payments` stores payment amounts and payment state.
- `storage.objects` stores private uploaded print files in the `job-files` bucket.

## Migrations

Run the SQL files from the repository root in this order:

1. `supabase-public-submission-migration.sql`
2. `supabase-cashier-migration.sql`
3. `supabase-analytics-migration.sql`
4. `supabase-admin-files-migration.sql`

Review each migration against the target Supabase project first. The scripts are intended for the Supabase SQL Editor and should be tested in staging before production.

## Consistency rules

- Accepted requests create a job and payment record.
- Paid completed jobs are included in analytics.
- Completed jobs are archived after the retention window instead of immediately deleting operational history.
- File cleanup removes old Storage objects and their references through a scheduled database function.
