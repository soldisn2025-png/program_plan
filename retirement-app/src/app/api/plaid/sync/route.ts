import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get all active Plaid items for user
    const { data: plaidItems, error: itemsError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (itemsError) throw itemsError

    let totalBalancesUpdated = 0
    let totalTransactionsAdded = 0
    const today = new Date().toISOString().split('T')[0]

    for (const item of plaidItems ?? []) {
      // ---- Sync balances ----
      const accountsResp = await plaidClient.accountsGet({
        access_token: item.plaid_access_token,
      })

      const { data: dbAccounts } = await supabase
        .from('accounts')
        .select('id, plaid_account_id')
        .eq('plaid_item_id', item.id)

      const accountMap = new Map(
        (dbAccounts ?? []).map((a) => [a.plaid_account_id, a.id])
      )

      const balanceInserts = accountsResp.data.accounts
        .filter((a) => accountMap.has(a.account_id))
        .map((a) => ({
          account_id: accountMap.get(a.account_id)!,
          user_id: user.id,
          balance_date: today,
          current_balance: a.balances.current ?? 0,
          available_balance: a.balances.available ?? undefined,
          source: 'plaid',
        }))

      if (balanceInserts.length > 0) {
        await supabase.from('account_balances').upsert(balanceInserts, {
          onConflict: 'account_id,balance_date',
          ignoreDuplicates: false,
        })
        totalBalancesUpdated += balanceInserts.length
      }

      // ---- Sync transactions (cursor-based) ----
      let cursor = item.cursor ?? undefined
      let hasMore = true
      const txInserts: Record<string, unknown>[] = []

      while (hasMore) {
        const txResp = await plaidClient.transactionsSync({
          access_token: item.plaid_access_token,
          cursor,
          count: 500,
        })

        for (const tx of txResp.data.added) {
          const accountId = accountMap.get(tx.account_id)
          if (!accountId) continue
          txInserts.push({
            user_id: user.id,
            account_id: accountId,
            plaid_transaction_id: tx.transaction_id,
            amount: tx.amount,
            date: tx.date,
            name: tx.name,
            merchant_name: tx.merchant_name ?? undefined,
            category: tx.category ?? [],
            primary_category: tx.personal_finance_category?.primary ?? tx.category?.[0],
            detailed_category: tx.personal_finance_category?.detailed ?? tx.category?.[1],
            pending: tx.pending,
            currency_code: tx.iso_currency_code ?? 'USD',
          })
        }

        cursor = txResp.data.next_cursor
        hasMore = txResp.data.has_more
      }

      if (txInserts.length > 0) {
        await supabase.from('transactions').upsert(txInserts, {
          onConflict: 'plaid_transaction_id',
          ignoreDuplicates: true,
        })
        totalTransactionsAdded += txInserts.length
      }

      // Update cursor
      await supabase
        .from('plaid_items')
        .update({ cursor, updated_at: new Date().toISOString() })
        .eq('id', item.id)
    }

    // ---- Update net worth snapshot ----
    const { data: latestBalances } = await supabase
      .from('latest_account_balances')
      .select('*')
      .eq('user_id', user.id)

    if (latestBalances && latestBalances.length > 0) {
      let retirement_assets = 0, taxable_investments = 0, cash_savings = 0
      let credit_card_debt = 0, loans = 0

      for (const b of latestBalances) {
        const bal = b.current_balance ?? 0
        if (b.is_tax_advantaged) retirement_assets += bal
        else if (b.account_type === 'investment') taxable_investments += bal
        else if (b.account_type === 'depository') cash_savings += bal
        else if (b.account_subtype === 'credit_card') credit_card_debt += Math.abs(bal)
        else if (b.account_type === 'loan') loans += Math.abs(bal)
      }

      const total_assets = retirement_assets + taxable_investments + cash_savings
      const total_liabilities = credit_card_debt + loans

      await supabase.from('net_worth_snapshots').upsert({
        user_id: user.id,
        snapshot_date: today,
        total_assets,
        total_liabilities,
        retirement_assets,
        taxable_investments,
        cash_savings,
        credit_card_debt,
        loans,
      }, { onConflict: 'user_id,snapshot_date' })
    }

    return NextResponse.json({
      success: true,
      balancesUpdated: totalBalancesUpdated,
      transactionsAdded: totalTransactionsAdded,
    })
  } catch (error) {
    console.error('Plaid sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
