-- ============================================================================
-- PrinTara: Fix Trigger on `jobs` and `job_requests`
-- 
-- Problem:
-- When a new job is created from an accepted job_request, the BEFORE INSERT
-- trigger unconditionally generated a new order code (e.g. PRT-1616),
-- overriding the original customer's tracking reference (e.g. PRT-8304).
--
-- Solution:
-- Update the trigger function so it only generates a code if NEW.order_code
-- is NULL or empty. When an order_code is provided (like when moving
-- to PRINTING), it preserves the customer's reference number.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_job_order_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_code IS NULL OR TRIM(NEW.order_code) = '' THEN
    NEW.order_code := 'PRT-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger if existing
DROP TRIGGER IF EXISTS trigger_set_job_order_code ON public.jobs;
CREATE TRIGGER trigger_set_job_order_code
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_job_order_code();
