// Powens API types

export interface PowernsAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface PowernsConnection {
  id: string
  user_id: string
  bank_id: string
  created_at: string
  updated_at: string
  last_sync: string | null
}

export interface PowernsAccount {
  id: string
  connection_id: string
  name: string
  balance: number
  currency: string
  type: string
  number: string | null
  iban: string | null
  bank: {
    id: string
    name: string
    logo_url: string | null
  }
  created_at: string
  updated_at: string
}

export interface PowernsTransaction {
  id: string
  account_id: string
  date: string
  value_date: string | null
  description: string
  original_description: string | null
  amount: number
  currency: string
  type: 'debit' | 'credit'
  state: 'pending' | 'completed' | 'cancelled'
  category: {
    id: number
    name: string
  } | null
  created_at: string
  updated_at: string
}

export interface PowernsWebhookEvent {
  id: string
  type: 'connection.created' | 'connection.updated' | 'connection.synced' | 'connection.error' | 'connection.deleted'
  user_id: string
  connection_id: string
  data: {
    status?: string
    error?: string
    accounts_count?: number
    transactions_count?: number
  }
  created_at: string
}

export interface PowernsConnectUrlResponse {
  url: string
  expires_at: string
}

export interface PowernsSyncResponse {
  status: 'success' | 'error' | 'in_progress'
  message?: string
  accounts_synced?: number
  transactions_synced?: number
}

export interface PowernsErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

// Powens webhook signature verification
export interface PowernsWebhookSignature {
  timestamp: string
  signature: string
}
