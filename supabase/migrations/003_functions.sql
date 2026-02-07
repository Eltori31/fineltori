-- ================================================
-- DATABASE FUNCTIONS
-- ================================================

-- ================================================
-- FUNCTION: Calculate total net worth for a user
-- ================================================
CREATE OR REPLACE FUNCTION calculate_net_worth(p_user_id UUID)
RETURNS DECIMAL(15, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total DECIMAL(15, 2);
BEGIN
  SELECT COALESCE(SUM(balance), 0)
  INTO total
  FROM accounts
  WHERE user_id = p_user_id
    AND is_included_in_networth = true;

  RETURN total;
END;
$$;

COMMENT ON FUNCTION calculate_net_worth IS 'Calculate total net worth for a user including only accounts marked for inclusion';

-- ================================================
-- FUNCTION: Record daily balance snapshot
-- ================================================
CREATE OR REPLACE FUNCTION record_balance_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO balance_history (account_id, balance, currency, recorded_at)
  SELECT
    id,
    balance,
    currency,
    CURRENT_DATE
  FROM accounts
  WHERE balance IS NOT NULL
  ON CONFLICT (account_id, recorded_at)
  DO UPDATE SET
    balance = EXCLUDED.balance,
    currency = EXCLUDED.currency;
END;
$$;

COMMENT ON FUNCTION record_balance_snapshot IS 'Record current balance for all accounts - run daily via cron';

-- ================================================
-- FUNCTION: Get asset allocation for a user
-- ================================================
CREATE OR REPLACE FUNCTION get_asset_allocation(p_user_id UUID)
RETURNS TABLE (
  account_type TEXT,
  total_amount DECIMAL(15, 2),
  percentage DECIMAL(5, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_net_worth DECIMAL(15, 2);
BEGIN
  -- Calculate total net worth
  total_net_worth := calculate_net_worth(p_user_id);

  -- Return allocation breakdown
  RETURN QUERY
  SELECT
    a.type as account_type,
    SUM(a.balance) as total_amount,
    CASE
      WHEN total_net_worth > 0 THEN (SUM(a.balance) / total_net_worth * 100)
      ELSE 0
    END as percentage
  FROM accounts a
  WHERE a.user_id = p_user_id
    AND a.is_included_in_networth = true
  GROUP BY a.type
  ORDER BY total_amount DESC;
END;
$$;

COMMENT ON FUNCTION get_asset_allocation IS 'Get asset allocation breakdown by account type for a user';

-- ================================================
-- FUNCTION: Get net worth evolution for a user
-- ================================================
CREATE OR REPLACE FUNCTION get_net_worth_evolution(
  p_user_id UUID,
  p_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  date DATE,
  net_worth DECIMAL(15, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      CURRENT_DATE - p_days,
      CURRENT_DATE,
      '1 day'::interval
    )::DATE as date
  ),
  daily_balances AS (
    SELECT
      bh.recorded_at,
      SUM(bh.balance) as total_balance
    FROM balance_history bh
    INNER JOIN accounts a ON a.id = bh.account_id
    WHERE a.user_id = p_user_id
      AND a.is_included_in_networth = true
      AND bh.recorded_at >= CURRENT_DATE - p_days
    GROUP BY bh.recorded_at
  )
  SELECT
    dr.date,
    COALESCE(db.total_balance, 0) as net_worth
  FROM date_range dr
  LEFT JOIN daily_balances db ON db.recorded_at = dr.date
  ORDER BY dr.date;
END;
$$;

COMMENT ON FUNCTION get_net_worth_evolution IS 'Get daily net worth evolution for the past N days';

-- ================================================
-- FUNCTION: Get transactions with filters
-- ================================================
CREATE OR REPLACE FUNCTION get_transactions(
  p_user_id UUID,
  p_account_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  account_id UUID,
  account_name TEXT,
  date DATE,
  description TEXT,
  amount DECIMAL(15, 2),
  currency TEXT,
  category TEXT,
  is_pending BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.account_id,
    a.name as account_name,
    t.date,
    COALESCE(t.user_description, t.description) as description,
    t.amount,
    t.currency,
    COALESCE(t.user_category, t.category) as category,
    t.is_pending,
    t.created_at
  FROM transactions t
  INNER JOIN accounts a ON a.id = t.account_id
  WHERE a.user_id = p_user_id
    AND (p_account_id IS NULL OR t.account_id = p_account_id)
    AND (p_start_date IS NULL OR t.date >= p_start_date)
    AND (p_end_date IS NULL OR t.date <= p_end_date)
    AND (p_category IS NULL OR COALESCE(t.user_category, t.category) = p_category)
  ORDER BY t.date DESC, t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION get_transactions IS 'Get filtered transactions for a user with pagination';

-- ================================================
-- FUNCTION: Get account summary statistics
-- ================================================
CREATE OR REPLACE FUNCTION get_account_summary(p_user_id UUID)
RETURNS TABLE (
  total_accounts INTEGER,
  total_balance DECIMAL(15, 2),
  total_assets DECIMAL(15, 2),
  total_liabilities DECIMAL(15, 2),
  last_sync_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_accounts,
    SUM(balance) as total_balance,
    SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END) as total_assets,
    SUM(CASE WHEN balance < 0 THEN ABS(balance) ELSE 0 END) as total_liabilities,
    MAX(bc.last_sync_at) as last_sync_date
  FROM accounts a
  LEFT JOIN bank_connections bc ON bc.id = a.connection_id
  WHERE a.user_id = p_user_id
    AND a.is_included_in_networth = true;
END;
$$;

COMMENT ON FUNCTION get_account_summary IS 'Get summary statistics for all user accounts';
