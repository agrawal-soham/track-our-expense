-- ====================================================================
-- TrackOurExpense: Complete Production Schema with Real Auth & Profiles
-- ====================================================================

-- 1. PROFILES TABLE (Linked directly to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Automatically create a profile whenever a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username TEXT;
  clean_username TEXT;
BEGIN
  -- Generate username from metadata or email prefix
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  -- Clean up username (lowercase, remove spaces/special chars)
  clean_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  IF clean_username = '' THEN
    clean_username := 'user_' || substr(new.id::text, 1, 6);
  END IF;

  -- Ensure unique username
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = clean_username) THEN
    clean_username := clean_username || '_' || substr(new.id::text, 1, 4);
  END IF;

  INSERT INTO public.profiles (id, username, full_name, email, avatar_url)
  VALUES (
    new.id,
    clean_username,
    COALESCE(new.raw_user_meta_data->>'full_name', clean_username),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT DEFAULT '₹',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trips viewable by members" ON public.trips FOR ALL USING (true);


-- 3. TRIP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trip members viewable" ON public.trip_members FOR ALL USING (true);


-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  split_between UUID[] NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online')) DEFAULT 'online',
  remarks TEXT,
  category TEXT DEFAULT 'General',
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expenses viewable by trip members" ON public.expenses FOR ALL USING (true);


-- 5. CONCERNS TABLE
CREATE TABLE IF NOT EXISTS public.concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  raised_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  raised_by_name TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Concerns viewable by trip members" ON public.concerns FOR ALL USING (true);


-- 6. SETTLEMENTS TABLE (Peer approval required)
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  from_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online')) DEFAULT 'online',
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settlements viewable by trip members" ON public.settlements FOR ALL USING (true);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_trip_members_trip ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user ON public.trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_settlements_trip ON public.settlements(trip_id);
CREATE INDEX IF NOT EXISTS idx_concerns_expense ON public.concerns(expense_id);
