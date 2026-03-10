-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (User info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('respondent', 'researcher')),
  college TEXT,
  department TEXT,
  level TEXT,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  google_form_url TEXT,
  google_sheet_url TEXT NOT NULL,
  reward NUMERIC(10, 2) NOT NULL CHECK (reward > 0),
  response_cap INTEGER NOT NULL CHECK (response_cap > 0),
  responses_count INTEGER DEFAULT 0,
  target_college TEXT,
  target_department TEXT,
  target_level TEXT,
  estimated_time INTEGER DEFAULT 5,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'funded', 'active', 'completed', 'archived')),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Survey sessions (Track active surveys per user)
CREATE TABLE IF NOT EXISTS public.survey_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 minutes',
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partial unique index for one active session per user
CREATE UNIQUE INDEX IF NOT EXISTS one_active_session_per_user 
ON public.survey_sessions(user_id, survey_id) 
WHERE status = 'active';

-- Wallets table (One per user)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(15, 2) DEFAULT 0 CHECK (balance >= 0),
  total_earned NUMERIC(15, 2) DEFAULT 0,
  total_withdrawn NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ledger table (Transaction history)
CREATE TABLE IF NOT EXISTS public.ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  reference TEXT,
  description TEXT,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 500),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  korapay_reference TEXT,
  error_message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (Researcher funding)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  platform_fee NUMERIC(15, 2) DEFAULT 0,
  total_amount NUMERIC(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  korapay_reference TEXT UNIQUE,
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User responses table (Track who completed what survey)
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.survey_sessions(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  submission_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  response_data JSONB,
  verified BOOLEAN DEFAULT FALSE,
  payment_processed BOOLEAN DEFAULT FALSE,
  payment_amount NUMERIC(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_survey_user UNIQUE (survey_id, user_id)
);

-- Fraud logs table
CREATE TABLE IF NOT EXISTS public.fraud_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE SET NULL,
  fraud_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_surveys_creator_id ON public.surveys(creator_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_user_id ON public.survey_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_survey_id ON public.survey_sessions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_status ON public.survey_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_payments_researcher_id ON public.payments(researcher_id);
CREATE INDEX IF NOT EXISTS idx_payments_survey_id ON public.payments(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON public.survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user_id ON public.fraud_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_created_at ON public.fraud_logs(created_at);

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist (safe re-run)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    DROP POLICY "Users can read own profile" ON public.profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    DROP POLICY "Users can update own profile" ON public.profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'surveys' AND policyname = 'Anyone can read active surveys'
  ) THEN
    DROP POLICY "Anyone can read active surveys" ON public.surveys;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'surveys' AND policyname = 'Researchers can read own surveys'
  ) THEN
    DROP POLICY "Researchers can read own surveys" ON public.surveys;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'surveys' AND policyname = 'Researchers can create surveys'
  ) THEN
    DROP POLICY "Researchers can create surveys" ON public.surveys;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'surveys' AND policyname = 'Researchers can update own surveys'
  ) THEN
    DROP POLICY "Researchers can update own surveys" ON public.surveys;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'wallets' AND policyname = 'Users can read own wallet'
  ) THEN
    DROP POLICY "Users can read own wallet" ON public.wallets;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'wallets' AND policyname = 'Users can update own wallet'
  ) THEN
    DROP POLICY "Users can update own wallet" ON public.wallets;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ledger' AND policyname = 'Users can read own ledger'
  ) THEN
    DROP POLICY "Users can read own ledger" ON public.ledger;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'withdrawals' AND policyname = 'Users can read own withdrawals'
  ) THEN
    DROP POLICY "Users can read own withdrawals" ON public.withdrawals;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'withdrawals' AND policyname = 'Users can create withdrawals'
  ) THEN
    DROP POLICY "Users can create withdrawals" ON public.withdrawals;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'withdrawals' AND policyname = 'Users can update own withdrawals'
  ) THEN
    DROP POLICY "Users can update own withdrawals" ON public.withdrawals;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'survey_responses' AND policyname = 'Users can read own responses'
  ) THEN
    DROP POLICY "Users can read own responses" ON public.survey_responses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'survey_responses' AND policyname = 'Users can create responses'
  ) THEN
    DROP POLICY "Users can create responses" ON public.survey_responses;
  END IF;
END $$;

-- Profiles RLS
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Surveys RLS
CREATE POLICY "Anyone can read active surveys" ON public.surveys
  FOR SELECT USING (status = 'active' AND is_deleted = FALSE);

CREATE POLICY "Researchers can read own surveys" ON public.surveys
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Researchers can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Researchers can update own surveys" ON public.surveys
  FOR UPDATE USING (creator_id = auth.uid());

-- Wallets RLS
CREATE POLICY "Users can read own wallet" ON public.wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallet" ON public.wallets
  FOR UPDATE USING (user_id = auth.uid());

-- Ledger RLS
CREATE POLICY "Users can read own ledger" ON public.ledger
  FOR SELECT USING (user_id = auth.uid());

-- Withdrawals RLS
CREATE POLICY "Users can read own withdrawals" ON public.withdrawals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own withdrawals" ON public.withdrawals
  FOR UPDATE USING (user_id = auth.uid());

-- Survey responses RLS
CREATE POLICY "Users can read own responses" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create responses" ON public.survey_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());
