import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [spendingRes, transactionsRes, budgetsRes] = await Promise.all([
      supabase
        .from('spending_last_6_months')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('pending', false)
        .gt('amount', 0)
        .order('date', { ascending: false })
        .limit(50),
      supabase
        .from('spending_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true),
    ])

    return NextResponse.json({
      spendingByCategory: spendingRes.data ?? [],
      recentTransactions: transactionsRes.data ?? [],
      budgets: budgetsRes.data ?? [],
    })
  } catch (error) {
    console.error('Spending fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch spending data' }, { status: 500 })
  }
}
