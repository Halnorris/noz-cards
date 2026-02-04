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
  
  const { orderId, shippingOrderId } = session.metadata || {}

  // Handle regular order
  if (orderId) {
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

  // Handle shipping order
  if (shippingOrderId) {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', shippingOrderId)

    if (error) {
      console.error('Error updating shipping order:', error)
    } else {
      console.log(`✅ Shipping order ${shippingOrderId} marked as paid`)
    }
  }

  if (!orderId && !shippingOrderId) {
    console.error('No orderId or shippingOrderId in session metadata')
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

  const { orderId, shippingOrderId, storedOrderIds, shippingMethod } = metadata

  // HANDLE SHIPPING ORDERS (stored cards being shipped)
  if (shippingOrderId) {
    console.log('📦 Processing shipping order:', shippingOrderId)
    
    try {
      // Get shipping order details
      const { data: shippingOrder } = await supabase
        .from('orders')
        .select('id, user_id, shipping_method, shipping_address, shipping_cost')
        .eq('id', shippingOrderId)
        .single()

      if (!shippingOrder) {
        console.error('Shipping order not found')
        return
      }

      // Get buyer email
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', shippingOrder.user_id)
        .single()

      // Get cards from stored orders
      const storedOrderIdList = storedOrderIds ? storedOrderIds.split(',') : []
      let allCards: any[] = []
      
      if (storedOrderIdList.length > 0) {
        const { data: storedOrders } = await supabase
          .from('orders')
          .select(`
            order_items(
              card_title,
              price,
              card_image_url,
              card_nozid
            )
          `)
          .in('id', storedOrderIdList)

        if (storedOrders) {
          allCards = storedOrders.flatMap(o => o.order_items || [])
        }
      }

      const buyerEmail = buyerProfile?.email
      const cardCount = allCards.length

      console.log('📧 Sending shipping emails for', cardCount, 'cards to', buyerEmail)

      // Send shipping confirmation emails
      await fetch(`${process.env.FRONTEND_URL || 'https://nozcards.com'}/api/send-shipping-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerEmail,
          shippingOrderId,
          cardCount,
          shippingCost: shippingOrder.shipping_cost,
          shippingMethod: shippingOrder.shipping_method,
          shippingAddress: shippingOrder.shipping_address,
          cards: allCards,
        }),
      })

      console.log('✅ Shipping emails sent')
    } catch (error: any) {
      console.error('❌ Failed to process shipping order:', error)
    }
    
    // Exit early - shipping order is fully processed
    return
  }

  // HANDLE REGULAR CARD ORDERS
  if (!orderId) {
    console.log('No orderId found - skipping card sale processing')
    return
  }

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
          amount: Math.round(amount * 100),
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
  if (shippingMethod === 'store') {
    console.log(`📦 Cards for order ${orderId} will be stored`)
  } else {
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

  // Send ONE email for the entire order (not per card!)
  console.log('📧 Sending sale emails for order:', orderId)
  
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        shipping_method,
        shipping_address,
        subtotal,
        order_items(
          card_id,
          price,
          card_title,
          card_image_url
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ Error fetching order:', orderError)
      return
    }

    // Get buyer email
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', order.user_id)
      .single()

    const buyerEmail = buyerProfile?.email
    
    if (!buyerEmail) {
      console.error('No buyer email found')
      return
    }

    // Get all unique sellers from this order
    const cardIds = order.order_items.map((item: any) => item.card_id)
    const { data: cards } = await supabase
      .from('cards')
      .select(`
        id,
        owner_user_id,
        price
      `)
      .in('id', cardIds)

    // Group cards by seller
    const sellerCards = new Map<string, any[]>()
    
    if (cards) {
      for (const card of cards) {
        if (card.owner_user_id) {
          if (!sellerCards.has(card.owner_user_id)) {
            sellerCards.set(card.owner_user_id, [])
          }
          sellerCards.get(card.owner_user_id)!.push(card)
        }
      }
    }

    // Send buyer email (ONE email with ALL cards)
    const totalPayout = Array.from(sellerCards.values())
      .flat()
      .reduce((sum, card) => sum + (card.price * 0.85), 0)

    await fetch(`${process.env.FRONTEND_URL || 'https://nozcards.com'}/api/send-sale-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerEmail,
        sellerEmail: null, // Will send seller emails separately
        orderId: order.id,
        cardTitle: `${order.order_items.length} card${order.order_items.length > 1 ? 's' : ''}`,
        cardPrice: order.subtotal,
        cardImageUrl: order.order_items[0]?.card_image_url,
        shippingMethod: order.shipping_method,
        shippingAddress: order.shipping_address,
        sellerPayout: null,
        allCards: order.order_items, // Pass all cards for the email
      }),
    })

    console.log(`✅ Buyer email sent to ${buyerEmail}`)

    // Send ONE email per seller (if they sold multiple cards, group them)
    for (const [sellerId, sellerCardsList] of sellerCards.entries()) {
      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', sellerId)
        .single()

      const sellerEmail = sellerProfile?.email
      const sellerPayout = sellerCardsList.reduce((sum, card) => sum + (card.price * 0.85), 0)

      if (sellerEmail) {
        await new Promise(resolve => setTimeout(resolve, 600)) // Rate limit

        await fetch(`${process.env.FRONTEND_URL || 'https://nozcards.com'}/api/send-sale-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerEmail: null, // Already sent buyer email
            sellerEmail,
            orderId: order.id,
            cardTitle: `${sellerCardsList.length} card${sellerCardsList.length > 1 ? 's' : ''}`,
            cardPrice: sellerCardsList.reduce((sum, c) => sum + c.price, 0),
            cardImageUrl: null,
            shippingMethod: order.shipping_method,
            shippingAddress: order.shipping_address,
            sellerPayout,
          }),
        })

        console.log(`✅ Seller email sent to ${sellerEmail}`)
      }
    }

    // Send admin email
    await new Promise(resolve => setTimeout(resolve, 600))
    
    await fetch(`${process.env.FRONTEND_URL || 'https://nozcards.com'}/api/send-sale-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerEmail: 'support@nozcards.com', // Admin notification
        sellerEmail: null,
        orderId: order.id,
        cardTitle: `${order.order_items.length} cards`,
        cardPrice: order.subtotal,
        cardImageUrl: null,
        shippingMethod: order.shipping_method,
        shippingAddress: order.shipping_address,
        sellerPayout: totalPayout,
        adminEmail: true,
      }),
    })

    console.log('✅ Admin email sent')

  } catch (emailError: any) {
    console.error('❌ Failed to send emails:', emailError)
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
