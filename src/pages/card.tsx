import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type Card = {
  id: string
  title: string | null
  description?: string | null
  price: number | null
  image_url: string | null
  status?: string | null
  created_at?: string
}

export default function CardPage() {
  const { id } = useParams()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCard() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('cards')
        .select('id,title,description,price,image_url,status,created_at')
        .eq('id', id)
        .single()
      if (error) setError('Card not found.')
      setCard(data as Card | null)
      setLoading(false)
    }
    if (id) fetchCard()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-40 bg-black/10 rounded" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-[3/4] bg-black/10 rounded-xl" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 bg-black/10 rounded" />
            <div className="h-4 w-1/3 bg-black/10 rounded" />
            <div className="h-20 w-full bg-black/10 rounded" />
            <div className="h-10 w-40 bg-black/10 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="space-y-3">
        <p className="text-sm opacity-70">Couldn’t load this card.</p>
        <Link to="/marketplace" className="underline">Back to Marketplace</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm opacity-70">
        <Link to="/" className="underline">Home</Link>
        <span> / </span>
        <Link to="/marketplace" className="underline">Marketplace</Link>
        <span> / </span>
        <span className="opacity-100">{card.title ?? 'Card'}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Image */}
        <div className="rounded-2xl bg-white p-3 shadow-soft border border-black/5">
          <div className="aspect-[3/4] bg-black/5 rounded-xl overflow-hidden">
            {card.image_url ? (
              <img src={card.image_url} alt={card.title ?? 'Card'} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs opacity-60">No Image</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="font-header text-2xl">{card.title ?? 'Untitled card'}</h1>
          {card.price != null && (
            <div className="text-xl">£{card.price}</div>
          )}

          <div className="text-sm opacity-80 space-y-2">
            {card.status && <p>Status: <span className="opacity-100">{card.status}</span></p>}
            {card.description ? <p>{card.description}</p> : <p>No description provided.</p>}
          </div>

          {/* Actions (wire to Stripe checkout later) */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90">
              Buy Now
            </button>
            <button className="px-5 py-3 rounded-xl border border-black/10 hover:bg-black/5">
              Add to Collection
            </button>
          </div>

          {/* Trust copy */}
          <div className="text-xs opacity-70 pt-2">
            Instant checkout. Buyer pays +10% fee at checkout. Seller receives payout via Stripe (15% fee deducted).
          </div>
        </div>
      </div>
    </div>
  )
}
