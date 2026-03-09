import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { PlaidLinkMetadata } from '@/types'

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

    const body = await request.json()
    const { public_token, metadata }: { public_token: string; metadata: PlaidLinkMetadata } = body

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = exchangeResponse.data

    // Save Plaid item
    const { data: plaidItem, error: itemError } = await supabase
      .from('plaid_items')
      .insert({
        user_id: user.id,
        plaid_item_id: item_id,
        plaid_access_token: access_token,
        institution_id: metadata.institution.institution_id,
        institution_name: metadata.institution.name,
      })
      .select()
      .single()

    if (itemError) throw itemError

    // Save accounts from metadata
    const accountInserts = metadata.accounts.map((acc) => ({
      user_id: user.id,
      plaid_item_id: plaidItem.id,
      plaid_account_id: acc.id,
      name: acc.name,
      type: acc.type as 'depository' | 'investment' | 'credit' | 'loan' | 'other',
      subtype: acc.subtype as string,
      institution_name: metadata.institution.name,
      is_tax_advantaged: ['401k', 'roth', 'ira', 'hsa'].includes(acc.subtype),
      is_roth: acc.subtype === 'roth',
      is_pretax: acc.subtype === '401k' || acc.subtype === 'ira',
    }))

    const { error: accountError } = await supabase
      .from('accounts')
      .upsert(accountInserts, { onConflict: 'plaid_account_id' })

    if (accountError) throw accountError

    return NextResponse.json({ success: true, institution: metadata.institution.name })
  } catch (error) {
    console.error('Plaid token exchange error:', error)
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 })
  }
}
