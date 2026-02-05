import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Admin emails that can access this page
const ADMIN_EMAILS = ['support@nozcards.com', 'habnorris@gmail.com']

// Create service role client for admin operations
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [trackingData, setTrackingData] = useState<{[key: string]: { number: string, carrier: string }}>({})

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin')
      return
    }

    if (!user) return

    // Check if user is admin
    async function checkAdmin() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      if (!profile || !ADMIN_EMAILS.includes(profile.email)) {
        // Not an admin - redirect to home
        navigate('/')
        return
      }

      // Admin confirmed - fetch orders
      await fetchOrders()
    }

    checkAdmin()
  }, [user, authLoading, navigate])

  async function fetchOrders() {
    console.log('🔍 [ADMIN] Fetching orders with status=paid...')
    
    // Get orders with status 'paid' that need shipping
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          card_title,
          card_nozid,
          card_image_url,
          price
        )
      `)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [ADMIN] Error fetching orders:', error)
      setLoading(false)
      return
    }

    console.log('📦 [ADMIN] Found', data?.length || 0, 'paid orders')

    if (data) {
      // For shipping orders, fetch the actual cards from related stored orders
      const ordersWithCards = await Promise.all(
        data.map(async (order) => {
          if (order.order_type === 'shipping') {
            console.log(`📦 [ADMIN] Processing shipping order ${order.id}`)
            console.log('   related_order_ids:', order.related_order_ids)
            console.log('   related_order_ids type:', typeof order.related_order_ids)
            
            // Handle related_order_ids as either array or comma-separated string
            let relatedIds: string[] = []
            
            if (order.related_order_ids) {
              if (Array.isArray(order.related_order_ids)) {
                // It's already an array
                relatedIds = order.related_order_ids
              } else if (typeof order.related_order_ids === 'string') {
                // It's a comma-separated string
                relatedIds = order.related_order_ids.split(',').map((id: string) => id.trim()).filter(Boolean)
              }
              
              console.log('   Parsed related IDs:', relatedIds)
            }
            
            if (relatedIds.length > 0) {
              // Get cards from the stored orders
              const { data: storedOrders, error: storedError } = await supabase
                .from('orders')
                .select(`
                  order_items(
                    id,
                    card_title,
                    card_nozid,
                    card_image_url,
                    price
                  )
                `)
                .in('id', relatedIds)
              
              if (storedError) {
                console.error('❌ [ADMIN] Error fetching stored orders:', storedError)
              } else if (storedOrders) {
                const allCards = storedOrders.flatMap(o => o.order_items || [])
                console.log(`✅ [ADMIN] Found ${allCards.length} cards for shipping order`)
                return { ...order, order_items: allCards }
              }
            } else {
              console.warn(`⚠️ [ADMIN] Shipping order ${order.id} has no related_order_ids`)
            }
          }
          return order
        })
      )
      
      console.log(`✅ [ADMIN] Processed ${ordersWithCards.length} orders`)
      setOrders(ordersWithCards)
      
      // Initialize tracking data
      const initialTracking: {[key: string]: { number: string, carrier: string }} = {}
      ordersWithCards.forEach(order => {
        initialTracking[order.id] = { number: '', carrier: '' }
      })
      setTrackingData(initialTracking)
    } else {
      setOrders([])
    }
    
    setLoading(false)
  }

  async function markAsShipped(orderId: string) {
    const tracking = trackingData[orderId]
    
    if (!tracking.number || !tracking.carrier) {
      alert('Please enter tracking number and select carrier')
      return
    }

    if (!confirm('Mark this order as shipped and send tracking email to customer?')) {
      return
    }

    setUpdating(orderId)

    try {
      console.log(`📦 [ADMIN] Marking order ${orderId} as shipped...`)
      
      // Update order status to 'shipped' and add tracking info using admin client
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'shipped',
          tracking_number: tracking.number,
          tracking_carrier: tracking.carrier,
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('❌ [ADMIN] Update error:', updateError)
        throw updateError
      }

      console.log('✅ [ADMIN] Order status updated to shipped')

      // Get order details for email
      const order = orders.find(o => o.id === orderId)
      
      // Send tracking email
      console.log('📧 [ADMIN] Sending tracking email...')
      const response = await fetch('/api/send-tracking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          trackingNumber: tracking.number,
          trackingCarrier: tracking.carrier,
          shippingMethod: order.shipping_method,
          shippingAddress: order.shipping_address,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [ADMIN] Email API error:', errorText)
        throw new Error('Failed to send tracking email: ' + errorText)
      }

      console.log('✅ [ADMIN] Tracking email sent')
      alert('✅ Order marked as shipped and tracking email sent!')
      
      // Remove from list
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (error: any) {
      console.error('❌ [ADMIN] Error:', error)
      alert('Failed to mark as shipped: ' + error.message)
    } finally {
      setUpdating(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center py-8 opacity-70">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-header text-3xl">Admin - Shipping Management</h1>
          <p className="text-sm opacity-70 mt-1">{orders.length} orders awaiting shipment</p>
        </div>
        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 shadow-soft border border-black/5 text-center">
          <p className="text-xl opacity-70">🎉 All caught up! No orders to ship.</p>
          <p className="text-sm opacity-50 mt-2">
            Press F12 and check Console for debug logs if you expected to see orders here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isShippingOrder = order.order_type === 'shipping'
            const cardCount = order.order_items?.length || 0
            
            return (
              <div 
                key={order.id}
                className="rounded-2xl bg-white p-6 shadow-soft border border-black/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-header text-xl">
                        {isShippingOrder ? '📦 Shipping Order' : '🛒 Purchase Order'}
                      </h3>
                      <span className="text-sm opacity-60">#{order.id.slice(0, 8)}</span>
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                        Needs Shipping
                      </span>
                    </div>
                    <p className="text-sm opacity-70">
                      {new Date(order.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-70">Total</div>
                    <div className="text-2xl font-header">£{order.total.toFixed(2)}</div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded-xl">
                  <div>
                    <div className="text-xs font-medium opacity-70 mb-1">Shipping Method</div>
                    <div className="font-medium">{order.shipping_method?.replace(/_/g, ' ') || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium opacity-70 mb-1">Shipping Address</div>
                    <div className="text-sm">{order.shipping_address || 'N/A'}</div>
                  </div>
                </div>

                {/* Cards to Ship */}
                {cardCount > 0 ? (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-3">📦 Cards to Ship ({cardCount}):</div>
                    <div className="space-y-2">
                      {order.order_items.map((item: any, idx: number) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border border-black/10 rounded-lg bg-gray-50">
                          <div className="text-lg font-bold text-gray-500 w-8">{idx + 1}.</div>
                          <div className="w-16 h-20 rounded bg-black/5 overflow-hidden shrink-0">
                            {item.card_image_url && (
                              <img src={item.card_image_url} alt={item.card_title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono font-bold text-lg text-primary">{item.card_nozid || 'N/A'}</div>
                            <div className="text-sm opacity-80 line-clamp-2">{item.card_title}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm opacity-70">Price</div>
                            <div className="font-medium">£{item.price?.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      ⚠️ No cards found for this order. Check browser console (F12) for debug logs.
                    </p>
                  </div>
                )}

                {/* Tracking Input */}
                <div className="border-t pt-4 mt-4">
                  <div className="grid md:grid-cols-[200px_1fr_auto] gap-3 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-1">Carrier</label>
                      <input
                        type="text"
                        value={trackingData[order.id]?.carrier || ''}
                        onChange={(e) => setTrackingData(prev => ({
                          ...prev,
                          [order.id]: { ...prev[order.id], carrier: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-black/20 rounded-xl"
                        placeholder="e.g. Royal Mail"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingData[order.id]?.number || ''}
                        onChange={(e) => setTrackingData(prev => ({
                          ...prev,
                          [order.id]: { ...prev[order.id], number: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-black/20 rounded-xl"
                        placeholder="Enter tracking number"
                      />
                    </div>

                    <button
                      onClick={() => markAsShipped(order.id)}
                      disabled={updating === order.id || !trackingData[order.id]?.number || !trackingData[order.id]?.carrier}
                      className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                    >
                      {updating === order.id ? 'Processing...' : '✓ Mark Shipped & Send Email'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
