/*
  # Golf Charity Subscription Platform Database Schema

  ## Overview
  Complete database schema for a golf charity subscription platform with draw-based winnings,
  charity contributions, and comprehensive admin management.

  ## New Tables

  ### `profiles`
  Extends auth.users with platform-specific data
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - 'subscriber' or 'admin'
  - `subscription_status` (text) - 'active', 'inactive', 'cancelled'
  - `subscription_plan` (text) - 'monthly' or 'yearly'
  - `subscription_start_date` (timestamptz)
  - `subscription_end_date` (timestamptz)
  - `stripe_customer_id` (text)
  - `stripe_subscription_id` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `charities`
  Charity organizations in the platform
  - `id` (uuid, PK)
  - `name` (text)
  - `description` (text)
  - `logo_url` (text)
  - `website` (text)
  - `category` (text) - e.g., 'health', 'education', 'environment'
  - `is_featured` (boolean)
  - `total_received` (numeric) - total donations received
  - `created_at` (timestamptz)

  ### `user_charity_selections`
  User's charity selection and contribution percentage
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `charity_id` (uuid, FK to charities)
  - `percentage` (integer) - minimum 10, maximum 100
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `scores`
  User golf scores in Stableford format (last 5 per user)
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `score` (integer)
  - `date_played` (date)
  - `created_at` (timestamptz)

  ### `draws`
  Monthly draw executions and results
  - `id` (uuid, PK)
  - `draw_date` (date)
  - `draw_month` (text) - e.g., '2024-03'
  - `total_prize_pool` (numeric)
  - `is_published` (boolean)
  - `winning_numbers` (jsonb) - array of 5 numbers
  - `jackpot_rollover` (numeric)
  - `created_at` (timestamptz)

  ### `winners`
  Winner records for each draw
  - `id` (uuid, PK)
  - `draw_id` (uuid, FK to draws)
  - `user_id` (uuid, FK to profiles)
  - `match_type` (text) - '5-match', '4-match', '3-match'
  - `prize_amount` (numeric)
  - `user_numbers` (jsonb) - the winning score combination
  - `verification_status` (text) - 'pending', 'approved', 'rejected'
  - `proof_screenshot_url` (text)
  - `payment_status` (text) - 'pending', 'completed'
  - `admin_notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read own, admins can read/update all
  - Charities: Public read, admin write
  - User charity selections: Users manage own, admins read all
  - Scores: Users manage own last 5, admins can edit all
  - Draws: Public read published draws, admins manage all
  - Winners: Users read own, upload proof; admins manage all
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'subscriber',
  subscription_status text NOT NULL DEFAULT 'inactive',
  subscription_plan text,
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create charities table
CREATE TABLE IF NOT EXISTS charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  category text NOT NULL,
  is_featured boolean DEFAULT false,
  total_received numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_charity_selections table
CREATE TABLE IF NOT EXISTS user_charity_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id uuid NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  percentage integer NOT NULL DEFAULT 10 CHECK (percentage >= 10 AND percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 72),
  date_played date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create index on scores for efficient querying
CREATE INDEX IF NOT EXISTS idx_scores_user_created ON scores(user_id, created_at DESC);

-- Create draws table
CREATE TABLE IF NOT EXISTS draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_date date NOT NULL DEFAULT CURRENT_DATE,
  draw_month text NOT NULL,
  total_prize_pool numeric DEFAULT 0,
  is_published boolean DEFAULT false,
  winning_numbers jsonb NOT NULL,
  jackpot_rollover numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create winners table
CREATE TABLE IF NOT EXISTS winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_type text NOT NULL,
  prize_amount numeric NOT NULL,
  user_numbers jsonb NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending',
  proof_screenshot_url text,
  payment_status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Charities policies (public read, admin write)
CREATE POLICY "Anyone can read charities"
  ON charities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert charities"
  ON charities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update charities"
  ON charities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete charities"
  ON charities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- User charity selections policies
CREATE POLICY "Users can read own charity selection"
  ON user_charity_selections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charity selection"
  ON user_charity_selections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charity selection"
  ON user_charity_selections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all charity selections"
  ON user_charity_selections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Scores policies
CREATE POLICY "Users can read own scores"
  ON scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores"
  ON scores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all scores"
  ON scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all scores"
  ON scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all scores"
  ON scores FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Draws policies (public read for published, admin full access)
CREATE POLICY "Anyone can read published draws"
  ON draws FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can read all draws"
  ON draws FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert draws"
  ON draws FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update draws"
  ON draws FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Winners policies
CREATE POLICY "Users can read own winner records"
  ON winners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own winner proof"
  ON winners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND verification_status = 'pending');

CREATE POLICY "Admins can read all winners"
  ON winners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert winners"
  ON winners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all winners"
  ON winners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to maintain only last 5 scores per user
CREATE OR REPLACE FUNCTION public.maintain_score_limit()
RETURNS trigger AS $$
BEGIN
  -- Delete oldest scores if user has more than 5
  DELETE FROM scores
  WHERE id IN (
    SELECT id FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to maintain score limit
DROP TRIGGER IF EXISTS maintain_score_limit_trigger ON scores;
CREATE TRIGGER maintain_score_limit_trigger
  AFTER INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION public.maintain_score_limit();

-- Insert sample charities
INSERT INTO charities (name, description, logo_url, category, is_featured) VALUES
  ('Global Health Initiative', 'Providing healthcare access to underserved communities worldwide', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=200', 'health', true),
  ('Education for All', 'Building schools and providing educational resources in developing regions', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=200', 'education', true),
  ('Clean Water Project', 'Bringing clean water access to communities in need', 'https://images.pexels.com/photos/2990644/pexels-photo-2990644.jpeg?auto=compress&cs=tinysrgb&w=200', 'environment', false),
  ('Wildlife Conservation Fund', 'Protecting endangered species and their habitats', 'https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&w=200', 'environment', true),
  ('Youth Sports Development', 'Providing sports programs and equipment for underprivileged youth', 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=200', 'youth', false),
  ('Hunger Relief Network', 'Fighting food insecurity in local and global communities', 'https://images.pexels.com/photos/6646906/pexels-photo-6646906.jpeg?auto=compress&cs=tinysrgb&w=200', 'humanitarian', false),
  ('Mental Health Support', 'Providing mental health resources and counseling services', 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=200', 'health', false),
  ('Veterans Assistance Program', 'Supporting veterans with housing, healthcare, and employment', 'https://images.pexels.com/photos/9815995/pexels-photo-9815995.jpeg?auto=compress&cs=tinysrgb&w=200', 'humanitarian', false)
ON CONFLICT DO NOTHING;
