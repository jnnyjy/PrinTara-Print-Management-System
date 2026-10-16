-- Run this once in the Supabase SQL Editor for the cashier checkout flow.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS amount_received numeric,
  ADD COLUMN IF NOT EXISTS change_amount numeric;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_amount_received_check'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_amount_received_check
      CHECK (amount_received IS NULL OR amount_received >= amount);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_change_amount_check'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_change_amount_check
      CHECK (change_amount IS NULL OR change_amount >= 0);
  END IF;
END $$;
