// components/StripeConnectButton.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth'

type StripeStatus = {
  hasAccount: boolean
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

export default function StripeConnectButton() {
  const { user } = useAuth()
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) {
      checkStatus()
    }
  }, [user])

  async function checkStatus() {
    if (!user) return

    try {
      const response = await fetch('/api/check-connect-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error checking Stripe status:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    if (!user) return

    setCreating(true)

    try {
      const response = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating Stripe account:', error)
      alert('Failed to start Stripe onboarding. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-black/5 bg-white p-4">
        <div className="text-sm opacity-70">Loading Stripe status...</div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  // Fully set up
  if (status.onboardingComplete && status.payoutsEnabled) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="font-header text-sm mb-1">Stripe Connected</h3>
            <p className="text-sm opacity-80">
              Your Stripe account is fully set up and ready to receive payouts from card sales.
            </p>
            <p className="text-xs opacity-70 mt-2">
              You'll receive 85% of each card sale price directly to your bank account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Partially set up or needs re-verification
  if (status.hasAccount && !status.onboardingComplete) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
            !
          </div>
          <div className="flex-1">
            <h3 className="font-header text-sm mb-1">Complete Stripe Setup</h3>
            <p className="text-sm opacity-80 mb-3">
              Your Stripe account needs additional information to enable payouts.
            </p>
            <button
              onClick={handleConnect}
              disabled={creating}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:opacity-90 disabled:opacity-50 text-sm"
            >
              {creating ? 'Redirecting...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Not set up yet
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <h3 className="font-header text-sm mb-2">Connect Stripe for Payouts</h3>
      <p className="text-sm opacity-80 mb-3">
        Connect your Stripe account to receive payouts when your cards sell. You'll get 85% of the sale price sent directly to your bank account.
      </p>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          85% of sale price
        </div>
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          Direct to your bank
        </div>
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          Secure & fast
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={creating}
        className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50 text-sm"
      >
        {creating ? 'Redirecting to Stripe...' : 'Connect Stripe Account'}
      </button>
    </div>
  )
}
