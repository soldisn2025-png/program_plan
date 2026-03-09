import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase'
import { calculateRetirementProjection, USD_TO_KRW } from '@/lib/retirement'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { question } = await request.json()

    // Gather financial context
    const [profileRes, netWorthRes, spendingRes, accountsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('net_worth_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: false })
        .limit(6),
      supabase
        .from('spending_last_6_months')
        .select('*')
        .eq('user_id', user.id)
        .limit(20),
      supabase
        .from('latest_account_balances')
        .select('account_name, account_type, account_subtype, current_balance, is_tax_advantaged, is_roth, is_pretax')
        .eq('user_id', user.id),
    ])

    const profile = profileRes.data
    const latestNetWorth = netWorthRes.data?.[0]
    const monthlySpending = spendingRes.data ?? []
    const accounts = accountsRes.data ?? []

    const currentYear = new Date().getFullYear()
    const projection = latestNetWorth
      ? calculateRetirementProjection({
          currentNetWorth: latestNetWorth.net_worth,
          monthlyContributions: 3000, // TODO: derive from actual contributions
          monthlyExpenses: 5000,      // TODO: derive from transactions
          koreaMonthlyBudgetUSD: profile?.monthly_korea_budget_usd ?? 3000,
          currentYear,
          targetRetirementYear: profile?.target_retirement_year ?? 2035,
        })
      : null

    const contextSnapshot = {
      profile,
      latestNetWorth,
      accounts,
      recentSpending: monthlySpending,
      projection,
    }

    const systemPrompt = `You are a knowledgeable, empathetic financial advisor helping a Korean-American professional plan for early retirement.

USER CONTEXT:
- Korean-American, currently ${currentYear - (profile?.birth_year ?? 1985)} years old (born ${profile?.birth_year ?? 1985})
- Goal: Retire at ${profile?.target_retirement_age ?? 50} in ${profile?.target_retirement_year ?? 2035} (${(profile?.target_retirement_year ?? 2035) - currentYear} years away)
- Plan: Move to Korea after retirement
- Monthly Korea budget target: $${profile?.monthly_korea_budget_usd ?? 3000}/month (≈ ₩${Math.round((profile?.monthly_korea_budget_usd ?? 3000) * USD_TO_KRW).toLocaleString()})
- Accounts: Fidelity 401k, Robinhood Roth IRA, E*Trade brokerage, SoFi, Bank of America

FINANCIAL SNAPSHOT:
${JSON.stringify(contextSnapshot, null, 2)}

INSTRUCTIONS:
- Give specific, actionable advice based on the actual numbers
- Consider Korean retirement specifics: National Health Insurance (NHI), cost of living, tax treaties between US and Korea
- Address early retirement considerations: Roth conversion ladder, SEPP/72(t) rules, ACA coverage until Medicare age
- Be encouraging but realistic about the retirement timeline
- Format your response with clear sections using markdown
- Include specific numbers and calculations where relevant`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question || 'Give me a comprehensive analysis of my retirement progress and top 3 action items I should take right now.',
        },
      ],
    })

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : ''

    // Log to database
    await supabase.from('ai_advice_log').insert({
      user_id: user.id,
      context_snapshot: contextSnapshot,
      user_question: question,
      ai_response: aiResponse,
      model: 'claude-opus-4-6',
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
    })

    return NextResponse.json({ advice: aiResponse })
  } catch (error) {
    console.error('AI advice error:', error)
    return NextResponse.json({ error: 'Failed to get AI advice' }, { status: 500 })
  }
}
