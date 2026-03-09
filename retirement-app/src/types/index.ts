// ============================================================
// Retirement Tracker — Shared Types
// ============================================================

export type AccountType = 'depository' | 'investment' | 'credit' | 'loan' | 'other'
export type AccountSubtype =
  | 'checking'
  | 'savings'
  | 'money_market'
  | '401k'
  | 'roth'
  | 'ira'
  | 'brokerage'
  | 'hsa'
  | 'credit_card'
  | 'mortgage'
  | 'student'
  | 'auto'
  | 'other'

export interface Profile {
  id: string
  email: string
  full_name?: string
  birth_year: number
  target_retirement_year: number
  target_retirement_age: number
  target_country: string
  monthly_korea_budget_usd: number
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  plaid_item_id?: string
  plaid_account_id?: string
  name: string
  official_name?: string
  type: AccountType
  subtype?: AccountSubtype
  institution_name?: string
  currency_code: string
  is_manual: boolean
  is_active: boolean
  is_tax_advantaged: boolean
  is_roth: boolean
  is_pretax: boolean
  created_at: string
  updated_at: string
  // joined
  current_balance?: number
  available_balance?: number
}

export interface AccountBalance {
  id: string
  account_id: string
  user_id: string
  balance_date: string
  current_balance: number
  available_balance?: number
  source: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  plaid_transaction_id?: string
  amount: number
  date: string
  name: string
  merchant_name?: string
  category?: string[]
  primary_category?: string
  detailed_category?: string
  pending: boolean
  currency_code: string
  custom_category?: string
  notes?: string
}

export interface NetWorthSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  total_assets: number
  total_liabilities: number
  net_worth: number
  retirement_assets: number
  taxable_investments: number
  cash_savings: number
  real_estate: number
  other_assets: number
  credit_card_debt: number
  loans: number
}

export interface RetirementGoal {
  id: string
  user_id: string
  label: string
  goal_type: 'monthly_income' | 'lump_sum' | 'emergency_fund'
  target_amount_usd?: number
  target_monthly_usd?: number
  currency: string
  is_korea_specific: boolean
  target_amount_krw?: number
  notes?: string
  is_active: boolean
}

export interface SpendingByCategory {
  primary_category: string
  month: string
  total_spent: number
  transaction_count: number
}

export interface RetirementProjection {
  currentNetWorth: number
  targetNetWorth: number          // 25x annual expenses rule
  yearsToRetirement: number
  projectedNetWorthAtRetirement: number
  monthlyContributionNeeded: number
  koreaMonthlyBudgetUSD: number
  koreaMonthlyBudgetKRW: number
  annualExpensesInRetirement: number
  fiNumber: number                // 25x annual expenses
  progressPercent: number
  onTrack: boolean
}

export interface PlaidLinkMetadata {
  institution: {
    name: string
    institution_id: string
  }
  accounts: Array<{
    id: string
    name: string
    type: string
    subtype: string
  }>
}
