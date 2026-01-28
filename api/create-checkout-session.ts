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
    const { orderId, items, shippingCost, shippingMethod } = req.body
    const host = req.headers.host
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const siteUrl = `${protocol}://${host}`

    // Get card owners and their Stripe account IDs
    const cardIds = items.map((item: any) => item.id)
    const { data: cards } = await supabase
      .from('cards')
      .select(`
        id, 
        owner_user_id, 
        price,
        profiles!cards_owner_user_id_fkey(stripe_account_id, stripe_payouts_enabled)
      `)
      .in('id', cardIds)

    // Create line items for cards
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }))

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'Shipping',
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    })

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
    const shipping = shippingCost || 0
    const total = subtotal + shipping

    // Calculate platform fee (15% of subtotal only, not shipping)
    const platformFeeAmount = Math.round(subtotal * 0.15 * 100) // 15% in pence

    // Build metadata with transfer instructions for webhook
    const metadata: any = {
      orderId,
      shippingMethod,
      subtotal: subtotal.toFixed(2),
      shippingCost: shipping.toFixed(2),
      platformFee: (platformFeeAmount / 100).toFixed(2),
    }

    // Add card-to-owner mapping for transfers
    if (cards) {
      cards.forEach((card: any, index: number) => {
        const ownerStripeAccountId = card.profiles?.stripe_account_id
        const payoutsEnabled = card.profiles?.stripe_payouts_enabled
        
        if (ownerStripeAccountId && payoutsEnabled) {
          // Calculate 85% of this card's price
          const cardPrice = card.price || 0
          const ownerAmount = Math.round(cardPrice * 0.85 * 100)
          
          metadata[`card_${index}_id`] = card.id
          metadata[`card_${index}_owner`] = card.owner_user_id
          metadata[`card_${index}_stripe_account`] = ownerStripeAccountId
          metadata[`card_${index}_amount`] = (ownerAmount / 100).toFixed(2)
        }
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      metadata,
      // Note: We DON'T use payment_intent_data.application_fee_amount here
      // because we're doing manual transfers in the webhook instead
      // This gives us more control over the split
    })

    return res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return res.status(500).json({ error: error.message })
  }
}
