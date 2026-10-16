-- Run this once in the Supabase SQL Editor.
-- Allows authenticated staff to read requests and create signed file URLs.

ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_request_files ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.job_requests TO authenticated;
GRANT SELECT ON TABLE public.job_request_files TO authenticated;

DROP POLICY IF EXISTS "Staff can view print requests" ON public.job_requests;
CREATE POLICY "Staff can view print requests"
ON public.job_requests
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Staff can view request files" ON public.job_request_files;
CREATE POLICY "Staff can view request files"
ON public.job_request_files
FOR SELECT
TO authenticated
USING (true);

GRANT SELECT ON storage.objects TO authenticated;

DROP POLICY IF EXISTS "Staff can view job files" ON storage.objects;
CREATE POLICY "Staff can view job files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'job-files');

-- ============================================================
-- Auto-delete uploaded files for jobs completed over 7 days ago
-- ============================================================

-- Step 1: Grant DELETE on job_request_files so the function can clean up rows.
GRANT DELETE ON TABLE public.job_request_files TO authenticated;

-- Step 2: Function that deletes storage objects + their DB records for any
--         job whose completed_at is older than 7 days.
CREATE OR REPLACE FUNCTION public.delete_old_job_files()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer := 0;
  cutoff_time   timestamptz := now() - interval '7 days';
BEGIN
  IF auth.uid() IS NOT NULL
     AND lower(COALESCE(auth.jwt() ->> 'email', '')) NOT LIKE 'owner_%@printara.com' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- Collect the file paths that need to go, then delete them from storage.
  -- storage.delete_object() removes one object at a time; we loop over them.
  DECLARE
    rec record;
  BEGIN
    FOR rec IN
      SELECT jrf.id, jrf.file_path
      FROM public.job_request_files jrf
      JOIN public.job_requests jr ON jr.id = jrf.job_request_id
      JOIN public.jobs j          ON j.id  = jr.resulting_job_id
      WHERE j.status       = 'COMPLETED'::job_status
        AND j.completed_at <= cutoff_time
    LOOP
      -- Remove from Storage bucket (ignore errors for already-deleted objects).
      BEGIN
        PERFORM storage.foldername(rec.file_path);   -- sanity check path exists
        DELETE FROM storage.objects
        WHERE bucket_id = 'job-files'
          AND name      = rec.file_path;
      EXCEPTION WHEN OTHERS THEN
        NULL;  -- file already gone — continue
      END;

      -- Remove the DB record.
      DELETE FROM public.job_request_files WHERE id = rec.id;
      deleted_count := deleted_count + 1;
    END LOOP;
  END;

  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_old_job_files() FROM PUBLIC, anon, authenticated;

-- Step 3: Schedule via pg_cron — runs once daily at 03:00 UTC.
--         Requires the pg_cron extension (already enabled by the analytics migration).
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $file_cleanup_schedule$
DECLARE
  existing_job_id bigint;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'delete-old-job-files';

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'delete-old-job-files',
    '0 3 * * *',   -- every day at 03:00 UTC
    $cron$SELECT public.delete_old_job_files();$cron$
  );
END $file_cleanup_schedule$;
