import Stripe from 'stripe'
import { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId } = req.body

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Return the order ID and shipping method from metadata
    return res.status(200).json({
      orderId: session.metadata?.orderId,
      shippingMethod: session.metadata?.shippingMethod,
    })
  } catch (error: any) {
    console.error('Error verifying session:', error)
    return res.status(500).json({ error: error.message })
  }
}
