import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type Card = {
  id: string
  title: string | null
  price: number | null
  image_url: string | null
  image_back_url: string | null
}

export default function CardPage() {
  const { id } = useParams<{ id: string }>()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    async function fetchCard() {
      if (!id) {
        setError('Missing card id.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('cards')
        .select('id,title,price,image_url,image_back_url')
        .eq('id', id)
        .single()

      if (error) {
        setError('Card not found.')
        setCard(null)
      } else {
        setCard(data as Card)
      }
      setLoading(false)
    }
    fetchCard()
  }, [id])

  if (loading) {
    return <div className="opacity-70">Loading card…</div>
  }

  if (error || !card) {
    return (
      <div className="space-y-3">
        <p className="text-sm opacity-70">{error ?? "Couldn't load this card."}</p>
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
        {/* Card Images: front + back */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-3 shadow-soft border border-black/5">
            <div className="relative aspect-[3/4] max-h-[60vh] rounded-xl bg-black/5 overflow-hidden">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={`${card.title ?? 'Card'} (Front)`}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs opacity-60">
                  No Front Image
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-soft border border-black/5">
            <div className="relative aspect-[3/4] max-h-[60vh] rounded-xl bg-black/5 overflow-hidden">
              {card.image_back_url ? (
                <img
                  src={card.image_back_url}
                  alt={`${card.title ?? 'Card'} (Back)`}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs opacity-60">
                  No Back Image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="font-header text-2xl">{card.title ?? 'Untitled card'}</h1>

          {card.price != null && (
            <div className="text-xl">£{card.price}</div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90">
              Buy Now
            </button>
            <button className="px-5 py-3 rounded-xl border border-black/10 hover:bg-black/5">
              Add to Basket
            </button>
            <button
              onClick={() => setWishlisted((w) => !w)}
              className={`px-4 py-3 rounded-xl border ${wishlisted ? 'border-red-300 bg-red-50 text-red-600' : 'border-black/10 hover:bg-black/5'}`}
            >
              {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>

          <div className="text-xs opacity-70 pt-2">
            Instant checkout. Buyer pays +10% at checkout. Seller receives payout via Stripe (15% fee deducted).
          </div>
        </div>
      </div>
    </div>
  )
}
