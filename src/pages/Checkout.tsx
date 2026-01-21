import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { useAuth } from '@/context/auth'
import { supabase } from '@/lib/supabase'

export default function Checkout() {
  const { items, total, clearBasket } = useBasket()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/signin')
      return
    }
    if (items.length === 0) {
      navigate('/marketplace')
    }
  }, [user, items, navigate])

  const handleCheckout = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          status: 'pending',
          shipping_method: 'standard',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        card_id: item.id,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Call Stripe checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
          })),
        }),
      })

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to process checkout. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <section className="max-w-2xl mx-auto space-y-6 py-8">
      <h1 className="font-header text-3xl">Checkout</h1>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 space-y-4">
        <h2 className="font-header text-xl">Order Summary</h2>

        {items.map(item => (
          <div key={item.id} className="flex justify-between py-2 border-b">
            <span>{item.title}</span>
            <span className="font-medium">£{item.price?.toFixed(2)}</span>
          </div>
        ))}

        <div className="flex justify-between text-lg font-bold pt-4">
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </section>
  )
}
