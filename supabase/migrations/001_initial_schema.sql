-- ================================================
-- INITIAL SCHEMA - Tables de base
-- ================================================

-- ================================================
-- PROFILES TABLE
-- ================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- BANK CONNECTIONS TABLE
-- ================================================
CREATE TABLE bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  powens_connection_id TEXT NOT NULL UNIQUE,
  bank_name TEXT NOT NULL,
  bank_logo_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'error', 'disconnected', 'pending')),
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- ACCOUNTS TABLE
-- ================================================
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES bank_connections(id) ON DELETE CASCADE,
  powens_account_id TEXT,

  -- Account details
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'checking', 'savings', 'investment', 'crypto',
    'real_estate', 'loan', 'credit_card', 'other'
  )),
  institution_name TEXT,

  -- Balance information
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Metadata
  is_manual BOOLEAN NOT NULL DEFAULT false,
  is_included_in_networth BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(powens_account_id)
);

-- ================================================
-- TRANSACTIONS TABLE
-- ================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  powens_transaction_id TEXT,

  -- Transaction details
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Categorization
  category TEXT,
  subcategory TEXT,
  tags TEXT[],

  -- Status
  is_pending BOOLEAN NOT NULL DEFAULT false,
  is_manual BOOLEAN NOT NULL DEFAULT false,

  -- User modifications
  user_description TEXT,
  user_category TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(powens_transaction_id)
);

-- ================================================
-- BALANCE HISTORY TABLE (for net worth evolution)
-- ================================================
CREATE TABLE balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  recorded_at DATE NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(account_id, recorded_at)
);

-- ================================================
-- SYNC LOGS TABLE (audit trail for syncs)
-- ================================================
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES bank_connections(id) ON DELETE SET NULL,

  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  accounts_synced INTEGER DEFAULT 0,
  transactions_synced INTEGER DEFAULT 0,
  error_message TEXT,

  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- POWENS WEBHOOKS TABLE (for idempotency)
-- ================================================
CREATE TABLE powens_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_connection_id ON accounts(connection_id);
CREATE INDEX idx_accounts_powens_id ON accounts(powens_account_id) WHERE powens_account_id IS NOT NULL;

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category) WHERE category IS NOT NULL;
CREATE INDEX idx_transactions_powens_id ON transactions(powens_transaction_id) WHERE powens_transaction_id IS NOT NULL;

CREATE INDEX idx_balance_history_account_date ON balance_history(account_id, recorded_at DESC);

CREATE INDEX idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_powens_id ON bank_connections(powens_connection_id);

CREATE INDEX idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at DESC);

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE bank_connections IS 'Connections to banks via Powens';
COMMENT ON TABLE accounts IS 'User accounts (bank, investment, manual)';
COMMENT ON TABLE transactions IS 'All financial transactions';
COMMENT ON TABLE balance_history IS 'Historical balance snapshots for charts';
COMMENT ON TABLE sync_logs IS 'Audit trail of Powens synchronizations';
COMMENT ON TABLE powens_webhooks IS 'Powens webhook events for idempotency';
