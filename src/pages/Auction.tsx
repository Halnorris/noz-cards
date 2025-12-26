import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth'

type Tab = 'dashboard' | 'live' | 'pending' | 'orders' | 'wishlist' | 'submit'

type Card = {
  id: string
  nozid: string
  title: string
  text: string
  price: number | null
  image_url: string
  status: string
  created_at: string
}

type Order = {
  id: string
  shipping_method: string
  total: number
  status: string
  created_at: string
  card_count?: number
}

type WishlistItem = {
  id: string
  card: Card
}

export default function Account() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState({
    liveCount: 0,
    pendingCount: 0,
    storedCount: 0,
    ordersCount: 0,
    wishlistCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin')
      return
    }

    if (!user) return

    async function fetchStats() {
      try {
        const [live, pending, orders, stored, wishlist] = await Promise.all([
          supabase.from('cards').select('*', { count: 'exact', head: true }).eq('owner_user_id', user.id).eq('status', 'live'),
          supabase.from('cards').select('*', { count: 'exact', head: true }).eq('owner_user_id', user.id).eq('status', 'pending'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'stored'),
          supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ])

        setStats({
          liveCount: live.count || 0,
          pendingCount: pending.count || 0,
          storedCount: stored.count || 0,
          ordersCount: orders.count || 0,
          wishlistCount: wishlist.count || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, authLoading, navigate])

  if (authLoading || loading) {
    return (
      <section className="space-y-4">
        <h1 className="font-header text-2xl">Account</h1>
        <div className="text-center py-8 opacity-70">Loading your account...</div>
      </section>
    )
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'live', label: 'Live Cards', count: stats.liveCount },
    { id: 'pending', label: 'Pending', count: stats.pendingCount },
    { id: 'orders', label: 'Orders', count: stats.ordersCount },
    { id: 'wishlist', label: 'Wishlist', count: stats.wishlistCount },
    { id: 'submit', label: 'Submit Cards' },
  ]

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
        <h1 className="font-header text-2xl mb-4">Account Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Live Cards</div>
            <div className="text-2xl font-header">{stats.liveCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Pending</div>
            <div className="text-2xl font-header">{stats.pendingCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Stored Cards</div>
            <div className="text-2xl font-header">{stats.storedCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Orders</div>
            <div className="text-2xl font-header">{stats.ordersCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Wishlist</div>
            <div className="text-2xl font-header">{stats.wishlistCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white border border-black/10 hover:bg-black/5'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-black/10'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 min-h-[400px]">
        {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
        {activeTab === 'live' && <LiveCardsTab />}
        {activeTab === 'pending' && <PendingCardsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'wishlist' && <WishlistTab />}
        {activeTab === 'submit' && <SubmitCardsTab />}
      </div>
    </div>
  )
}

/* ===== DASHBOARD TAB ===== */
function DashboardTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-header text-xl mb-3">Welcome back!</h2>
        <p className="opacity-70">Manage your cards, track orders, and browse your wishlist.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-black/5 bg-green-50">
          <div className="text-sm font-medium text-green-800">Cards for Sale</div>
          <div className="text-2xl font-header text-green-900 mt-1">{stats.liveCount}</div>
          <div className="text-xs opacity-70 mt-2">Currently listed on the marketplace</div>
        </div>

        <div className="p-4 rounded-xl border border-black/5 bg-yellow-50">
          <div className="text-sm font-medium text-yellow-800">Awaiting Approval</div>
          <div className="text-2xl font-header text-yellow-900 mt-1">{stats.pendingCount}</div>
          <div className="text-xs opacity-70 mt-2">Set prices to make them live</div>
        </div>

        <div className="p-4 rounded-xl border border-black/5 bg-blue-50">
          <div className="text-sm font-medium text-blue-800">Stored Cards</div>
          <div className="text-2xl font-header text-blue-900 mt-1">{stats.storedCount}</div>
          <div className="text-xs opacity-70 mt-2">Ready to ship when you are</div>
        </div>

        <div className="p-4 rounded-xl border border-black/5 bg-purple-50">
          <div className="text-sm font-medium text-purple-800">Wishlist</div>
          <div className="text-2xl font-header text-purple-900 mt-1">{stats.wishlistCount}</div>
          <div className="text-xs opacity-70 mt-2">Cards you're watching</div>
        </div>
      </div>
    </div>
  )
}

/* ===== LIVE CARDS TAB ===== */
function LiveCardsTab() {
  const { user } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: string }>({})
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function fetchCards() {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('owner_user_id', user.id)
        .eq('status', 'live')
        .order('created_at', { ascending: false })
      
      setCards(data || [])
      setLoading(false)
    }
    fetchCards()
  }, [user])

  const updatePrice = async (cardId: string) => {
    const newPrice = parseFloat(editingPrice[cardId])
    if (!newPrice || newPrice <= 0) {
      alert('Please enter a valid price')
      return
    }

    setUpdating(cardId)
    const { error } = await supabase
      .from('cards')
      .update({ price: newPrice })
      .eq('id', cardId)

    if (!error) {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, price: newPrice } : c))
      setEditingPrice(prev => ({ ...prev, [cardId]: '' }))
    }
    setUpdating(null)
  }

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">You don't have any live cards yet.</p>
        <p className="text-sm opacity-60">Cards you approve will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-header text-lg">Your Live Cards ({cards.length})</h2>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="rounded-xl border border-black/5 p-3 hover:shadow-md transition">
            <div className="aspect-[3/4] rounded-lg bg-black/5 mb-2 overflow-hidden">
              {card.image_url && <img src={card.image_url} alt={card.title} className="w-full h-full object-cover" />}
            </div>
            <h3 className="text-sm font-medium line-clamp-2 mb-2">{card.title || card.text}</h3>
            
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={`£${card.price?.toFixed(2) || '0.00'}`}
                value={editingPrice[card.id] || ''}
                onChange={(e) => setEditingPrice(prev => ({ ...prev, [card.id]: e.target.value }))}
                className="flex-1 px-2 py-1 border rounded-lg text-sm"
              />
              <button
                onClick={() => updatePrice(card.id)}
                disabled={updating === card.id || !editingPrice[card.id]}
                className="px-3 py-1 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
              >
                {updating === card.id ? '...' : 'Update'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== PENDING CARDS TAB ===== */
function PendingCardsTab() {
  const { user } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState<{ [key: string]: string }>({})
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function fetchCards() {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('owner_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      setCards(data || [])
      setLoading(false)
    }
    fetchCards()
  }, [user])

  const approveCard = async (cardId: string) => {
    const price = parseFloat(prices[cardId])
    if (!price || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    setUpdating(cardId)
    const { error } = await supabase
      .from('cards')
      .update({ price, status: 'live' })
      .eq('id', cardId)

    if (!error) {
      setCards(prev => prev.filter(c => c.id !== cardId))
      alert('Card is now live!')
    }
    setUpdating(null)
  }

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">No pending cards.</p>
        <p className="text-sm opacity-60">Submit new cards to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-header text-lg">Pending Approval ({cards.length})</h2>
      <p className="text-sm opacity-70">Set prices for these cards to make them live on the marketplace.</p>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="rounded-xl border border-black/5 p-3">
            <div className="aspect-[3/4] rounded-lg bg-black/5 mb-2 overflow-hidden">
              {card.image_url && <img src={card.image_url} alt={card.title} className="w-full h-full object-cover" />}
            </div>
            <h3 className="text-sm font-medium line-clamp-2 mb-2">{card.title || card.text}</h3>
            
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Set price (£)"
              value={prices[card.id] || ''}
              onChange={(e) => setPrices(prev => ({ ...prev, [card.id]: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <button
              onClick={() => approveCard(card.id)}
              disabled={updating === card.id || !prices[card.id]}
              className="w-full px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
            >
              {updating === card.id ? 'Approving...' : 'Approve & Go Live'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== ORDERS TAB ===== */
function OrdersTab() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setOrders((data || []).map(order => ({
        ...order,
        card_count: order.order_items?.[0]?.count || 0
      })))
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">No orders yet.</p>
        <p className="text-sm opacity-60">Start shopping to see your orders here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-header text-lg">Your Orders ({orders.length})</h2>
      
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="p-4 rounded-xl border border-black/5 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                <div className="text-sm opacity-70 mt-1">
                  {order.card_count} {order.card_count === 1 ? 'card' : 'cards'} • £{order.total.toFixed(2)}
                </div>
                <div className="text-xs opacity-60 mt-1">
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'stored' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
                {order.shipping_method === 'store' && order.status === 'stored' && (
                  <button className="block mt-2 text-xs text-primary hover:underline">
                    Ship Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== WISHLIST TAB ===== */
function WishlistTab() {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchWishlist() {
      const { data } = await supabase
        .from('wishlists')
        .select(`
          id,
          card:cards(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setItems((data || []) as any)
      setLoading(false)
    }
    fetchWishlist()
  }, [user])

  const removeItem = async (wishlistId: string) => {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId)
    
    if (!error) {
      setItems(prev => prev.filter(item => item.id !== wishlistId))
    }
  }

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">Your wishlist is empty.</p>
        <p className="text-sm opacity-60">Click the heart icon on cards to save them here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-header text-lg">Your Wishlist ({items.length})</h2>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-black/5 p-3 hover:shadow-md transition group">
            <div className="aspect-[3/4] rounded-lg bg-black/5 mb-2 overflow-hidden">
              {item.card.image_url && <img src={item.card.image_url} alt={item.card.title} className="w-full h-full object-cover" />}
            </div>
            <h3 className="text-sm font-medium line-clamp-2 mb-1">{item.card.title}</h3>
            <div className="text-sm font-header mb-2">£{item.card.price?.toFixed(2)}</div>
            
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1 rounded-lg bg-primary text-white text-sm hover:opacity-90">
                Add to Basket
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="px-3 py-1 rounded-lg border border-black/10 text-sm hover:bg-black/5"
                title="Remove from wishlist"
              >
                ♥
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== SUBMIT CARDS TAB ===== */
function SubmitCardsTab() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-header text-xl mb-4">Submit New Cards</h2>
      <p className="opacity-70 mb-6">
        Ready to sell your cards? Fill out our consignment form and we'll handle the rest.
      </p>
      
      <div className="p-6 rounded-xl border border-black/5 bg-black/[0.02]">
        <h3 className="font-medium mb-3">How it works:</h3>
        <ol className="space-y-2 text-sm opacity-80">
          <li>1. Fill out the submission form with your card details</li>
          <li>2. Send your cards to us (we'll provide the address)</li>
          <li>3. We scan, list, and promote your cards</li>
          <li>4. Set your price and approve them to go live</li>
          <li>5. Get paid when they sell!</li>
        </ol>
      </div>

      <button className="mt-6 px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90">
        Start Submission Form
      </button>
    </div>
  )
}
