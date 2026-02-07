-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- ================================================
-- ENABLE RLS
-- ================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE powens_webhooks ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PROFILES POLICIES
-- ================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================================================
-- BANK CONNECTIONS POLICIES
-- ================================================
CREATE POLICY "Users can view own connections"
  ON bank_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON bank_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON bank_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON bank_connections FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- ACCOUNTS POLICIES
-- ================================================
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- TRANSACTIONS POLICIES
-- ================================================
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
        AND accounts.user_id = auth.uid()
    )
  );

-- ================================================
-- BALANCE HISTORY POLICIES
-- ================================================
CREATE POLICY "Users can view own balance history"
  ON balance_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = balance_history.account_id
        AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert balance history"
  ON balance_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = balance_history.account_id
    )
  );

-- ================================================
-- SYNC LOGS POLICIES
-- ================================================
CREATE POLICY "Users can view own sync logs"
  ON sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert sync logs"
  ON sync_logs FOR INSERT
  WITH CHECK (true);

-- ================================================
-- POWENS WEBHOOKS POLICIES
-- No user access - only service role can access
-- ================================================
CREATE POLICY "Service role only"
  ON powens_webhooks FOR ALL
  USING (false);

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Users can only see their own profile';
COMMENT ON POLICY "Users can view own connections" ON bank_connections IS 'Users can only see their own bank connections';
COMMENT ON POLICY "Users can view own accounts" ON accounts IS 'Users can only see their own accounts';
COMMENT ON POLICY "Users can view own transactions" ON transactions IS 'Users can only see transactions from their accounts';
COMMENT ON POLICY "Users can view own balance history" ON balance_history IS 'Users can only see balance history from their accounts';
COMMENT ON POLICY "Users can view own sync logs" ON sync_logs IS 'Users can only see their own sync logs';
COMMENT ON POLICY "Service role only" ON powens_webhooks IS 'Webhooks are only accessible by service role';
