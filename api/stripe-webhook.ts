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

// Helper to read raw body from request
async function getRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  
  if (!sig) {
    console.error('No stripe-signature header')
    return res.status(400).send('No signature')
  }

  let event: Stripe.Event

  try {
    // Read raw body
    const rawBody = await getRawBody(req)
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('✅ Webhook verified:', event.type)

  // Handle the event
  try {
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
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Checkout completed:', session.id)
  
  const { orderId } = session.metadata || {}

  if (!orderId) {
    console.error('No orderId in session metadata')
    return
  }

  // Update order status to paid
  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order:', error)
  } else {
    console.log(`✅ Order ${orderId} marked as paid`)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id)

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

  console.log('Session metadata:', metadata)

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
        console.log(`💸 Creating transfer of £${amount} to ${stripeAccount} for card ${cardId}`)

        const transfer = stripe.transfers.create({
          amount: Math.round(amount * 100), // Convert to pence
          currency: 'gbp',
          destination: stripeAccount,
          description: `Card sale: ${cardId}`,
          metadata: {
            cardId,
            orderId: metadata.orderId,
          },
        }).then((result) => {
          console.log(`✅ Transfer successful: ${result.id}`)
          return result
        }).catch((error) => {
          console.error(`❌ Transfer failed for card ${cardId}:`, error.message)
          throw error
        })

        transfers.push(transfer)
      }
    }
  })

  // Wait for all transfers to complete
  try {
    await Promise.all(transfers)
    console.log(`✅ Processed ${transfers.length} transfers for payment ${paymentIntent.id}`)
  } catch (error) {
    console.error('❌ Some transfers failed:', error)
  }

  // Update card statuses
  const { orderId, shippingMethod } = metadata

  if (shippingMethod === 'store') {
    // Cards will be stored, don't mark as sold yet
    console.log(`📦 Cards for order ${orderId} will be stored`)
  } else {
    // Update card statuses to sold
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('card_id')
      .eq('order_id', orderId)

    if (orderItems && orderItems.length > 0) {
      const cardIds = orderItems.map((item: any) => item.card_id)

      const { error } = await supabase
        .from('cards')
        .update({ status: 'sold' })
        .in('id', cardIds)

      if (error) {
        console.error('Error marking cards as sold:', error)
      } else {
        console.log(`✅ Marked ${cardIds.length} cards as sold`)
      }
    }
  }

  // Send sale notification emails
  console.log('📧 Starting email process for order:', orderId)
  try {
    // Get order details including buyer email and card info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        shipping_method,
        shipping_address,
        order_items(
          card_id,
          price,
          card_title,
          card_image_url
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('❌ Error fetching order:', orderError)
      return
    }

    console.log('📧 Order data fetched:', order ? 'success' : 'null')
    console.log('📧 Order items count:', order?.order_items?.length || 0)

    if (order && order.order_items && order.order_items.length > 0) {
      // Get buyer email separately
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', order.user_id)
        .single()
      
      const buyerEmail = buyerProfile?.email
      console.log('📧 Buyer email:', buyerEmail)
      
      // Send email for each card sold
      for (const item of order.order_items) {
        console.log('📧 Processing card:', item.card_title)
        
        // Get seller info
        const { data: card } = await supabase
          .from('cards')
          .select('owner_user_id')
          .eq('id', item.card_id)
          .single()

        let sellerEmail = null
        if (card?.owner_user_id) {
          const { data: sellerProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', card.owner_user_id)
            .single()
          
          sellerEmail = sellerProfile?.email
        }
        
        console.log('📧 Seller email:', sellerEmail)

        // Calculate seller payout (85% of card price)
        const sellerPayout = item.price * 0.85

        console.log('📧 Calling email API...')
        // Call email API
        const emailResponse = await fetch(`${process.env.FRONTEND_URL || 'https://nozcards.com'}/api/send-sale-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerEmail,
            sellerEmail,
            orderId: order.id,
            cardTitle: item.card_title,
            cardPrice: item.price,
            cardImageUrl: item.card_image_url,
            shippingMethod: order.shipping_method,
            shippingAddress: order.shipping_address,
            sellerPayout,
          }),
        })

        console.log('📧 Email API response status:', emailResponse.status)
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          console.error('📧 Email API error:', errorText)
        }
        
        console.log(`✅ Sale email sent for card: ${item.card_title}`)
      }
    } else {
      console.log('📧 No order items found or order is null')
    }
  } catch (emailError: any) {
    console.error('❌ Failed to send sale emails:', emailError)
    console.error('❌ Error message:', emailError.message)
    console.error('❌ Error stack:', emailError.stack)
    // Don't fail the webhook if emails fail
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
