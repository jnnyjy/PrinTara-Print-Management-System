-- Print shop analytics and completed-job archive migration.
-- Run once in the Supabase SQL Editor.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Preserve a useful completion date for jobs that were already completed.
UPDATE public.jobs
SET completed_at = COALESCE(updated_at, created_at)
WHERE status = 'COMPLETED'::job_status
  AND completed_at IS NULL;

CREATE INDEX IF NOT EXISTS jobs_status_completed_at_idx
  ON public.jobs (status, completed_at);

CREATE INDEX IF NOT EXISTS jobs_archived_status_idx
  ON public.jobs (is_archived, status);

CREATE INDEX IF NOT EXISTS payments_status_paid_at_idx
  ON public.payments (status, paid_at);

CREATE OR REPLACE FUNCTION public.archive_completed_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived_count integer;
BEGIN
  IF auth.uid() IS NOT NULL
     AND lower(COALESCE(auth.jwt() ->> 'email', '')) NOT LIKE 'owner_%@printara.com' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.jobs
  SET is_archived = true
  WHERE status = 'COMPLETED'::job_status
    AND is_archived = false
    AND completed_at IS NOT NULL
    AND completed_at <= now() - interval '24 hours';

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_print_shop_analytics(p_period text DEFAULT 'daily')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  local_now timestamp := timezone('Asia/Manila', now());
  local_today date := timezone('Asia/Manila', now())::date;
  selected_period text := lower(CASE WHEN p_period IN ('daily', 'weekly', 'monthly', 'yearly') THEN p_period ELSE 'daily' END);
  result jsonb;
BEGIN
  IF auth.uid() IS NOT NULL
     AND lower(COALESCE(auth.jwt() ->> 'email', '')) NOT LIKE 'owner_%@printara.com' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH paid_completed AS (
    SELECT
      j.id,
      j.order_code,
      j.quantity,
      j.paper_size,
      j.completed_at,
      timezone('Asia/Manila', j.completed_at)::date AS completed_date,
      COALESCE((
        SELECT p.amount
        FROM public.payments p
        WHERE p.job_id = j.id AND p.status = 'PAID'::payment_status
        ORDER BY p.created_at DESC
        LIMIT 1
      ), 0)::numeric AS revenue
    FROM public.jobs j
    WHERE j.status = 'COMPLETED'::job_status
      AND j.completed_at IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.payments p
        WHERE p.job_id = j.id AND p.status = 'PAID'::payment_status
      )
  ),
  summary AS (
    SELECT
      COALESCE(SUM(revenue) FILTER (WHERE completed_date = local_today), 0) AS today,
      COALESCE(SUM(revenue) FILTER (WHERE completed_date >= date_trunc('week', local_now)::date), 0) AS week,
      COALESCE(SUM(revenue) FILTER (WHERE completed_date >= date_trunc('month', local_now)::date), 0) AS month,
      COALESCE(SUM(revenue) FILTER (WHERE completed_date >= date_trunc('year', local_now)::date), 0) AS year,
      COALESCE(SUM(revenue), 0) AS total,
      COUNT(*) AS completed_jobs
    FROM paid_completed
  ),
  buckets AS (
    -- Daily: last 7 days, one bar per day
    SELECT 'daily' AS bucket_type, d::date AS bucket_start, (d + interval '1 day') AS bucket_end, to_char(d, 'Mon DD') AS label
    FROM generate_series(local_today - interval '6 days', local_today::timestamp, interval '1 day') d
    UNION ALL
    -- Weekly: last 12 full ISO weeks + current partial week, one bar per week
    SELECT
      'weekly',
      w::date,
      (w + interval '1 week')::date,
      'W' || to_char(w, 'IW') || ' (' || to_char(w, 'Mon DD') || ')'
    FROM generate_series(
      date_trunc('week', local_now - interval '11 weeks'),
      date_trunc('week', local_now),
      interval '1 week'
    ) w
    UNION ALL
    -- Monthly: all 12 calendar months of the current year (Jan–Dec)
    SELECT
      'monthly',
      d::date,
      (d + interval '1 month')::date,
      to_char(d, 'Mon')
    FROM generate_series(
      date_trunc('year', local_now),
      date_trunc('year', local_now) + interval '11 months',
      interval '1 month'
    ) d
    UNION ALL
    -- Yearly: last 6 calendar years up to and including the current year
    SELECT
      'yearly',
      d::date,
      (d + interval '1 year')::date,
      to_char(d, 'YYYY')
    FROM generate_series(
      date_trunc('year', local_now) - interval '5 years',
      date_trunc('year', local_now),
      interval '1 year'
    ) d
  ),
  series AS (
    SELECT
      b.label,
      COALESCE(SUM(pc.revenue), 0) AS earnings,
      COUNT(pc.id) AS jobs
    FROM buckets b
    LEFT JOIN paid_completed pc
      ON pc.completed_at >= (b.bucket_start::timestamp AT TIME ZONE 'Asia/Manila')
      AND pc.completed_at < (b.bucket_end AT TIME ZONE 'Asia/Manila')
    WHERE b.bucket_type = selected_period
    GROUP BY b.bucket_start, b.label
    ORDER BY b.bucket_start
  ),
  recent AS (
    SELECT COALESCE(jsonb_agg(to_jsonb(recent_rows) ORDER BY completed_at DESC), '[]'::jsonb) AS rows
    FROM (
      SELECT order_code, quantity, paper_size AS service, completed_at, revenue AS amount, 'PAID' AS payment_status
      FROM paid_completed
      ORDER BY completed_at DESC
      LIMIT 10
    ) recent_rows
  )
  SELECT jsonb_build_object(
    'period', selected_period,
    'summary', (SELECT to_jsonb(summary) FROM summary),
    'series', COALESCE((SELECT jsonb_agg(to_jsonb(series)) FROM series), '[]'::jsonb),
    'recent', (SELECT rows FROM recent),
    'timezone', 'Asia/Manila'
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_print_shop_analytics(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_print_shop_analytics(text) TO authenticated;

REVOKE ALL ON FUNCTION public.archive_completed_jobs() FROM PUBLIC, anon, authenticated;

-- Requires the pg_cron extension to be enabled in Supabase.
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $archive_schedule$
DECLARE
  existing_job_id bigint;
BEGIN
  SELECT jobid INTO existing_job_id FROM cron.job WHERE jobname = 'archive-completed-print-jobs';
  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;
  PERFORM cron.schedule(
    'archive-completed-print-jobs',
    '5 * * * *',
    $cron$SELECT public.archive_completed_jobs();$cron$
  );
END $archive_schedule$;
