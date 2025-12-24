import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth'

interface Card {
  id: string
  nozid: string
  text: string
  price: number | null
  image_url: string
  status: string
}

export default function Pending() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState<{ [key: string]: string }>({})
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin')
      return
    }

    if (!user) return

    async function fetchPendingCards() {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('owner_user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching cards:', error)
        } else {
          setCards(data || [])
          // Initialize price inputs with existing prices
          const initialPrices: { [key: string]: string } = {}
          data?.forEach(card => {
            if (card.price) {
              initialPrices[card.id] = card.price.toString()
            }
          })
          setPrices(initialPrices)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingCards()
  }, [user, authLoading, navigate])

  const handlePriceChange = (cardId: string, value: string) => {
    setPrices(prev => ({ ...prev, [cardId]: value }))
  }

  const confirmPrice = async (cardId: string) => {
    const price = parseFloat(prices[cardId])
    
    if (!price || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    setUpdating(cardId)

    try {
      const { error } = await supabase
        .from('cards')
        .update({ 
          price: price,
          status: 'live'
        })
        .eq('id', cardId)

      if (error) {
        console.error('Error updating card:', error)
        alert('Failed to update card')
      } else {
        // Remove card from pending list
        setCards(prev => prev.filter(c => c.id !== cardId))
        alert('Card is now live!')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update card')
    } finally {
      setUpdating(null)
    }
  }

  if (authLoading || loading) {
    return (
      <section className="space-y-4">
        <h1 className="font-header text-2xl">Pending Cards</h1>
        <div className="text-center py-8 opacity-70">Loading your pending cards...</div>
      </section>
    )
  }

  if (cards.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="font-header text-2xl">Pending Cards</h1>
        <div className="text-center py-12 opacity-70">
          <p>No pending cards at the moment.</p>
          <p className="text-sm mt-2">Cards you submit will appear here for you to set prices.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h1 className="font-header text-2xl">Pending Cards</h1>
      <p className="text-sm opacity-70">Set your price and confirm to make these cards live on the marketplace.</p>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl bg-white p-4 shadow-soft border border-black/5">
            <div className="aspect-[3/4] rounded-xl bg-black/5 mb-3 overflow-hidden">
              {card.image_url && (
                <img 
                  src={card.image_url} 
                  alt={card.text || 'Card'} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-sm opacity-80 mb-2 line-clamp-2">
              {card.text || `Card #${card.nozid}`}
            </div>
            <input
              className="w-full border rounded-xl px-3 py-2 mb-2"
              placeholder="Set your price (£)"
              type="number"
              min="0"
              step="0.01"
              value={prices[card.id] || ''}
              onChange={(e) => handlePriceChange(card.id, e.target.value)}
              disabled={updating === card.id}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => confirmPrice(card.id)}
                disabled={updating === card.id}
                className="flex-1 px-3 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50"
              >
                {updating === card.id ? 'Updating...' : 'Confirm & Go Live'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
