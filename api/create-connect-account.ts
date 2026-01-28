// api/create-connect-account.ts
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
    const { userId, email } = req.body

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' })
    }

    // Check if user already has a Stripe account
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single()

    let accountId = profile?.stripe_account_id

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        country: 'GB', // UK
      })

      accountId = account.id

      // Save Stripe account ID to database
      await supabase
        .from('profiles')
        .upsert({ 
          id: userId,
          email: email,
          stripe_account_id: accountId 
        })
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/account?tab=settings&stripe_refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/account?tab=settings&stripe_success=true`,
      type: 'account_onboarding',
    })

    return res.status(200).json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    return res.status(500).json({ error: error.message })
  }
}
