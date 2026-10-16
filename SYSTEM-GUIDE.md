# Print Shop Tracker System Guide

## Current Feature Summary

### Customer Submission

- Customers submit quantity, print specifications, color mode, finishing services, and files.
- Print Specifications is a multi-select field with common options such as A4, A5, A3, Letter, Legal, photos, posters, flyers, brochures, business cards, invitations, stickers, labels, tarpaulins, Custom Size, and Other.
- Finishing & Additional Services is an optional multi-select field with Lamination, Binding, Cutting, Folding, Stapling, Hole Punching, Trimming, and Other.
- Color / Print Mode is required and supports Full Color or Black & White.
- Custom specification and custom finishing fields appear when Other or Custom Size is selected.
- Both multi-select menus include a visible Done button.
- Customers can upload multiple PDF, JPG, and PNG files up to 20 MB each.
- Additional Notes has been removed.

### Order Code

- Each submission receives an order code.
- The order code can be downloaded as a PNG image.
- Customers can also screenshot the order code.

### Staff Orders Board

- The `/staff` Orders board combines pending requests and accepted jobs.
- Pending requests show a compact order summary and attached file count.
- View Details opens specifications, finishing, file cards, image thumbnails, PDF previews, and file navigation.
- Attached files can be downloaded individually or with Download all.
- Accepted jobs also have View Details with their original submitted files.

### Cashier and Receipt

- Staff enter the price and amount received.
- Change is calculated automatically.
- Payment method selection has been removed.
- Accepted payments are stored as `PAID`.
- A receipt preview opens after acceptance.
- The receipt includes the order code, price, amount received, and change.
- Staff can print the receipt or click Done to close all receipt/detail windows.
- Accepted orders move directly to `PRINTING` after cashier acceptance.

### Analytics and Completed Jobs

- Owners can open `/owner/analytics` from the Analytics tab.
- Analytics is restricted by the authenticated staff/owner layouts.
- Summary cards show today's, this week's, this month's, this year's, and lifetime earnings, plus completed job count.
- Earnings include only `COMPLETED` jobs with a matching `PAID` payment and use the recorded payment amount.
- Daily, weekly, monthly, and yearly selectors update database-backed revenue and completed-job charts.
- Analytics uses Philippine time (`Asia/Manila`).
- Recent Completed Jobs remains available after a job is archived.
- Completed jobs remain active for 24 hours, then are marked archived rather than deleted.

## Customer Process

1. Customer opens the submission page.
2. Customer selects quantity, print specifications, required color mode, optional finishing services, and files.
3. Customer submits the print request.
4. The system generates an order code such as `REQ-12345`.
5. Files are uploaded to Supabase Storage.
6. The customer receives the order number.
7. The customer can download or screenshot the order number for tracking.

## Customer Tracking

The `/track` page displays the public live queue:

- `In queue`
- `Printing now`
- `Ready for pickup`

The queue:

- Uses the order code.
- Refreshes every 15 seconds.
- Hides completed jobs.
- Does not require a name or phone number.
- Shows quantity, paper size, and color mode.

## Staff Orders Board

The `/staff` page is the main staff Orders board.

Columns:

- `IN QUEUE`
- `PRINTING`
- `READY`
- `COMPLETED`

Pending customer requests appear directly in `IN QUEUE`.

Each request card includes:

- Order code
- Quantity
- Print specifications
- Color mode
- Finishing services
- Attached file count
- View Details action
- Accept and Reject actions inside the details window

## Accepting an Order

Staff must:

1. Open the request on the Orders board.
2. Review the specifications and attached files.
3. Enter the price.
4. Enter the amount received.
5. Review the calculated change.
6. Accept the request.

The system then:

- Creates a job.
- Creates a payment record.
- Marks the payment as `PAID`.
- Changes the request status to `ACCEPTED`.
- Sets the job status to `PRINTING`.
- Displays the job in `PRINTING`.

## Rejecting an Order

Staff can reject a request if the customer changes their mind.

The system then:

- Changes the request status to `REJECTED`.
- Records the staff member who reviewed it.
- Records the review date.
- Does not create a job.
- Does not create a payment.
- Removes the request from the active queue.

## Moving Jobs

Staff move jobs through this workflow:

```text
PRINTING -> READY -> COMPLETED
```

The admin board updates the database when a job moves. The public tracking board reflects the active status through its periodic refresh.

## Database Tables

### `job_requests`

Stores customer-submitted print requests.

Important fields:

- `id`
- `order_code`
- `quantity`
- `paper_size`
- `color_mode`
- `notes`
- `status`
- `reviewed_by`
- `reviewed_at`
- `resulting_job_id`
- `created_at`

Request statuses:

```text
PENDING
ACCEPTED
REJECTED
```

### `job_request_files`

Stores uploaded file references.

Important fields:

- `id`
- `job_request_id`
- `file_name`
- `file_path`

### `jobs`

Stores accepted print jobs.

Important fields:

- `id`
- `order_code`
- `quantity`
- `paper_size`
- `color_mode`
- `notes`
- `price`
- `status`
- `created_by`
- `created_at`
- `completed_at`
- `is_archived`

Job statuses:

```text
RECEIVED
PRINTING
READY
COMPLETED
```

Pending requests are displayed in `IN QUEUE`. Accepted requests move directly to `PRINTING`.

### `payments`

Stores payment information.

Important fields:

- `job_id`
- `amount`
- `method` (currently stored as `COD` for cashier payments)
- `status`
- `amount_received`
- `change_amount`
- `paid_at`

Accepted jobs create payments with status:

```text
PAID
```

### Supabase Storage

The `job-files` bucket stores uploaded PDFs, JPGs, and PNGs.

The form allows files up to `20 MB` each. The Next.js Server Action body limit is configured to `25 MB` to allow multipart upload overhead.

## Main Functions

### `submitJobRequest`

Located in `app/submit/actions.ts`.

Handles:

- Form validation.
- Quantity and print specification validation.
- File type validation.
- File size validation.
- Order code generation.
- Request insertion.
- File uploads.
- File record creation.

### `acceptJobRequest`

Located in `app/staff/actions.ts`.

Handles:

- Staff authentication.
- Price validation.
- Amount received and change validation.
- Job creation.
- Payment creation.
- Request acceptance.
- Receipt data generation.
- Direct transition to `PRINTING`.

### `rejectJobRequest`

Located in `app/staff/actions.ts`.

Handles:

- Staff authentication.
- Request rejection.
- Review tracking.
- Removing the request from the active queue.

### `updateJobStatus`

Located in `app/staff/actions.ts`.

Handles moving jobs between:

```text
PRINTING -> READY -> COMPLETED
```

When a job enters `COMPLETED`, `completed_at` is recorded and `is_archived` is reset to false.

### `archive_completed_jobs`

Located in `supabase-analytics-migration.sql`. This idempotent PostgreSQL function marks completed jobs older than 24 hours as archived without deleting jobs or payments.

### `get_print_shop_analytics`

Located in `supabase-analytics-migration.sql`. This protected PostgreSQL RPC aggregates paid completed transactions by day, week, month, and year using `Asia/Manila` time, and returns summary totals and recent completed jobs.

### `GET /api/track`

Located in `app/api/track/route.ts`.

Returns active public jobs for the customer queue. It returns only the order code, status, quantity, paper size, color mode, and creation date.

### `POST /api/track`

Located in `app/api/track/route.ts`.

Looks up an order by order code.

## Authentication

The staff and owner areas require Supabase authentication.

Protected pages:

- `/staff`
- `/staff/requests`

Unauthenticated staff members are redirected to `/login`.

Customers do not need an account to submit a request, view the public queue, or track an order code.

## Routes

```text
/              Customer homepage
/submit        Submit a print request
/track         Public queue and order tracking
/login         Staff login
/staff         Staff Orders board
/owner/analytics Owner Analytics dashboard
/staff/requests Legacy request page
/api/track     Public tracking API
```

The main staff workflow is `/staff`. It is the Orders board.

## Security and Permissions

The system uses Supabase Row Level Security.

The public submission flow requires policies allowing:

- Anonymous users to insert `job_requests`.
- Anonymous users to insert `job_request_files`.
- Anonymous users to upload files to the `job-files` storage bucket.

Staff users manage requests and jobs through authenticated server actions.

Only authenticated staff can execute the analytics RPC. Customers cannot view earnings or business analytics.

The public tracking API uses the server-side Supabase admin client and returns only queue-safe fields.

## Database Cleanup

The application no longer uses customer names or phone numbers.

If those columns still exist in the database and should be permanently removed, run this in Supabase SQL Editor:

```sql
BEGIN;

ALTER TABLE public.job_requests
  DROP COLUMN IF EXISTS customer_name,
  DROP COLUMN IF EXISTS customer_phone;

ALTER TABLE public.customers
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS phone;

COMMIT;
```

This permanently deletes those column values. Run a backup first if the data may be needed later.

## Analytics Database Migration

Run `supabase-analytics-migration.sql` in Supabase SQL Editor. It adds completion and archive fields, creates analytics indexes and functions, and schedules the archive function hourly through `pg_cron`.

To verify the feature:

1. Move a paid job to `COMPLETED` and confirm `completed_at` is populated.
2. Open `/owner/analytics` and confirm the amount appears in today's and lifetime earnings.
3. Set a test job's `completed_at` to more than 24 hours ago, then run `SELECT public.archive_completed_jobs();`.
4. Confirm the job disappears from the active Orders board but remains in analytics totals and Recent Completed Jobs.
5. Test a completion near midnight and verify grouping with `Asia/Manila`.

The scheduled job is named `archive-completed-print-jobs` and runs hourly at five minutes past the hour.

## Development Commands

```bash
npm run dev
npm run lint
npm run build
```
