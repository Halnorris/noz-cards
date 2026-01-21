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
  
  const [shippingMethod, setShippingMethod] = useState('ship_now')
  
  const shippingCosts = {
    ship_now: 3.95,
    store: 0,
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

    // Only validate address if shipping now
    if (shippingMethod === 'ship_now') {
      if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postcode) {
        setError('Please fill in all required shipping address fields')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const addressString = shippingMethod === 'ship_now' 
        ? [
            shippingAddress.line1,
            shippingAddress.line2,
            shippingAddress.city,
            shippingAddress.postcode,
            shippingAddress.country,
          ].filter(Boolean).join(', ')
        : 'Store for later shipment'

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

      // Update card status based on shipping method
      const newStatus = shippingMethod === 'store' ? 'stored' : 'sold'
      
      const cardIds = items.map(item => item.id)
      const { error: updateError } = await supabase
        .from('cards')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', cardIds)

      if (updateError) {
        console.error('Error updating card status:', updateError)
        // Don't throw - order is already created, just log the error
      }

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
    <section className="max-w-5xl mx-auto py-8">
      <h1 className="font-header text-3xl mb-6">Checkout</h1>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left: Shipping Options */}
        <div className="space-y-6">
          
          {/* Shipping Method */}
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
            <h2 className="font-header text-xl mb-4">Delivery Options</h2>
            
            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                shippingMethod === 'ship_now' ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="radio"
                  name="shipping"
                  value="ship_now"
                  checked={shippingMethod === 'ship_now'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-lg">📦 Ship Now</div>
                  <div className="text-sm opacity-70 mt-1">Your cards will be shipped immediately (3-5 business days)</div>
                  <div className="text-sm font-header mt-2 text-primary">£{shippingCosts.ship_now.toFixed(2)}</div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                shippingMethod === 'store' ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="radio"
                  name="shipping"
                  value="store"
                  checked={shippingMethod === 'store'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-lg">🏪 Store & Ship Later</div>
                  <div className="text-sm opacity-70 mt-1">We'll hold your cards and ship them all together when you're ready</div>
                  <div className="text-sm font-header mt-2 text-primary">FREE</div>
                  <div className="text-xs opacity-60 mt-2 italic">
                    💡 Pro tip: Buy multiple cards and ship them all at once to save on shipping!
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Shipping Address - Only show if ship_now selected */}
          {shippingMethod === 'ship_now' && (
            <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
              <h2 className="font-header text-xl mb-4">Shipping Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Address Line 1 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.line1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, line1: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-black/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Address Line 2</label>
                  <input
                    type="text"
                    value={shippingAddress.line2}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, line2: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-black/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-black/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="London"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Postcode <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postcode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, postcode: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-black/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="SW1A 1AA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Country</label>
                  <input
                    type="text"
                    disabled
                    value={shippingAddress.country}
                    className="w-full px-4 py-2.5 border border-black/10 rounded-xl bg-black/5"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right: Order Summary */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
            <h2 className="font-header text-xl mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-black/5">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/5 border border-black/10 shrink-0">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title || ''} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-sm font-header mt-1">£{item.price?.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className="font-medium">£{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-primary">£{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 transition mt-6"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs opacity-60 mt-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure checkout powered by Stripe
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
