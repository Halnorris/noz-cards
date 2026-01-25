import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shippingOrderId, storedOrderIds, shippingCost, shippingMethod, cardCount } = req.body

    // Create Stripe checkout session for shipping only
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Shipping for ${cardCount} stored ${cardCount === 1 ? 'card' : 'cards'}`,
              description: `${shippingMethod.replace('_', ' ')} delivery`,
            },
            unit_amount: Math.round(shippingCost * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL}/shipping-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/account?tab=stored`,
      metadata: {
        shippingOrderId,
        storedOrderIds: storedOrderIds.join(','),
        shippingMethod,
      },
    })

    res.status(200).json({ url: session.url })
  } catch (err: any) {
    console.error('Shipping checkout error:', err)
    res.status(500).json({ error: err.message })
  }
}
