import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { supabase } from '@/lib/supabase'

export default function ShipStoredCards() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderIds = searchParams.get('orders')?.split(',') || []
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [shippingMethod, setShippingMethod] = useState('2nd_class')
  
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  })

  // Calculate total cards across all selected orders
  const totalCards = orders.reduce((sum, order) => sum + (order.order_items?.length || 0), 0)

  // Calculate shipping costs based on total number of cards
  const getShippingCosts = () => {
    if (totalCards === 1) {
      return {
        '2nd_class': 2.00,
        '1st_class': 3.50,
        'special_delivery': 9.00,
      }
    } else if (totalCards >= 2 && totalCards <= 10) {
      return {
        '2nd_class': 4.00,
        '1st_class': 5.00,
        'special_delivery': 12.00,
      }
    } else {
      return {
        '2nd_class': 10.00,
        '1st_class': 12.00,
        'special_delivery': 15.00,
      }
    }
  }

  const shippingCosts = getShippingCosts()
  const shippingCost = shippingCosts[shippingMethod as keyof typeof shippingCosts]

  useEffect(() => {
    if (!user) {
      navigate('/signin')
      return
    }
    if (orderIds.length === 0) {
      navigate('/account?tab=stored')
      return
    }

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            card_id,
            price,
            card_title,
            card_image_url,
            card_nozid
          )
        `)
        .in('id', orderIds)
        .eq('user_id', user.id)
        .eq('status', 'stored')
      
      if (data && data.length > 0) {
        setOrders(data)
      } else {
        navigate('/account?tab=stored')
      }
      setLoading(false)
    }

    fetchOrders()
  }, [user, navigate, orderIds])

  const handleShipment = async () => {
    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postcode) {
      setError('Please fill in all required shipping address fields')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const addressString = [
        shippingAddress.line1,
        shippingAddress.line2,
        shippingAddress.city,
        shippingAddress.postcode,
        shippingAddress.country,
      ].filter(Boolean).join(', ')

      // Create a new shipping order
      const { data: shippingOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          subtotal: 0, // No charge for cards
          shipping_cost: shippingCost,
          total: shippingCost,
          status: 'pending',
          shipping_method: shippingMethod,
          shipping_address: addressString,
          order_type: 'shipping', // Mark this as a shipping-only order
          related_order_ids: orderIds, // Link to the original stored orders
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Call Stripe checkout for shipping payment only
      const response = await fetch('/api/create-shipping-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingOrderId: shippingOrder.id,
          storedOrderIds: orderIds,
          shippingCost: shippingCost,
          shippingMethod: shippingMethod,
          cardCount: totalCards,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (err: any) {
      console.error('Shipping error:', err)
      setError(err.message || 'Failed to process shipment. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto py-8">
        <div className="text-center py-8 opacity-70">Loading...</div>
      </section>
    )
  }

  if (orders.length === 0) {
    return null
  }

  return (
    <section className="max-w-5xl mx-auto py-8">
      <h1 className="font-header text-3xl mb-6">Ship Stored Cards</h1>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left: Shipping Options & Address */}
        <div className="space-y-6">
          
          {/* Shipping Method */}
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
            <h2 className="font-header text-xl mb-4">Delivery Options</h2>
            <p className="text-sm opacity-70 mb-4">
              Shipping {totalCards} {totalCards === 1 ? 'card' : 'cards'}
            </p>
            
            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                shippingMethod === '2nd_class' ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="radio"
                  name="shipping"
                  value="2nd_class"
                  checked={shippingMethod === '2nd_class'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-lg">📬 2nd Class</div>
                  <div className="text-sm opacity-70 mt-1">Standard delivery (3-5 business days)</div>
                  <div className="text-sm font-header mt-2 text-primary">£{shippingCosts['2nd_class'].toFixed(2)}</div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                shippingMethod === '1st_class' ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="radio"
                  name="shipping"
                  value="1st_class"
                  checked={shippingMethod === '1st_class'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-lg">📮 1st Class</div>
                  <div className="text-sm opacity-70 mt-1">Fast delivery (1-2 business days)</div>
                  <div className="text-sm font-header mt-2 text-primary">£{shippingCosts['1st_class'].toFixed(2)}</div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                shippingMethod === 'special_delivery' ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="radio"
                  name="shipping"
                  value="special_delivery"
                  checked={shippingMethod === 'special_delivery'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-lg">🚀 Special Delivery</div>
                  <div className="text-sm opacity-70 mt-1">Next day guaranteed delivery</div>
                  <div className="text-sm font-header mt-2 text-primary">£{shippingCosts['special_delivery'].toFixed(2)}</div>
                </div>
              </label>
            </div>
          </div>

          {/* Shipping Address */}
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

        </div>

        {/* Right: Summary */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
            <h2 className="font-header text-xl mb-4">Shipping Summary</h2>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {orders.map(order => (
                <div key={order.id} className="pb-3 border-b border-black/5">
                  <div className="text-sm font-medium mb-2">Order #{order.id.slice(0, 8)}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="aspect-[3/4] rounded bg-black/5 overflow-hidden border border-black/10">
                        {item.card_image_url && (
                          <img src={item.card_image_url} alt={item.card_title || ''} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs opacity-60 mt-2">{order.order_items?.length || 0} cards</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Total Cards</span>
                <span className="font-medium">{totalCards}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Cards Cost</span>
                <span className="font-medium">Already Paid</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Shipping Cost</span>
                <span className="text-primary">£{shippingCost.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleShipment}
              disabled={processing}
              className="w-full px-6 py-3.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 transition mt-6"
            >
              {processing ? 'Processing...' : 'Pay for Shipping'}
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
