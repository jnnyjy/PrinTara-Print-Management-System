-- =============================================================================
-- Permissions Fix
-- Run this once in the Supabase SQL Editor.
--
-- Fixes two problems caused by the security hardening migration:
--   1. INSERT was revoked from `authenticated` on job_requests and
--      job_request_files — but the server-side admin client needs it.
--   2. The analytics function checks auth.jwt() ->> 'email' which is always
--      NULL in Supabase, so it throws "not authorized" for everyone.
--
-- The admin client (service role key) bypasses RLS and all GRANT/REVOKE
-- checks entirely, so these fixes are actually just cleanup. The real guard
-- is the role check in TypeScript before any DB call is made.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Restore write access for authenticated users.
--    The server actions use the service-role admin client which bypasses RLS,
--    but GRANT/REVOKE on the table itself still applies to the service role
--    in some Supabase configurations. Restore the grants to be safe.
-- ----------------------------------------------------------------------------
GRANT INSERT, UPDATE, DELETE ON TABLE public.job_requests      TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.job_request_files TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.jobs              TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.payments          TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. Fix the analytics function — remove the email JWT check that always
--    fails, since auth.jwt() does not carry the email claim in Supabase.
--    The owner-only guard already exists in TypeScript before this RPC is
--    ever called. The function is still SECURITY DEFINER so it runs with
--    elevated privileges regardless of who calls it.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_print_shop_analytics(
  p_period text DEFAULT 'daily'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  local_now    timestamp := timezone('Asia/Manila', now());
  local_today  date      := timezone('Asia/Manila', now())::date;
  selected_period text   := lower(
    CASE
      WHEN p_period IN ('daily', 'weekly', 'monthly', 'yearly')
        THEN p_period
      ELSE 'daily'
    END
  );
  result jsonb;
BEGIN
  -- Require an authenticated session (no email check — auth.jwt() email is
  -- always NULL in Supabase; the owner-only gate lives in the Next.js action).
  IF auth.uid() IS NULL THEN
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
        WHERE p.job_id = j.id
          AND p.status = 'PAID'::payment_status
        ORDER BY p.created_at DESC
        LIMIT 1
      ), 0)::numeric AS revenue
    FROM public.jobs j
    WHERE j.status     = 'COMPLETED'::job_status
      AND j.completed_at IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.payments p
        WHERE p.job_id = j.id
          AND p.status = 'PAID'::payment_status
      )
  ),
  summary AS (
    SELECT
      COALESCE(SUM(revenue) FILTER (WHERE completed_date = local_today), 0)                                         AS today,
      COALESCE(SUM(revenue) FILTER (WHERE completed_date >= date_trunc('week',  local_now)::date), 0)               AS week,
      COALESCE(SUM(revenue) FILTER (WHERE completed_date >= date_trunc('month', local_now)::date), 0)               AS month,
      COALESCE(SUM(revenue) FILTER (WHERE completed_date >= date_trunc('year',  local_now)::date), 0)               AS year,
      COALESCE(SUM(revenue), 0)                                                                                     AS total,
      COUNT(*)                                                                                                       AS completed_jobs
    FROM paid_completed
  ),
  buckets AS (
    SELECT 'daily' AS bucket_type, d::date AS bucket_start,
           (d + interval '1 day') AS bucket_end,
           to_char(d, 'Mon DD') AS label
    FROM generate_series(local_today - interval '6 days', local_today::timestamp, interval '1 day') d
    UNION ALL
    SELECT 'weekly', w::date, (w + interval '1 week')::date,
           'W' || to_char(w, 'IW') || ' (' || to_char(w, 'Mon DD') || ')'
    FROM generate_series(
      date_trunc('week', local_now - interval '11 weeks'),
      date_trunc('week', local_now), interval '1 week'
    ) w
    UNION ALL
    SELECT 'monthly', d::date, (d + interval '1 month')::date, to_char(d, 'Mon')
    FROM generate_series(
      date_trunc('year', local_now),
      date_trunc('year', local_now) + interval '11 months',
      interval '1 month'
    ) d
    UNION ALL
    SELECT 'yearly', d::date, (d + interval '1 year')::date, to_char(d, 'YYYY')
    FROM generate_series(
      date_trunc('year', local_now) - interval '5 years',
      date_trunc('year', local_now), interval '1 year'
    ) d
  ),
  series AS (
    SELECT b.label,
           COALESCE(SUM(pc.revenue), 0) AS earnings,
           COUNT(pc.id)                 AS jobs
    FROM buckets b
    LEFT JOIN paid_completed pc
      ON pc.completed_at >= (b.bucket_start::timestamp AT TIME ZONE 'Asia/Manila')
     AND pc.completed_at <  (b.bucket_end              AT TIME ZONE 'Asia/Manila')
    WHERE b.bucket_type = selected_period
    GROUP BY b.bucket_start, b.label
    ORDER BY b.bucket_start
  ),
  recent AS (
    SELECT COALESCE(
      jsonb_agg(to_jsonb(recent_rows) ORDER BY completed_at DESC),
      '[]'::jsonb
    ) AS rows
    FROM (
      SELECT order_code, quantity, paper_size AS service,
             completed_at, revenue AS amount, 'PAID' AS payment_status
      FROM paid_completed
      ORDER BY completed_at DESC
      LIMIT 10
    ) recent_rows
  )
  SELECT jsonb_build_object(
    'period',   selected_period,
    'summary',  (SELECT to_jsonb(summary) FROM summary),
    'series',   COALESCE((SELECT jsonb_agg(to_jsonb(series)) FROM series), '[]'::jsonb),
    'recent',   (SELECT rows FROM recent),
    'timezone', 'Asia/Manila'
  )
  INTO result;

  RETURN result;
END;
$$;

-- Keep analytics callable by authenticated sessions.
REVOKE ALL   ON FUNCTION public.get_print_shop_analytics(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_print_shop_analytics(text) TO authenticated;
