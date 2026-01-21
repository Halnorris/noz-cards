import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { supabase } from '@/lib/supabase'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const { clear } = useBasket()
  const sessionId = searchParams.get('session_id')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    // Clear basket on success
    if (clear) {
      clear()
    }

    // Fetch order details
    if (sessionId) {
      fetchOrderDetails()
    }
  }, [sessionId, clear])

  const fetchOrderDetails = async () => {
    // In production, verify the session with Stripe
    // For now, just show success message
  }

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
