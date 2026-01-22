import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { createClient } from '@supabase/supabase-js'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const { clear } = useBasket()
  const sessionId = searchParams.get('session_id')
  const [statusUpdated, setStatusUpdated] = useState(false)

  useEffect(() => {
    // Clear basket on success
    if (clear) {
      clear()
    }

    // Only run once
    if (statusUpdated || !sessionId) return

    // Update card status after successful payment
    const updateCardStatus = async () => {
      try {
        console.log('Verifying session:', sessionId)
        
        // Get order ID from session metadata by calling our API
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        
        if (!response.ok) {
          console.error('Verify session failed:', response.status)
          setStatusUpdated(true) // Prevent retry loop
          return
        }
        
        const { orderId, shippingMethod } = await response.json()
        
        if (!orderId) {
          console.error('No order ID found in session')
          setStatusUpdated(true) // Prevent retry loop
          return
        }

        console.log('Order ID:', orderId, 'Shipping method:', shippingMethod)

        // Create service role client
        const supabaseServiceRole = createClient(
          import.meta.env.VITE_SUPABASE_URL!,
          import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        
        // Get card IDs from order_items
        const { data: orderItems, error: itemsError } = await supabaseServiceRole
          .from('order_items')
          .select('card_id')
          .eq('order_id', orderId)
        
        if (itemsError || !orderItems || orderItems.length === 0) {
          console.error('Error fetching order items:', itemsError)
          setStatusUpdated(true)
          return
        }
        
        const cardIds = orderItems.map(item => item.card_id)
        
        if (shippingMethod === 'store') {
          // For stored cards: update order status to 'stored' and card status to 'stored'
          console.log(`Storing ${cardIds.length} cards for later shipment`)
          
          // Update card status to 'stored' so they're removed from marketplace
          const { error: updateError } = await supabaseServiceRole
            .from('cards')
            .update({ status: 'stored' })
            .in('id', cardIds)

          if (updateError) {
            console.error('Error updating card status:', updateError)
          } else {
            console.log(`✅ ${cardIds.length} cards marked as stored`)
          }

          // Update order status to 'stored' so it appears in "Stored Cards" tab
          await supabaseServiceRole
            .from('orders')
            .update({ status: 'stored' })
            .eq('id', orderId)
          
        } else {
          // For shipping: update order status to 'paid' and card status to 'sold'
          console.log(`Shipping ${cardIds.length} cards immediately`)
          
          // Update card status to 'sold' so they're removed from marketplace
          const { error: updateError } = await supabaseServiceRole
            .from('cards')
            .update({ status: 'sold' })
            .in('id', cardIds)

          if (updateError) {
            console.error('Error updating card status:', updateError)
          } else {
            console.log(`✅ ${cardIds.length} cards marked as sold`)
          }

          // Update order status to 'paid'
          await supabaseServiceRole
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', orderId)
        }
        
        setStatusUpdated(true)
        
      } catch (err) {
        console.error('Error in post-payment update:', err)
        setStatusUpdated(true) // Prevent retry loop
      }
    }

    updateCardStatus()
  }, [sessionId, clear, statusUpdated]) // FIXED: Added statusUpdated here!

  return (
    <section className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-header text-4xl mb-3">Payment Successful!</h1>
        <p className="text-xl opacity-80">Thank you for your order 🎉</p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-soft border border-black/5 space-y-6">
        <h2 className="font-header text-2xl">What Happens Next?</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-lg">
              1
            </div>
            <div>
              <p className="font-medium text-lg">Order Confirmation</p>
              <p className="opacity-70 mt-1">You'll receive an email confirmation shortly with your order details and receipt.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-lg">
              2
            </div>
            <div>
              <p className="font-medium text-lg">Processing</p>
              <p className="opacity-70 mt-1">We'll carefully prepare your cards for shipping within 1-2 business days.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-lg">
              3
            </div>
            <div>
              <p className="font-medium text-lg">Shipping & Tracking</p>
              <p className="opacity-70 mt-1">You'll receive tracking information once your order ships so you can follow its journey.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/account?tab=orders"
          className="px-8 py-3 rounded-xl bg-primary text-white hover:opacity-90 text-center font-medium"
        >
          View My Orders
        </Link>
        <Link
          to="/marketplace"
          className="px-8 py-3 rounded-xl border-2 border-black/10 hover:bg-black/5 text-center font-medium"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="text-center text-sm opacity-60 pt-4">
        Need help? Contact us at{' '}
        <a href="mailto:support@nozcards.com" className="text-primary underline">
          support@nozcards.com
        </a>
      </div>
    </section>
  )
}
