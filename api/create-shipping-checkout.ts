import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { shippingOrderId, storedOrderIds, selectedCardIds, shippingCost, shippingMethod, cardCount } = req.body
    
    console.log('=== SHIPPING CHECKOUT DEBUG ===')
    console.log('shippingOrderId:', shippingOrderId)
    console.log('storedOrderIds:', storedOrderIds)
    console.log('selectedCardIds:', selectedCardIds)
    console.log('shippingCost:', shippingCost)
    console.log('shippingMethod:', shippingMethod)
    console.log('cardCount:', cardCount)

    if (!shippingOrderId || !storedOrderIds || !shippingCost || !shippingMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { shippingOrderId, storedOrderIds, selectedCardIds, shippingCost, shippingMethod, cardCount }
      })
    }

    const appUrl = 'https://nozcards.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Shipping for ${cardCount} stored ${cardCount === 1 ? 'card' : 'cards'}`,
              description: `${shippingMethod.replace(/_/g, ' ')} delivery`,
            },
            unit_amount: Math.round(shippingCost * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/shipping-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/account?tab=stored`,
      metadata: {
        shippingOrderId,
        storedOrderIds: Array.isArray(storedOrderIds) ? storedOrderIds.join(',') : storedOrderIds,
        selectedCardIds: selectedCardIds && selectedCardIds.length > 0 
          ? (Array.isArray(selectedCardIds) ? selectedCardIds.join(',') : selectedCardIds)
          : '', // Pass selected card IDs
        shippingMethod,
      },
    })

    res.status(200).json({ url: session.url })
  } catch (err: any) {
    console.error('=== SHIPPING CHECKOUT ERROR ===')
    console.error('Error:', err)
    console.error('Message:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).json({ error: err.message })
  }
}
