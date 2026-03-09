-- ============================================================
-- Retirement Tracker — Supabase Schema
-- User: Korean-American, retiring at 50 in 2035, moving to Korea
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  birth_year int default 1985,             -- target retirement at 50 in 2035
  target_retirement_year int default 2035,
  target_retirement_age int default 50,
  target_country text default 'Korea',
  monthly_korea_budget_usd numeric(12,2) default 3000,  -- estimated monthly budget in Korea (USD)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- PLAID ITEMS (linked bank/brokerage connections)
-- ============================================================
create table public.plaid_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plaid_item_id text unique not null,
  plaid_access_token text not null,       -- store encrypted in production
  institution_id text,
  institution_name text,                  -- e.g. "Fidelity", "Robinhood", "E*Trade", "SoFi", "Bank of America"
  is_active boolean default true,
  cursor text,                            -- Plaid transactions sync cursor
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.plaid_items enable row level security;
create policy "Users can manage own plaid items" on public.plaid_items
  for all using (auth.uid() = user_id);

-- ============================================================
-- ACCOUNTS (individual accounts from Plaid)
-- ============================================================
create type account_type as enum (
  'depository',    -- checking, savings
  'investment',    -- brokerage, 401k, IRA
  'credit',
  'loan',
  'other'
);

create type account_subtype as enum (
  'checking',
  'savings',
  'money_market',
  '401k',
  'roth',          -- Roth IRA
  'ira',
  'brokerage',
  'hsa',
  'credit_card',
  'mortgage',
  'student',
  'auto',
  'other'
);

create table public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plaid_item_id uuid references public.plaid_items(id) on delete cascade,
  plaid_account_id text unique,
  name text not null,                     -- e.g. "Fidelity 401(k)", "Robinhood Roth IRA"
  official_name text,
  type account_type not null default 'other',
  subtype account_subtype,
  institution_name text,                  -- denormalized for easy display
  currency_code text default 'USD',
  is_manual boolean default false,        -- manually entered vs Plaid-connected
  is_active boolean default true,
  -- Tax treatment flags
  is_tax_advantaged boolean default false,  -- 401k, IRA, Roth
  is_roth boolean default false,
  is_pretax boolean default false,          -- traditional 401k/IRA
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.accounts enable row level security;
create policy "Users can manage own accounts" on public.accounts
  for all using (auth.uid() = user_id);

-- Pre-seed account types for our user
comment on table public.accounts is
  'Known accounts: Fidelity 401k (pretax), Robinhood Roth IRA (roth), E*Trade brokerage, SoFi checking/savings, BofA checking';

-- ============================================================
-- ACCOUNT BALANCES (historical snapshots)
-- ============================================================
create table public.account_balances (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references public.accounts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  balance_date date not null default current_date,
  current_balance numeric(14,2) not null,
  available_balance numeric(14,2),
  limit_amount numeric(14,2),             -- for credit cards
  source text default 'plaid',            -- 'plaid' | 'manual'
  created_at timestamptz default now()
);

alter table public.account_balances enable row level security;
create policy "Users can manage own balances" on public.account_balances
  for all using (auth.uid() = user_id);

-- Index for time-series queries
create index idx_account_balances_date on public.account_balances(account_id, balance_date desc);
create index idx_account_balances_user_date on public.account_balances(user_id, balance_date desc);

-- ============================================================
-- TRANSACTIONS (from Plaid)
-- ============================================================
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  plaid_transaction_id text unique,
  amount numeric(12,2) not null,          -- positive = debit (spending), negative = credit
  date date not null,
  name text not null,
  merchant_name text,
  category text[],                        -- Plaid category hierarchy
  primary_category text,                  -- e.g. "Food and Drink"
  detailed_category text,                 -- e.g. "Restaurants"
  pending boolean default false,
  currency_code text default 'USD',
  -- Manual categorization overrides
  custom_category text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions enable row level security;
create policy "Users can manage own transactions" on public.transactions
  for all using (auth.uid() = user_id);

create index idx_transactions_date on public.transactions(user_id, date desc);
create index idx_transactions_account on public.transactions(account_id, date desc);
create index idx_transactions_category on public.transactions(user_id, primary_category);

-- ============================================================
-- NET WORTH SNAPSHOTS (aggregated daily/weekly)
-- ============================================================
create table public.net_worth_snapshots (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  snapshot_date date not null,
  -- Asset buckets
  total_assets numeric(14,2) not null default 0,
  total_liabilities numeric(14,2) not null default 0,
  net_worth numeric(14,2) generated always as (total_assets - total_liabilities) stored,
  -- Breakdown by account type
  retirement_assets numeric(14,2) default 0,    -- 401k + IRA + Roth
  taxable_investments numeric(14,2) default 0,  -- brokerage accounts
  cash_savings numeric(14,2) default 0,
  real_estate numeric(14,2) default 0,
  other_assets numeric(14,2) default 0,
  credit_card_debt numeric(14,2) default 0,
  loans numeric(14,2) default 0,
  created_at timestamptz default now(),
  unique(user_id, snapshot_date)
);

alter table public.net_worth_snapshots enable row level security;
create policy "Users can manage own net worth snapshots" on public.net_worth_snapshots
  for all using (auth.uid() = user_id);

create index idx_net_worth_date on public.net_worth_snapshots(user_id, snapshot_date desc);

-- ============================================================
-- RETIREMENT GOALS & PROJECTIONS
-- ============================================================
create table public.retirement_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,                          -- e.g. "Korea Monthly Budget", "Family Emergency Fund"
  goal_type text not null,                      -- 'monthly_income' | 'lump_sum' | 'emergency_fund'
  target_amount_usd numeric(14,2),
  target_monthly_usd numeric(12,2),
  currency text default 'USD',
  -- Korea-specific
  is_korea_specific boolean default false,
  target_amount_krw numeric(18,2),              -- amount in Korean Won
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.retirement_goals enable row level security;
create policy "Users can manage own goals" on public.retirement_goals
  for all using (auth.uid() = user_id);

-- ============================================================
-- AI ADVICE LOG (Claude conversation history)
-- ============================================================
create table public.ai_advice_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  context_snapshot jsonb,                       -- financial snapshot sent to Claude
  user_question text,
  ai_response text not null,
  model text default 'claude-opus-4-6',
  tokens_used int,
  created_at timestamptz default now()
);

alter table public.ai_advice_log enable row level security;
create policy "Users can view own AI advice" on public.ai_advice_log
  for all using (auth.uid() = user_id);

-- ============================================================
-- SPENDING BUDGETS (monthly targets by category)
-- ============================================================
create table public.spending_budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  monthly_budget_usd numeric(10,2) not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(user_id, category)
);

alter table public.spending_budgets enable row level security;
create policy "Users can manage own budgets" on public.spending_budgets
  for all using (auth.uid() = user_id);

-- ============================================================
-- EXCHANGE RATES (USD/KRW cache)
-- ============================================================
create table public.exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency text not null,
  to_currency text not null,
  rate numeric(16,6) not null,
  fetched_at timestamptz default now(),
  unique(from_currency, to_currency)
);

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Latest balance per account
create or replace view public.latest_account_balances as
select distinct on (account_id)
  ab.*,
  a.name as account_name,
  a.type as account_type,
  a.subtype as account_subtype,
  a.institution_name,
  a.is_tax_advantaged,
  a.is_roth,
  a.is_pretax
from public.account_balances ab
join public.accounts a on a.id = ab.account_id
order by account_id, balance_date desc;

-- 6-month spending summary by category
create or replace view public.spending_last_6_months as
select
  user_id,
  primary_category,
  date_trunc('month', date) as month,
  sum(amount) filter (where amount > 0) as total_spent,
  count(*) filter (where amount > 0) as transaction_count
from public.transactions
where date >= current_date - interval '6 months'
  and pending = false
group by user_id, primary_category, date_trunc('month', date)
order by month desc, total_spent desc;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.plaid_items
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.accounts
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.transactions
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEED DATA — Default spending budgets
-- ============================================================
-- (Insert after user is created via trigger; these are example values)
-- Food & Dining: $800/mo, Housing: $2000/mo, Transport: $300/mo, etc.
