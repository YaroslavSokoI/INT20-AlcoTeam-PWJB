-- Add user metadata columns to sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS ip          TEXT,
  ADD COLUMN IF NOT EXISTS os          TEXT,
  ADD COLUMN IF NOT EXISTS browser     TEXT,
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS language    TEXT,
  ADD COLUMN IF NOT EXISTS referrer    TEXT,
  ADD COLUMN IF NOT EXISTS utm_source  TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium  TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS in_app      TEXT;
