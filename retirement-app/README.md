# Retire 2035 — Personal Retirement Tracker

A personalized early-retirement tracking web app for a Korean-American planning to retire at 50 in 2035 and move to Korea.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Bank Data | Plaid API |
| AI Advisor | Claude API (claude-opus-4-6) |
| Charts | Recharts |

## Features

### 📊 Dashboard
- Net worth summary across all accounts
- FI (Financial Independence) progress ring
- Retirement countdown to Jan 1, 2035
- Account breakdown with per-account % of net worth

### 💰 Net Worth Tracker
- 7-month historical chart (area + line views)
- Breakdown by: retirement accounts, taxable investments, cash
- Per-account balance table with month-over-month change
- Connect accounts via Plaid (+12,000 institutions)

### 💳 Spending Analysis (6-Month)
- Stacked bar chart by category over 6 months
- Pie chart for current month breakdown
- Budget vs actual (6-month average)
- Recent transactions table
- Korea budget target comparison ($3,000/mo)

### 🏖️ Retirement Dashboard
- **Korea View**: Detailed monthly cost-of-living breakdown in USD + KRW
  - Housing, Food, NHI healthcare, Transport, etc.
  - Key expat considerations (tax treaty, visa, FBAR)
- **Family View**: Income sources + risk factor matrix
- Interactive budget slider (see how budget changes affect FI number)
- Net worth projection chart through 2045
- FI number calculator (25× annual expenses)

### 🤖 AI Financial Advisor (Claude)
- Personalized advice based on your actual financial data
- Context-aware: knows your accounts, net worth, spending, Korea plans
- Suggested questions: Roth ladder, healthcare, tax treaty, etc.
- Logs all conversations to Supabase for history

### 🏦 Accounts
- Connected accounts with real-time balances
- Manual sync trigger
- Plaid integration for 12,000+ institutions

## User Context

- Korean-American, born 1985 (age ~40 in 2025)
- Target: retire at 50 on January 1, 2035
- Moving to Korea after retirement
- Monthly Korea budget: $3,000/month (~₩3,960,000)
- Accounts:
  - Fidelity 401(k) — pretax, $112,400
  - Robinhood Roth IRA — tax-free, $48,200
  - E*Trade Brokerage — taxable, $63,900
  - SoFi High-Yield Savings — 4.6% APY, $38,100
  - Bank of America Checking — $24,900

## Quick Start

### 1. Install dependencies
```bash
cd retirement-app
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### 3. Set up Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run the schema: `supabase/schema.sql` in the SQL editor
3. Copy your project URL and keys to `.env.local`

### 4. Set up Plaid
1. Sign up at [plaid.com](https://plaid.com) (free Sandbox tier)
2. Copy Client ID and Sandbox Secret to `.env.local`
3. Set `PLAID_ENV=sandbox` for testing

### 5. Set up Claude API
1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Copy to `ANTHROPIC_API_KEY` in `.env.local`

### 6. Run the app
```bash
npm run dev
# Open http://localhost:3000
```

## Database Schema

Key tables:
- `profiles` — user profile + retirement settings
- `plaid_items` — linked financial institution connections
- `accounts` — individual bank/brokerage accounts
- `account_balances` — daily balance snapshots
- `transactions` — synced from Plaid
- `net_worth_snapshots` — daily aggregated net worth
- `retirement_goals` — FI targets
- `ai_advice_log` — Claude conversation history
- `spending_budgets` — monthly category budgets

All tables have Row Level Security (RLS) enabled — users only see their own data.

## Retirement Math

- **FI Number** = 25× annual expenses (based on 4% safe withdrawal rate)
- **Projection** = current NW × (1.07)^years + monthly contributions × FV annuity factor
- **Korea budget** = default $3,000/month = ~₩3,960,000 (at 1,320 KRW/USD)

## Key Considerations for Korea Retirement

1. **Roth Conversion Ladder**: Start 5+ years before retirement to access 401k penalty-free
2. **Healthcare**: ACA bridge from 50–65, then Medicare. Korea NHI ~$80–200/month for expats
3. **Tax Treaty**: US-Korea DTA covers 401k distributions (taxed in US) and Roth (tax-free)
4. **Visa**: F-2 spousal, F-4 ethnic Korean, or D-10 job seeker visa for long-term residence
5. **Banking**: FBAR required for Korean accounts > $10,000. Consider Charles Schwab (no foreign ATM fees)
