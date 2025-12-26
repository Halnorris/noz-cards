import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { useAuth } from '@/context/auth'

type ShippingMethod = 'ship_now' | 'store'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, clear, removeItem } = useBasket()
  const { user } = useAuth()

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('ship_now')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Shipping details (only needed if ship_now)
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    phone: '',
  })

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (it.price ?? 0), 0),
    [items]
  )

  // Shipping cost logic
  const shippingCost = useMemo(() => {
    if (shippingMethod === 'store') return 0
    // Example: £3.50 standard shipping
    return 3.50
  }, [shippingMethod])

  const total = subtotal + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Please sign in to checkout')
      navigate('/signin')
      return
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    if (items.length === 0) {
      alert('Your basket is empty')
      return
    }

    setProcessing(true)

    try {
      // TODO: Create order in Supabase
      // TODO: Create Stripe checkout session
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('Order details:', {
        user_id: user.id,
        items,
        shipping_method: shippingMethod,
        shipping_address: shippingMethod === 'ship_now' ? shippingDetails : null,
        subtotal,
        shipping_cost: shippingCost,
        total,
      })

      // Clear basket
      clear()

      // Show success and redirect
      alert('Order placed successfully! (Demo mode - Stripe integration coming soon)')
      navigate('/account')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="font-header text-2xl mb-4">Your basket is empty</h1>
        <Link to="/marketplace" className="inline-block px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90">
          Browse Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-header text-2xl">Checkout</h1>
        <Link to="/basket" className="text-sm underline">Back to basket</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {/* Shipping Method - Your unique feature! */}
            <section className="rounded-2xl bg-white p-5 border border-black/5 shadow-soft">
              <h2 className="font-header text-lg mb-4">Delivery Method</h2>
              
              <div className="space-y-3">
                {/* Ship Now */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition ${
                  shippingMethod === 'ship_now' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-black/10 hover:border-black/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value="ship_now"
                      checked={shippingMethod === 'ship_now'}
                      onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Ship Now</div>
                      <div className="text-sm opacity-70 mt-1">
                        Get your cards delivered straight to your door. Standard tracked shipping: £3.50
                      </div>
                    </div>
                  </div>
                </label>

                {/* Store for Later */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition ${
                  shippingMethod === 'store' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-black/10 hover:border-black/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value="store"
                      checked={shippingMethod === 'store'}
                      onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        Store for Later
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/30 border border-secondary/60">
                          Save on shipping
                        </span>
                      </div>
                      <div className="text-sm opacity-70 mt-1">
                        Keep buying and ship everything together later. FREE shipping when you're ready!
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {shippingMethod === 'store' && (
                <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
                  💡 <strong>Pro tip:</strong> Store your cards and continue shopping. When you're ready, ship everything in one go and save on shipping costs!
                </div>
              )}
            </section>

            {/* Shipping Address - Only if shipping now */}
            {shippingMethod === 'ship_now' && (
              <section className="rounded-2xl bg-white p-5 border border-black/5 shadow-soft">
                <h2 className="font-header text-lg mb-4">Shipping Address</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.fullName}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.addressLine1}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="123 High Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingDetails.addressLine2}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, addressLine2: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={shippingDetails.city}
                        onChange={(e) => setShippingDetails(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="London"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Postcode *</label>
                      <input
                        type="text"
                        required
                        value={shippingDetails.postcode}
                        onChange={(e) => setShippingDetails(prev => ({ ...prev, postcode: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="SW1A 1AA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Country *</label>
                    <select
                      required
                      value={shippingDetails.country}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Ireland">Ireland</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="07123 456789"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Terms */}
            <section className="rounded-2xl bg-white p-5 border border-black/5 shadow-soft">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <span className="text-sm">
                  I agree to the{' '}
                  <Link to="/legal/terms" className="underline" target="_blank">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/legal/privacy" className="underline" target="_blank">Privacy Policy</Link>
                </span>
              </label>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-5 border border-black/5 shadow-soft sticky top-20">
              <h2 className="font-header text-lg mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 border border-black/10 shrink-0">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.title || 'Card'} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-600 hover:underline mt-1"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-sm font-header">
                      £{(item.price ?? 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-black/10 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">Subtotal</span>
                  <span className="font-header">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Shipping</span>
                  <span className="font-header">
                    {shippingMethod === 'store' ? (
                      <span className="text-green-600">FREE (stored)</span>
                    ) : (
                      `£${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-black/10">
                  <span className="font-medium">Total</span>
                  <span className="font-header text-lg">£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                type="submit"
                disabled={processing || !agreedToTerms}
                className="mt-4 w-full px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {processing ? 'Processing...' : `Pay £${total.toFixed(2)}`}
              </button>

              <div className="mt-3 text-xs opacity-70 text-center">
                Secure checkout powered by Stripe
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}
