// api/check-connect-status.ts
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' })
    }

    // Get user's Stripe account ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single()

    if (!profile?.stripe_account_id) {
      return res.status(200).json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      })
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    const status = {
      hasAccount: true,
      onboardingComplete: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
    }

    // Update database with latest status
    await supabase
      .from('profiles')
      .update({
        stripe_onboarding_complete: status.onboardingComplete,
        stripe_charges_enabled: status.chargesEnabled,
        stripe_payouts_enabled: status.payoutsEnabled,
      })
      .eq('id', userId)

    return res.status(200).json(status)
  } catch (error: any) {
    console.error('Check Stripe status error:', error)
    return res.status(500).json({ error: error.message })
  }
}
