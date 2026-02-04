import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

export default function ShippingSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || !sessionId) return
    hasRun.current = true

    const updateShipment = async () => {
      try {
        console.log('Verifying shipping session:', sessionId)
        
        // Get shipping order ID and stored order IDs from session metadata
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        
        if (!response.ok) {
          console.error('Verify session failed:', response.status)
          return
        }
        
        const { metadata } = await response.json()
        const { shippingOrderId, storedOrderIds, shippingMethod } = metadata
        
        if (!shippingOrderId || !storedOrderIds) {
          console.error('Missing order IDs in session metadata')
          return
        }

        console.log('Shipping Order ID:', shippingOrderId)
        console.log('Stored Order IDs:', storedOrderIds)

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
        
        const orderIds = storedOrderIds.split(',')
        
        // Update the shipping order to 'paid'
        await supabaseServiceRole
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', shippingOrderId)
        
        console.log(`✅ Shipping order ${shippingOrderId} marked as paid`)
        
        // Note: Stored orders stay as 'stored' - only the shipping order tracks shipping status
        
        // Get all card IDs from these orders and update their status to 'sold'
        const { data: orderItems, error: itemsError } = await supabaseServiceRole
          .from('order_items')
          .select('card_id')
          .in('order_id', orderIds)
        
        if (itemsError) {
          console.error('Error fetching order items:', itemsError)
          return
        }
        
        if (orderItems && orderItems.length > 0) {
          const cardIds = orderItems.map(item => item.card_id)
          
          const { error: cardsError } = await supabaseServiceRole
            .from('cards')
            .update({ status: 'sold' })
            .in('id', cardIds)

          if (cardsError) {
            console.error('Error updating card status:', cardsError)
          } else {
            console.log(`✅ ${cardIds.length} cards marked as sold`)
          }
        }
        
      } catch (err) {
        console.error('Error in post-shipping update:', err)
      }
    }

    updateShipment()
  }, [sessionId])

  return (
    <section className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-header text-4xl mb-3">Shipping Payment Successful!</h1>
        <p className="text-xl opacity-80">Your stored cards are on their way 🎉</p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-soft border border-black/5 space-y-6">
        <h2 className="font-header text-2xl">What Happens Next?</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-lg">
              1
            </div>
            <div>
              <p className="font-medium text-lg">Confirmation Email</p>
              <p className="opacity-70 mt-1">You'll receive an email confirmation with your shipping details.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-lg">
              2
            </div>
            <div>
              <p className="font-medium text-lg">Preparing Shipment</p>
              <p className="opacity-70 mt-1">We'll carefully pack your stored cards within 1-2 business days.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-lg">
              3
            </div>
            <div>
              <p className="font-medium text-lg">Tracking Information</p>
              <p className="opacity-70 mt-1">You'll receive tracking details once your cards ship.</p>
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
