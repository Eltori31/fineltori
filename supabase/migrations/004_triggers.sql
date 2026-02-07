-- ================================================
-- TRIGGERS
-- ================================================

-- ================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically update updated_at timestamp on row update';

-- ================================================
-- Apply updated_at triggers to tables
-- ================================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_connections_updated_at
  BEFORE UPDATE ON bank_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- TRIGGER: Auto-create profile on user signup
-- NOTE: This trigger must be created manually via Supabase Dashboard SQL Editor
-- because it requires elevated permissions on auth.users table
-- ================================================
-- To create this trigger, run this SQL in Supabase Dashboard > SQL Editor:
--
-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, full_name)
--   VALUES (
--     NEW.id,
--     NEW.email,
--     COALESCE(NEW.raw_user_meta_data->>'full_name', '')
--   );
--   RETURN NEW;
-- END;
-- $$;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_new_user();

-- ================================================
-- TRIGGER: Update balance history on account balance change
-- ================================================
CREATE OR REPLACE FUNCTION handle_account_balance_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only insert if balance actually changed
  IF OLD IS NULL OR OLD.balance != NEW.balance THEN
    INSERT INTO balance_history (account_id, balance, currency, recorded_at)
    VALUES (NEW.id, NEW.balance, NEW.currency, CURRENT_DATE)
    ON CONFLICT (account_id, recorded_at)
    DO UPDATE SET
      balance = EXCLUDED.balance,
      currency = EXCLUDED.currency;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_account_balance_change IS 'Automatically record balance history when account balance changes';

CREATE TRIGGER on_account_balance_change
  AFTER INSERT OR UPDATE OF balance ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION handle_account_balance_change();

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TRIGGER update_profiles_updated_at ON profiles IS 'Auto-update updated_at on profile changes';
COMMENT ON TRIGGER update_bank_connections_updated_at ON bank_connections IS 'Auto-update updated_at on connection changes';
COMMENT ON TRIGGER update_accounts_updated_at ON accounts IS 'Auto-update updated_at on account changes';
COMMENT ON TRIGGER update_transactions_updated_at ON transactions IS 'Auto-update updated_at on transaction changes';
COMMENT ON TRIGGER on_account_balance_change ON accounts IS 'Auto-record balance history on balance changes';
