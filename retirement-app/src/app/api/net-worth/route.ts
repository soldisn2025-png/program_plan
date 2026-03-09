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

    const url = new URL(request.url)
    const months = parseInt(url.searchParams.get('months') ?? '12')

    const { data: snapshots, error } = await supabase
      .from('net_worth_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_date', { ascending: false })
      .limit(months)

    if (error) throw error

    const { data: accounts } = await supabase
      .from('latest_account_balances')
      .select('*')
      .eq('user_id', user.id)

    return NextResponse.json({
      snapshots: snapshots?.reverse() ?? [],
      accounts: accounts ?? [],
    })
  } catch (error) {
    console.error('Net worth fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch net worth data' }, { status: 500 })
  }
}
