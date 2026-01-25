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
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Return the metadata (contains orderId, shippingMethod, or shipping-specific data)
    res.status(200).json({
      orderId: session.metadata?.orderId,
      shippingMethod: session.metadata?.shippingMethod,
      metadata: session.metadata, // Full metadata for shipping orders
    })
  } catch (err: any) {
    console.error('Verify session error:', err)
    res.status(500).json({ error: err.message })
  }
}
