-- Create OTP codes table for club member authentication
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false NOT NULL,
  attempts integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow public to insert OTP codes (for requesting OTP)
CREATE POLICY "Allow public to create OTP codes"
  ON otp_codes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read and update OTP codes (for verification)
CREATE POLICY "Allow public to verify OTP codes"
  ON otp_codes
  FOR ALL
  TO public
  USING (expires_at > now() AND verified = false)
  WITH CHECK (expires_at > now() AND verified = false);

-- Function to clean up expired OTP codes (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to generate a random 6-digit OTP code
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS text AS $$
BEGIN
  -- Generate a random 6-digit code
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

