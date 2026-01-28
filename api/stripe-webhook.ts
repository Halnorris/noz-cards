export const config = {
  api: {
    bodyParser: false,
  },
}

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return res.status(200).json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  const { orderId } = session.metadata || {}

  if (!orderId) {
    console.error('No orderId in session metadata')
    return
  }

  // Update order status to paid
  await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId)

  console.log(`Order ${orderId} marked as paid`)
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)

  // Get the checkout session to access metadata
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  })

  if (sessions.data.length === 0) {
    console.log('No session found for payment intent')
    return
  }

  const session = sessions.data[0]
  const metadata = session.metadata || {}

  // Process transfers to card owners
  const transfers: Promise<any>[] = []

  Object.keys(metadata).forEach((key) => {
    if (key.startsWith('card_') && key.endsWith('_stripe_account')) {
      const index = key.split('_')[1]
      const stripeAccount = metadata[key]
      const amountKey = `card_${index}_amount`
      const cardIdKey = `card_${index}_id`
      
      const amount = parseFloat(metadata[amountKey] || '0')
      const cardId = metadata[cardIdKey]

      if (stripeAccount && amount > 0) {
        console.log(`Creating transfer of £${amount} to ${stripeAccount} for card ${cardId}`)

        const transfer = stripe.transfers.create({
          amount: Math.round(amount * 100), // Convert to pence
          currency: 'gbp',
          destination: stripeAccount,
          description: `Card sale: ${cardId}`,
          metadata: {
            cardId,
            orderId: metadata.orderId,
          },
        }).catch((error) => {
          console.error(`Transfer failed for card ${cardId}:`, error)
        })

        transfers.push(transfer)
      }
    }
  })

  // Wait for all transfers to complete
  await Promise.all(transfers)

  console.log(`Processed ${transfers.length} transfers for payment ${paymentIntent.id}`)

  // Update card statuses
  const { orderId, shippingMethod } = metadata

  if (shippingMethod === 'store') {
    // Cards will be stored, don't mark as sold yet
    console.log(`Cards for order ${orderId} will be stored`)
  } else {
    // Update card statuses to sold
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('card_id')
      .eq('order_id', orderId)

    if (orderItems && orderItems.length > 0) {
      const cardIds = orderItems.map((item: any) => item.card_id)

      await supabase
        .from('cards')
        .update({ status: 'sold' })
        .in('id', cardIds)

      console.log(`Marked ${cardIds.length} cards as sold`)
    }
  }
}
