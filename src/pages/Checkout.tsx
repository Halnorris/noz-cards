import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { useAuth } from '@/context/auth'
import { supabase } from '@/lib/supabase'

export default function Checkout() {
  const { items, total } = useBasket()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  })
  
  const [shippingMethod, setShippingMethod] = useState('standard')
  
  const shippingCosts = {
    standard: 3.95,
    express: 7.95,
  }

  const shippingCost = shippingCosts[shippingMethod as keyof typeof shippingCosts]
  const orderTotal = total + shippingCost

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

    // Validate shipping address
    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postcode) {
      setError('Please fill in all required shipping address fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const addressString = [
        shippingAddress.line1,
        shippingAddress.line2,
        shippingAddress.city,
        shippingAddress.postcode,
        shippingAddress.country,
      ].filter(Boolean).join(', ')

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal: total,
          shipping_cost: shippingCost,
          total: orderTotal,
          status: 'pending',
          shipping_method: shippingMethod,
          shipping_address: addressString,
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
          shippingCost: shippingCost,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to process checkout. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <section className="max-w-4xl mx-auto space-y-6 py-8">
      <h1 className="font-header text-3xl">Checkout</h1>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Shipping Info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 space-y-4">
            <h2 className="font-header text-xl">Shipping Address</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Address Line 1 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={shippingAddress.line1}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, line1: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address Line 2</label>
              <input
                type="text"
                value={shippingAddress.line2}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, line2: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="London"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Postcode <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.postcode}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, postcode: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="SW1A 1AA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                disabled
                value={shippingAddress.country}
                className="w-full px-3 py-2 border rounded-xl bg-gray-50"
              />
            </div>
          </div>

          {/* Shipping Method */}
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 space-y-4">
            <h2 className="font-header text-xl">Shipping Method</h2>
            
            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-black/5">
              <input
                type="radio"
                name="shipping"
                value="standard"
                checked={shippingMethod === 'standard'}
                onChange={(e) => setShippingMethod(e.target.value)}
              />
              <div className="flex-1">
                <div className="font-medium">Standard Delivery</div>
                <div className="text-sm opacity-70">3-5 business days</div>
              </div>
              <div className="font-header">£{shippingCosts.standard.toFixed(2)}</div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-black/5">
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={shippingMethod === 'express'}
                onChange={(e) => setShippingMethod(e.target.value)}
              />
              <div className="flex-1">
                <div className="font-medium">Express Delivery</div>
                <div className="text-sm opacity-70">1-2 business days</div>
              </div>
              <div className="font-header">£{shippingCosts.express.toFixed(2)}</div>
            </label>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 space-y-4">
            <h2 className="font-header text-xl">Order Summary</h2>

            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b text-sm">
                  <span className="truncate pr-2">{item.title}</span>
                  <span className="font-medium whitespace-nowrap">£{item.price?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Subtotal</span>
                <span>£{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Shipping</span>
                <span>£{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>£{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 mt-4"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <div className="text-xs text-center opacity-70 pt-2">
              You'll be redirected to Stripe for secure payment
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
