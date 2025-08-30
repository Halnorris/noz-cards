import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type Card = {
  id: string
  title: string | null
  price: number | null
  image_url: string | null           // front
  image_back_url: string | null      // back
}

export default function CardPage() {
  const { id } = useParams<{ id: string }>()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [showBack, setShowBack] = useState(false)

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
        setShowBack(false) // default to front on load
      }
      setLoading(false)
    }
    fetchCard()
  }, [id])

  function handleBuyNow() {
    // TODO: route to /checkout/:id or create Stripe Checkout Session
    console.log('Buy Now', card?.id)
  }
  function handleAddToBasket() {
    // TODO: persist to localStorage or Supabase table
    console.log('Add to Basket', card?.id)
  }
  function handleToggleWishlist() {
    setWishlisted((w) => !w)
    // TODO: persist to Supabase if logged in
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-40 bg-black/10 rounded" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-[3/4] bg-black/10 rounded-xl" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 bg-black/10 rounded" />
            <div className="h-4 w-1/3 bg-black/10 rounded" />
            <div className="h-10 w-40 bg-black/10 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="space-y-3">
        <p className="text-sm opacity-70">{error ?? "Couldn't load this card."}</p>
        <Link to="/marketplace" className="underline">Back to Marketplace</Link>
      </div>
    )
  }

  const mainImage = showBack ? card.image_back_url : card.image_url

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
        {/* Image column */}
        <div className="rounded-2xl bg-white p-3 shadow-soft border border-black/5">
          <div className="relative mx-auto max-h-[60vh] aspect-[3/4] rounded-xl bg-black/5 overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage}
                alt={`${card.title ?? 'Card'} ${showBack ? '(Back)' : '(Front)'}`}
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-xs opacity-60">
                No Image
              </div>
            )}
          </div>

          {/* Front/Back selector */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowBack(false)}
              className={`rounded-xl border p-2 transition ${
                !showBack ? 'border-primary ring-2 ring-primary/30' : 'border-black/10 hover:bg-black/5'
              }`}
              aria-pressed={!showBack}
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-black/5">
                {card.image_url ? (
                  <img src={card.image_url} alt="Front" className="object-contain w-full h-full" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-[11px] opacity-60">Front</div>
                )}
              </div>
              <div className="mt-1 text-xs text-center">Front</div>
            </button>

            <button
              type="button"
              onClick={() => setShowBack(true)}
              className={`rounded-xl border p-2 transition ${
                showBack ? 'border-primary ring-2 ring-primary/30' : 'border-black/10 hover:bg-black/5'
              }`}
              aria-pressed={showBack}
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-black/5">
                {card.image_back_url ? (
                  <img src={card.image_back_url} alt="Back" className="object-contain w-full h-full" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-[11px] opacity-60">Back</div>
                )}
              </div>
              <div className="mt-1 text-xs text-center">Back</div>
            </button>
          </div>
        </div>

        {/* Info column */}
        <div className="space-y-4">
          <h1 className="font-header text-2xl">{card.title ?? 'Untitled card'}</h1>
          {card.price != null && <div className="text-xl">£{card.price}</div>}

          {/* Actions: Buy Now + icon-only buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleBuyNow}
              className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90"
            >
              Buy Now
            </button>

            {/* Add to Basket (cart icon) */}
            <button
              onClick={handleAddToBasket}
              aria-label="Add to Basket"
              title="Add to Basket"
              className="p-3 rounded-xl border border-black/10 hover:bg-black/5"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="2">
                <path d="M6 6h15l-1.5 9H7.5L6 6Z" />
                <path d="M6 6H3" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
              </svg>
            </button>

            {/* Wishlist (heart icon) */}
            <button
              onClick={handleToggleWishlist}
              aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`p-3 rounded-xl border ${
                wishlisted ? 'border-red-300 bg-red-50' : 'border-black/10 hover:bg-black/5'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-5 h-5 ${wishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`}
                strokeWidth="2"
              >
                <path d="M12 21s-6.716-4.403-9.167-7.4C.785 11.246 1.26 8.28 3.44 6.85a4.5 4.5 0 0 1 5.51.49L12 9.2l3.05-1.86a4.5 4.5 0 0 1 5.51-.49c2.18 1.43 2.66 4.396.607 6.75C18.716 16.597 12 21 12 21Z" />
              </svg>
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
