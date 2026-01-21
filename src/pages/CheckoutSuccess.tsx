import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { supabase } from '@/lib/supabase'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const { clearBasket } = useBasket()
  const sessionId = searchParams.get('session_id')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    // Clear basket on success
    clearBasket()

    // Fetch order details
    if (sessionId) {
      fetchOrderDetails()
    }
  }, [sessionId])

  const fetchOrderDetails = async () => {
    // In production, verify the session with Stripe
    // For now, just show success message
  }

  return (
    <section className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-header text-3xl mb-2">Payment Successful!</h1>
        <p className="text-xl opacity-80">Thank you for your order</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 space-y-4">
        <h2 className="font-header text-xl">What Happens Next?</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Order Confirmation</p>
              <p className="opacity-70">You'll receive an email confirmation shortly with your order details.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Processing</p>
              <p className="opacity-70">We'll prepare your cards for shipping within 1-2 business days.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Shipping</p>
              <p className="opacity-70">You'll receive tracking information once your order ships.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          to="/account"
          className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90"
        >
          View Orders
        </Link>
        <Link
          to="/marketplace"
          className="px-6 py-3 rounded-xl border border-black/10 hover:bg-black/5"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  )
}
