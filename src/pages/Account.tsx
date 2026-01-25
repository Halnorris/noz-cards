import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth'
import { useBasket } from '@/context/basket'

type Tab = 'dashboard' | 'live' | 'pending' | 'stored' | 'orders' | 'wishlist' | 'settings' | 'submit'

type Card = {
  id: string
  nozid: string
  title: string
  text: string
  price: number | null
  image_url: string
  status: string
  created_at: string
  view_count?: number
  wishlist_count?: number
}

type Order = {
  id: string
  shipping_method: string
  subtotal?: number
  shipping_cost?: number
  total: number
  status: string
  created_at: string
  shipping_address?: string
  order_items?: any[]
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
  }, [user, authLoading, navigate, activeTab])

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
    { id: 'stored', label: 'Stored Cards', count: stats.storedCount },
    { id: 'orders', label: 'Orders', count: stats.ordersCount },
    { id: 'wishlist', label: 'Wishlist', count: stats.wishlistCount },
    { id: 'settings', label: 'Settings' },
    { id: 'submit', label: 'Submit Cards' },
  ]

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
        <h1 className="font-header text-2xl mb-4">Account Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Live Cards</div>
            <div className="text-2xl font-header">{stats.liveCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Pending</div>
            <div className="text-2xl font-header">{stats.pendingCount}</div>
          </div>
          <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02]">
            <div className="text-xs opacity-70">Stored</div>
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
        {activeTab === 'stored' && <StoredCardsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'wishlist' && <WishlistTab />}
        {activeTab === 'settings' && <SettingsTab />}
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
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: string }>({})
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc'>('newest')

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

  // Filter and sort
  useEffect(() => {
    let filtered = cards.filter(card => 
      (card.title || card.text || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0)
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0)
      return 0
    })

    setFilteredCards(filtered)
  }, [cards, searchTerm, sortBy])

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

  const requestBack = async (cardId: string) => {
    if (!confirm('Remove this card from the marketplace?')) return

    const { error } = await supabase
      .from('cards')
      .update({ status: 'pending' })
      .eq('id', cardId)

    if (!error) {
      setCards(prev => prev.filter(c => c.id !== cardId))
      alert('Card removed from marketplace')
    }
  }

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">You don't have any live cards yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="font-header text-lg">Your Live Cards ({filteredCards.length})</h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 sm:w-48 px-3 py-1.5 border rounded-xl text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border rounded-xl text-sm bg-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low-High</option>
            <option value="price_desc">Price: High-Low</option>
          </select>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredCards.map((card) => (
          <div key={card.id} className="rounded-xl border border-black/5 p-2 hover:shadow-md transition">
            <div className="aspect-[3/4] rounded-lg bg-black/5 mb-2 overflow-hidden relative">
              {card.image_url && <img src={card.image_url} alt={card.title} className="w-full h-full object-cover" />}
            </div>
            <h3 className="text-xs font-medium line-clamp-2 mb-2 min-h-[2rem]">{card.title || card.text}</h3>
            
            <div className="text-[10px] opacity-70 mb-1">Current: £{card.price?.toFixed(2) || '0.00'}</div>
            
            <div className="flex gap-1 items-center mb-1">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="New price"
                value={editingPrice[card.id] || ''}
                onChange={(e) => setEditingPrice(prev => ({ ...prev, [card.id]: e.target.value }))}
                className="flex-1 min-w-0 px-1.5 py-1 border rounded text-[11px]"
              />
              <button
                onClick={() => updatePrice(card.id)}
                disabled={updating === card.id || !editingPrice[card.id]}
                className="shrink-0 w-6 h-6 rounded bg-primary text-white text-xs hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                title="Update price"
              >
                {updating === card.id ? '...' : '✓'}
              </button>
            </div>

            <button
              onClick={() => requestBack(card.id)}
              className="w-full px-2 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] hover:bg-red-100"
            >
              Request Back
            </button>
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
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState<{ [key: string]: string }>({})
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc'>('newest')

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
      // Pre-fill prices with existing values
      const initialPrices: { [key: string]: string } = {}
      data?.forEach(card => {
        if (card.price) {
          initialPrices[card.id] = card.price.toString()
        }
      })
      setPrices(initialPrices)
      setLoading(false)
    }
    fetchCards()
  }, [user])

  // Filter and sort
  useEffect(() => {
    let filtered = cards.filter(card => 
      (card.title || card.text || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0)
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0)
      return 0
    })

    setFilteredCards(filtered)
  }, [cards, searchTerm, sortBy])

  const approveCard = async (cardId: string) => {
    const priceValue = prices[cardId]?.trim()
    
    if (!priceValue) {
      alert('Please enter a price before approving')
      return
    }
    
    const price = parseFloat(priceValue)
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than £0')
      return
    }

    setUpdating(cardId)
    
    try {
      const { error: updateError } = await supabase
        .from('cards')
        .update({ price, status: 'live' })
        .eq('id', cardId)

      if (updateError) {
        console.error('Error updating card:', updateError)
        alert('Failed to approve card: ' + updateError.message)
        setUpdating(null)
        return
      }

      const { data: checkData, error: checkError } = await supabase
        .from('cards')
        .select('status')
        .eq('id', cardId)
        .single()

      if (checkError) {
        console.error('Error verifying update:', checkError)
        setCards(prev => prev.filter(c => c.id !== cardId))
        setPrices(prev => {
          const newPrices = { ...prev }
          delete newPrices[cardId]
          return newPrices
        })
        alert(`Card approved! (Verification failed but update should be successful)`)
      } else if (checkData.status === 'live') {
        setCards(prev => prev.filter(c => c.id !== cardId))
        setPrices(prev => {
          const newPrices = { ...prev }
          delete newPrices[cardId]
          return newPrices
        })
        alert(`Card approved and is now live at £${price.toFixed(2)}!`)
      } else {
        console.error('Card status did not change to live')
        alert('Card may not have been updated. Please refresh and try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to approve card: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUpdating(null)
    }
  }

  const bulkApproveSuggested = async () => {
    if (!confirm(`Approve all ${filteredCards.length} cards with suggested prices?`)) return

    setUpdating('bulk')
    const updates = filteredCards
      .filter(card => card.price && card.price > 0)
      .map(card => 
        supabase.from('cards').update({ status: 'live' }).eq('id', card.id)
      )

    await Promise.all(updates)
    setCards([])
    setUpdating(null)
    alert('All cards approved!')
  }

  const requestBack = async (cardId: string) => {
    if (!confirm('Remove this card from pending?')) return

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (!error) {
      setCards(prev => prev.filter(c => c.id !== cardId))
    }
  }

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">No pending cards.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="font-header text-lg">Pending Approval ({filteredCards.length})</h2>
        
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 sm:w-48 px-3 py-1.5 border rounded-xl text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border rounded-xl text-sm bg-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low-High</option>
            <option value="price_desc">Price: High-Low</option>
          </select>
          <button
            onClick={bulkApproveSuggested}
            disabled={updating === 'bulk' || filteredCards.length === 0}
            className="px-4 py-1.5 rounded-xl bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {updating === 'bulk' ? 'Approving...' : 'Approve All'}
          </button>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {filteredCards.map((card) => {
          const hasPrice = prices[card.id] && parseFloat(prices[card.id]) > 0
          const suggestedPrice = card.price
          
          return (
            <div key={card.id} className="rounded-xl border border-black/5 p-2 hover:shadow-md transition">
              <div className="aspect-[3/4] rounded-lg bg-black/5 mb-2 overflow-hidden">
                {card.image_url && <img src={card.image_url} alt={card.title} className="w-full h-full object-cover" />}
              </div>
              <h3 className="text-xs font-medium line-clamp-2 mb-2 min-h-[2rem]">{card.title || card.text}</h3>
              
              {suggestedPrice && (
                <div className="text-[10px] opacity-70 mb-1">Suggested: £{suggestedPrice.toFixed(2)}</div>
              )}
              
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Your price"
                value={prices[card.id] || ''}
                onChange={(e) => setPrices(prev => ({ ...prev, [card.id]: e.target.value }))}
                className="w-full px-1.5 py-1 border rounded text-[11px] mb-1"
                disabled={updating === card.id}
              />
              <button
                onClick={() => approveCard(card.id)}
                disabled={updating === card.id || !hasPrice}
                className={`w-full px-2 py-1 rounded text-white text-[10px] transition mb-1 ${
                  hasPrice && updating !== card.id
                    ? 'bg-primary hover:opacity-90'
                    : 'bg-black/20 cursor-not-allowed'
                }`}
              >
                {updating === card.id ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => requestBack(card.id)}
                disabled={updating === card.id}
                className="w-full px-2 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] hover:bg-red-100 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ===== STORED CARDS TAB ===== */
function StoredCardsTab() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    
    async function fetchStoredOrders() {
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
        .eq('user_id', user.id)
        .eq('status', 'stored')
        .order('created_at', { ascending: false })
      
      setOrders(data || [])
      setLoading(false)
    }
    
    fetchStoredOrders()
  }, [user])

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)))
    }
  }

  const shipSelected = () => {
    if (selectedOrders.size === 0) {
      alert('Please select cards to ship')
      return
    }
    // Navigate to shipping checkout with selected order IDs
    const orderIdsParam = Array.from(selectedOrders).join(',')
    navigate(`/ship-stored?orders=${orderIdsParam}`)
  }

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">No stored cards.</p>
        <p className="text-sm opacity-60">Cards you choose to store will appear here.</p>
      </div>
    )
  }

  const totalCards = orders.reduce((sum, order) => sum + (order.order_items?.length || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-header text-lg">Stored Cards</h2>
          <p className="text-sm opacity-70">{totalCards} cards waiting to ship</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleAll}
            className="px-4 py-2 rounded-xl border border-black/10 text-sm hover:bg-black/5"
          >
            {selectedOrders.size === orders.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={shipSelected}
            disabled={selectedOrders.size === 0}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            Ship Selected ({selectedOrders.size})
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="p-4 rounded-xl border border-black/5 hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedOrders.has(order.id)}
                onChange={() => toggleOrder(order.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium mb-2">
                  Order #{order.id.slice(0, 8)} • {order.order_items?.length || 0} cards
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="rounded-lg border border-black/5 p-2">
                      <div className="aspect-[3/4] rounded bg-black/5 mb-1 overflow-hidden">
                        {item.card_image_url ? (
                          <img 
                            src={item.card_image_url} 
                            alt={item.card_title || 'Card'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs opacity-50">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] truncate">{item.card_title || item.card_nozid || 'Card'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            price,
            card_title,
            card_image_url,
            card_nozid
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-70 mb-4">No orders yet.</p>
      </div>
    )
  }

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  return (
    <div className="space-y-4">
      <h2 className="font-header text-lg">Your Orders ({orders.length})</h2>
      
      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id
          const itemCount = order.order_items?.length || 0
          
          return (
            <div 
              key={order.id} 
              className="rounded-xl border border-black/5 overflow-hidden hover:shadow-md transition"
            >
              {/* Order Summary - Clickable */}
              <button
                onClick={() => toggleOrder(order.id)}
                className="w-full p-4 text-left hover:bg-black/[0.02] transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                    <div className="text-sm opacity-70 mt-1">
                      {itemCount} {itemCount === 1 ? 'card' : 'cards'} • £{order.total.toFixed(2)}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : order.status === 'stored'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'paid' ? 'Paid' : order.status === 'stored' ? 'Stored' : 'Pending'}
                    </span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Order Details - Expandable */}
              {isExpanded && (
                <div className="border-t border-black/5 p-4 bg-black/[0.01]">
                  <h3 className="font-medium text-sm mb-3">Order Items:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="rounded-lg border border-black/5 bg-white p-2">
                        <div className="aspect-[3/4] rounded bg-black/5 mb-2 overflow-hidden">
                          {item.card_image_url ? (
                            <img 
                              src={item.card_image_url} 
                              alt={item.card_title || 'Card'} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs opacity-50">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-medium truncate mb-1">
                          {item.card_title || item.card_nozid || 'Card'}
                        </div>
                        <div className="text-xs opacity-70">
                          £{item.price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info */}
                  <div className="mt-4 pt-4 border-t border-black/5">
                    <div className="text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="opacity-70">Subtotal:</span>
                        <span className="font-medium">£{order.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="opacity-70">Shipping:</span>
                        <span className="font-medium">
                          {order.shipping_cost === 0 ? 'FREE' : `£${order.shipping_cost?.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-black/5">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-primary">£{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    {order.shipping_address && order.shipping_method !== 'store' && (
                      <div className="mt-3 text-xs opacity-70">
                        <div className="font-medium mb-1">Shipping to:</div>
                        <div>{order.shipping_address}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ===== WISHLIST TAB ===== */
function WishlistTab() {
  const { user } = useAuth()
  const { addItem } = useBasket()
  const navigate = useNavigate()
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

  const buyAll = () => {
    const validItems = items.filter(item => item.card !== null)
    if (validItems.length === 0) return
    
    validItems.forEach(item => {
      addItem({
        id: item.card.id,
        title: item.card.title,
        price: item.card.price,
        image_url: item.card.image_url,
      })
    })
    
    navigate('/checkout')
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

  // Filter out items where the card has been deleted
  const validItems = items.filter(item => item.card !== null)
  const total = validItems.reduce((sum, item) => sum + (item.card?.price || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-header text-lg">Your Wishlist ({validItems.length})</h2>
          <p className="text-sm opacity-70">Total: £{total.toFixed(2)}</p>
        </div>
        <button
          onClick={buyAll}
          disabled={validItems.length === 0}
          className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50"
        >
          Buy All ({validItems.length})
        </button>
      </div>
      
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {validItems.map((item) => (
          <div key={item.id} className="rounded-xl border border-black/5 p-2 hover:shadow-md transition group">
            <div className="aspect-[3/4] rounded-lg bg-black/5 mb-2 overflow-hidden">
              {item.card.image_url && <img src={item.card.image_url} alt={item.card.title} className="w-full h-full object-cover" />}
            </div>
            <h3 className="text-xs font-medium line-clamp-2 mb-2 min-h-[2rem]">{item.card.title}</h3>
            <div className="text-sm font-header mb-2">£{item.card.price?.toFixed(2)}</div>
            
            <div className="flex gap-1">
              <button
                onClick={() => {
                  addItem({
                    id: item.card.id,
                    title: item.card.title,
                    price: item.card.price,
                    image_url: item.card.image_url,
                  })
                }}
                className="flex-1 px-2 py-1 rounded-lg bg-primary text-white text-[10px] hover:opacity-90"
              >
                Add to Basket
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="px-2 py-1 rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs hover:bg-red-100"
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

/* ===== SETTINGS TAB ===== */
function SettingsTab() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (!user) return
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          postcode: data.postcode || '',
          country: data.country || 'United Kingdom',
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone || null,
        address_line1: profile.address_line1,
        address_line2: profile.address_line2 || null,
        city: profile.city,
        postcode: profile.postcode,
        country: profile.country,
      })
      .eq('id', user!.id)

    setSaving(false)
    if (!error) {
      alert('Profile updated successfully!')
    } else {
      alert('Failed to update profile')
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwords.new.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      password: passwords.new
    })

    setSaving(false)
    if (!error) {
      alert('Password changed successfully!')
      setPasswords({ current: '', new: '', confirm: '' })
    } else {
      setPasswordError(error.message)
    }
  }

  if (loading) return <div className="text-center py-8 opacity-70">Loading...</div>

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="font-header text-xl mb-2">Account Settings</h2>
        <p className="text-sm opacity-70">Manage your profile and preferences</p>
      </div>

      <form onSubmit={saveProfile} className="space-y-6">
        <div className="p-6 rounded-xl border border-black/5 bg-black/[0.02] space-y-4">
          <h3 className="font-header text-lg">Profile Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border rounded-xl bg-black/5 opacity-70"
              />
              <p className="text-xs opacity-60 mt-1">Email cannot be changed here</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-xl"
              placeholder="07123 456789"
            />
          </div>

          <h4 className="font-medium text-sm pt-4">Default Shipping Address</h4>
          <p className="text-xs opacity-70">This address will be pre-filled at checkout</p>

          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
            <input
              type="text"
              required
              value={profile.address_line1}
              onChange={(e) => setProfile(prev => ({ ...prev, address_line1: e.target.value }))}
              className="w-full px-3 py-2 border rounded-xl"
              placeholder="123 High Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2</label>
            <input
              type="text"
              value={profile.address_line2}
              onChange={(e) => setProfile(prev => ({ ...prev, address_line2: e.target.value }))}
              className="w-full px-3 py-2 border rounded-xl"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                type="text"
                required
                value={profile.city}
                onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="London"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Postcode *</label>
              <input
                type="text"
                required
                value={profile.postcode}
                onChange={(e) => setProfile(prev => ({ ...prev, postcode: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="SW1A 1AA"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country *</label>
            <select
              required
              value={profile.country}
              onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border rounded-xl bg-white"
            >
              <option value="United Kingdom">United Kingdom</option>
              <option value="Ireland">Ireland</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="p-6 rounded-xl border border-black/5 bg-black/[0.02] space-y-4">
        <h3 className="font-header text-lg">Change Password</h3>

        <div>
          <label className="block text-sm font-medium mb-1">New Password *</label>
          <input
            type="password"
            required
            minLength={6}
            value={passwords.new}
            onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
            className="w-full px-3 py-2 border rounded-xl"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password *</label>
          <input
            type="password"
            required
            minLength={6}
            value={passwords.confirm}
            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
            className="w-full px-3 py-2 border rounded-xl"
            placeholder="Re-enter new password"
          />
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {passwordError}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Changing...' : 'Change Password'}
        </button>
      </form>
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

      <Link 
        to="/submit-cards"
        className="mt-6 inline-block px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90"
      >
        Start Submission Form
      </Link>
    </div>
  )
}
