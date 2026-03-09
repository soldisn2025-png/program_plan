import { NextResponse } from 'next/server'
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } from '@/lib/plaid'
import { createServerSupabaseClient } from '@/lib/supabase'
import { CountryCode } from 'plaid'

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
        email_address: profile?.email ?? user.email,
        legal_name: profile?.full_name ?? undefined,
      },
      client_name: 'Retirement Tracker',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error) {
    console.error('Plaid link token error:', error)
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 })
  }
}
