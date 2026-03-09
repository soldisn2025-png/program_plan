'use client'

import { useCallback, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import type { PlaidLinkMetadata } from '@/types'

interface PlaidLinkButtonProps {
  linkToken: string
  onSuccess: (institution: string) => void
}

export default function PlaidLinkButton({ linkToken, onSuccess }: PlaidLinkButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSuccess = useCallback(
    async (public_token: string, metadata: PlaidLinkMetadata) => {
      setLoading(true)
      try {
        const res = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token, metadata }),
        })
        const data = await res.json()
        if (data.success) {
          onSuccess(metadata.institution.name)
        }
      } finally {
        setLoading(false)
      }
    },
    [onSuccess]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess as Parameters<typeof usePlaidLink>[0]['onSuccess'],
  })

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Connecting...' : '+ Connect Account'}
    </button>
  )
}
