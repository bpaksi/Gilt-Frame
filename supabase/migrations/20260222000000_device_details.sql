-- Drop the revoked column (hard delete replaces soft-revoke)
ALTER TABLE device_enrollments DROP COLUMN IF EXISTS revoked;

-- Add device metadata columns populated at enrollment claim time
ALTER TABLE device_enrollments
  ADD COLUMN IF NOT EXISTS device_details jsonb,
  ADD COLUMN IF NOT EXISTS device_name text,
  ADD COLUMN IF NOT EXISTS device_type text;
