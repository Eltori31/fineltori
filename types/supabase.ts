import { Database } from './database'

// Helper types for working with Supabase tables
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type BankConnection = Database['public']['Tables']['bank_connections']['Row']
export type BankConnectionInsert = Database['public']['Tables']['bank_connections']['Insert']
export type BankConnectionUpdate = Database['public']['Tables']['bank_connections']['Update']

export type Account = Database['public']['Tables']['accounts']['Row']
export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type BalanceHistory = Database['public']['Tables']['balance_history']['Row']
export type BalanceHistoryInsert = Database['public']['Tables']['balance_history']['Insert']
export type BalanceHistoryUpdate = Database['public']['Tables']['balance_history']['Update']

export type SyncLog = Database['public']['Tables']['sync_logs']['Row']
export type SyncLogInsert = Database['public']['Tables']['sync_logs']['Insert']
export type SyncLogUpdate = Database['public']['Tables']['sync_logs']['Update']

// Composite types with relations
export type AccountWithConnection = Account & {
  connection: BankConnection | null
}

export type TransactionWithAccount = Transaction & {
  account: Account
}

// Account types enum
export type AccountType = Account['type']

// Connection status enum
export type ConnectionStatus = BankConnection['status']

// Sync status enum
export type SyncStatus = SyncLog['status']
