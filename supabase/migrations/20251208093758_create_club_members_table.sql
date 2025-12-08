-- Create club_members table for Sakina Club loyalty program
CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text,
  date_of_birth date,
  member_tier text DEFAULT 'bronze' NOT NULL, -- bronze, silver, gold, platinum
  points integer DEFAULT 0 NOT NULL,
  total_purchases numeric(10, 2) DEFAULT 0 NOT NULL,
  discount_percentage integer DEFAULT 0 NOT NULL, -- 0-100
  is_active boolean DEFAULT true NOT NULL,
  last_purchase_at timestamptz,
  birthday_bonus_claimed_at timestamptz,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES club_members(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_phone ON club_members(phone);
CREATE INDEX IF NOT EXISTS idx_club_members_email ON club_members(email);
CREATE INDEX IF NOT EXISTS idx_club_members_referral_code ON club_members(referral_code);
CREATE INDEX IF NOT EXISTS idx_club_members_member_tier ON club_members(member_tier);
CREATE INDEX IF NOT EXISTS idx_club_members_is_active ON club_members(is_active);

-- Enable RLS
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Public read access for active members (for referral codes, etc.)
CREATE POLICY "Allow public read access to active club members"
  ON club_members
  FOR SELECT
  TO public
  USING (is_active = true);

-- Members can read their own profile
CREATE POLICY "Members can read own profile"
  ON club_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR id = auth.uid());

-- Members can update their own profile (limited fields)
CREATE POLICY "Members can update own profile"
  ON club_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Public insert for registration (phone-based)
CREATE POLICY "Allow public registration for club members"
  ON club_members
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert own club member profile"
  ON club_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Admins can manage all club members
CREATE POLICY "Admins can manage club members"
  ON club_members
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_club_members_updated_at
  BEFORE UPDATE ON club_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM club_members WHERE referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate member tier based on total purchases
CREATE OR REPLACE FUNCTION calculate_member_tier(total_purchases_amount numeric)
RETURNS text AS $$
BEGIN
  IF total_purchases_amount >= 10000 THEN
    RETURN 'platinum';
  ELSIF total_purchases_amount >= 5000 THEN
    RETURN 'gold';
  ELSIF total_purchases_amount >= 2000 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate discount percentage based on tier
CREATE OR REPLACE FUNCTION get_discount_for_tier(tier text)
RETURNS integer AS $$
BEGIN
  CASE tier
    WHEN 'platinum' THEN RETURN 15;
    WHEN 'gold' THEN RETURN 10;
    WHEN 'silver' THEN RETURN 5;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tier and discount when total_purchases changes
CREATE OR REPLACE FUNCTION update_member_tier_and_discount()
RETURNS TRIGGER AS $$
DECLARE
  new_tier text;
  new_discount integer;
BEGIN
  -- Calculate new tier based on total purchases
  new_tier := calculate_member_tier(NEW.total_purchases);
  new_discount := get_discount_for_tier(new_tier);
  
  -- Update tier and discount
  NEW.member_tier := new_tier;
  NEW.discount_percentage := new_discount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tier_on_purchase
  BEFORE UPDATE OF total_purchases ON club_members
  FOR EACH ROW
  WHEN (OLD.total_purchases IS DISTINCT FROM NEW.total_purchases)
  EXECUTE FUNCTION update_member_tier_and_discount();

-- Create club_member_points_history table to track point transactions
CREATE TABLE IF NOT EXISTS club_member_points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES club_members(id) ON DELETE CASCADE NOT NULL,
  points_change integer NOT NULL, -- positive for earned, negative for spent
  reason text NOT NULL, -- 'purchase', 'referral', 'birthday_bonus', 'redemption', etc.
  order_id uuid, -- reference to payment/order if applicable
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_points_history_member_id ON club_member_points_history(member_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON club_member_points_history(created_at);

ALTER TABLE club_member_points_history ENABLE ROW LEVEL SECURITY;

-- Members can read their own points history
CREATE POLICY "Members can read own points history"
  ON club_member_points_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.id = club_member_points_history.member_id
      AND club_members.user_id = auth.uid()
    )
  );

-- Admins can manage all points history
CREATE POLICY "Admins can manage points history"
  ON club_member_points_history
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to add points to a member
CREATE OR REPLACE FUNCTION add_member_points(
  p_member_id uuid,
  p_points integer,
  p_reason text,
  p_order_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update member points
  UPDATE club_members
  SET points = points + p_points
  WHERE id = p_member_id;
  
  -- Record in history
  INSERT INTO club_member_points_history (member_id, points_change, reason, order_id)
  VALUES (p_member_id, p_points, p_reason, p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend points
CREATE OR REPLACE FUNCTION spend_member_points(
  p_member_id uuid,
  p_points integer,
  p_reason text,
  p_order_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  current_points integer;
BEGIN
  -- Get current points
  SELECT points INTO current_points
  FROM club_members
  WHERE id = p_member_id;
  
  -- Check if member has enough points
  IF current_points < p_points THEN
    RETURN false;
  END IF;
  
  -- Deduct points
  UPDATE club_members
  SET points = points - p_points
  WHERE id = p_member_id;
  
  -- Record in history
  INSERT INTO club_member_points_history (member_id, points_change, reason, order_id)
  VALUES (p_member_id, -p_points, p_reason, p_order_id);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

