-- Allow buyer accounts to claim their own leads so profiles persist across sessions.
-- Nullable so existing anonymous leads continue to work.

ALTER TABLE buyer_leads
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE SET NULL;

-- Buyers can read their own lead rows (needed for getBuyerProfile query)
CREATE POLICY "buyer can read own lead" ON buyer_leads
  FOR SELECT
  USING (auth.uid() = user_id);
