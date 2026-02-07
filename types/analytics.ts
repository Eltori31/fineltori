// Analytics and dashboard data types

export interface DashboardStats {
  totalNetWorth: number
  monthlyChange: number
  monthlyChangePercent: number
  totalAccounts: number
  lastSyncDate: Date | null
}

export interface NetWorthData {
  date: string
  value: number
}

export interface AssetAllocation {
  type: string
  value: number
  percentage: number
  color: string
}

export interface AccountSummary {
  totalAccounts: number
  totalBalance: number
  totalAssets: number
  totalLiabilities: number
  lastSyncDate: Date | null
}

export interface CategoryBreakdown {
  category: string
  amount: number
  count: number
  percentage: number
}

export interface MonthlyFlow {
  month: string
  income: number
  expenses: number
  net: number
}

export interface BalanceEvolution {
  date: string
  balance: number
  accountId: string
  accountName: string
}
