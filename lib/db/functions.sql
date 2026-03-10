-- Function to credit wallet atomically
CREATE OR REPLACE FUNCTION credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_survey_id UUID,
  p_reference TEXT,
  p_description TEXT
)
RETURNS TABLE(new_balance NUMERIC, ledger_id UUID) AS $$
DECLARE
  v_new_balance NUMERIC;
  v_ledger_id UUID;
BEGIN
  -- Check for duplicate payment
  IF EXISTS (
    SELECT 1 FROM ledger
    WHERE user_id = p_user_id
    AND survey_id = p_survey_id
    AND type = 'credit'
  ) THEN
    RAISE EXCEPTION 'Duplicate payment for this survey';
  END IF;

  -- Update wallet balance
  UPDATE wallets
  SET balance = balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Create ledger entry
  INSERT INTO ledger (user_id, amount, type, survey_id, reference, description)
  VALUES (p_user_id, p_amount, 'credit', p_survey_id, p_reference, p_description)
  RETURNING id INTO v_ledger_id;

  RETURN QUERY SELECT v_new_balance, v_ledger_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile and wallet on user signup
CREATE OR REPLACE FUNCTION create_user_profile_and_wallet()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    'respondent', -- default role
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create wallet
  INSERT INTO wallets (user_id, balance, total_earned, total_withdrawn)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile and wallet on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_and_wallet();

-- Function to expire old sessions
CREATE OR REPLACE FUNCTION expire_old_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE survey_sessions
  SET status = 'expired'
  WHERE status = 'active'
  AND expires_at < CURRENT_TIMESTAMP;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
