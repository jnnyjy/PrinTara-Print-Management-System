-- Run this once in the Supabase SQL Editor.
-- Allows the public submit form to create requests and upload their files.

ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_request_files ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE INSERT ON TABLE public.job_requests FROM anon, authenticated;
REVOKE INSERT ON TABLE public.job_request_files FROM anon, authenticated;

DROP POLICY IF EXISTS "Public can submit print requests" ON public.job_requests;

DROP POLICY IF EXISTS "Public can attach files to requests" ON public.job_request_files;

-- Ensure the storage bucket exists before creating its upload policy.
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-files', 'job-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can upload job files" ON storage.objects;
REVOKE INSERT ON storage.objects FROM anon, authenticated;
