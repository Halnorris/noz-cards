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
    const { orderId, items, shippingCost } = req.body

    const host = req.headers.host
    const protocol = host?.includes('localhost') ? 'http' : 'https'
    const siteUrl = `${protocol}://${host}`

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      metadata: {
        orderId: orderId,
        shippingMethod: shippingMethod,
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return res.status(500).json({ error: error.message })
  }
}
