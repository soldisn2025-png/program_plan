import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

function mapToBucket(subtype: string, isRoth: boolean): 'A' | 'B' | 'C' | null {
  if (['checking', 'savings', 'money_market', 'depository'].includes(subtype)) return 'A'
  if (subtype === 'brokerage' && !isRoth) return 'A'
  if (subtype === 'roth') return 'B'
  if (['401k', 'ira', 'hsa'].includes(subtype)) return 'C'
  return null
}

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const authHeader = request.headers.get('Authorization')

    let userId: string | null = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({
        accounts: [],
        bucketTotals: { A: 0, B: 0, C: 0 },
        currentMonthSpending: [],
        lastSyncedAt: null,
      })
    }

    // Fetch latest account balances from Supabase view
    const { data: accounts } = await supabase
      .from('latest_account_balances')
      .select('*')
      .eq('user_id', userId)

    // Compute bucket totals by subtype
    const bucketTotals: { A: number; B: number; C: number } = { A: 0, B: 0, C: 0 }
    for (const acc of accounts ?? []) {
      const bucket = mapToBucket(acc.subtype ?? '', acc.is_roth ?? false)
      if (bucket) bucketTotals[bucket] += acc.current_balance ?? 0
    }

    // Current month spending grouped by category
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]

    const { data: txns } = await supabase
      .from('transactions')
      .select('primary_category, amount')
      .eq('user_id', userId)
      .gte('date', firstOfMonth)
      .gt('amount', 0)

    const spendingMap: Record<string, number> = {}
    for (const tx of txns ?? []) {
      const cat = tx.primary_category ?? 'Other'
      spendingMap[cat] = (spendingMap[cat] ?? 0) + tx.amount
    }
    const currentMonthSpending = Object.entries(spendingMap)
      .map(([category, total]) => ({ category, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total)

    // Last sync timestamp
    const { data: latestBalance } = await supabase
      .from('account_balances')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      accounts: accounts ?? [],
      bucketTotals,
      currentMonthSpending,
      lastSyncedAt: latestBalance?.created_at ?? null,
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
