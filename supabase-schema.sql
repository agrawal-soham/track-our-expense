-- TrackOurExpense Supabase / PostgreSQL Schema

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT DEFAULT '₹',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  pin TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid_by TEXT NOT NULL,
  split_between TEXT[] NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online')),
  remarks TEXT,
  category TEXT DEFAULT 'General',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS concerns (
  id TEXT PRIMARY KEY,
  expense_id TEXT REFERENCES expenses(id) ON DELETE CASCADE,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  raised_by TEXT NOT NULL,
  raised_by_name TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online')),
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_members_trip ON members(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_concerns_expense ON concerns(expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_trip ON settlements(trip_id);
