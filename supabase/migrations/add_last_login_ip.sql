-- Add last_login_ip and last_login_at for "login from new IP" notification
ALTER TABLE nlc_accounts
  ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN nlc_accounts.last_login_ip IS 'IP address of last login; used to detect and notify new device/location';
