import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBasket } from '@/context/basket'

type Card = {
  id: string
  title: string | null
  price: number | null
  image_url: string | null        // front
  image_back_url: string | null   // back
}

export default function CardPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useBasket()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0) // 0 = first image

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
        setActiveIndex(0)
      }
      setLoading(false)
    }
    fetchCard()
  }, [id])

  const images = useMemo(() => {
    if (!card) return []
    return [
      card.image_url ? { src: card.image_url, label: 'Front' } : null,
      card.image_back_url ? { src: card.image_back_url, label: 'Back' } : null,
    ].filter(Boolean) as { src: string; label: string }[]
  }, [card])

  function handleBuyNow() {
    // TODO: route to /checkout/:id or create Stripe Checkout Session
    console.log('Buy Now', card?.id)
  }

  function handleAddToBasket() {
    if (!card) return
    addItem(
      {
        id: card.id,
        title: card.title ?? 'Card',
        price: card.price,
        image_url: (card.image_url ?? card.image_back_url) ?? null,
      },
      1
    )
  }

  function handleToggleWishlist() {
    setWishlisted((w) => !w)
    // TODO: persist to Supabase when auth is in
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

  const main = images[activeIndex]?.src

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
        {/* Image column with vertical thumbnails */}
        <div className="rounded-2xl bg-white p-3 shadow-soft border border-black/5">
          <div className="flex gap-3">
            {/* Thumbs (vertical on sm+) */}
            <div className="hidden sm:flex flex-col gap-2 w-16">
              {images.map((img, idx) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-lg overflow-hidden border aspect-[3/4] ${
                    activeIndex === idx
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-black/10 hover:bg-black/5'
                  }`}
                  aria-label={`Show ${img.label}`}
                  aria-pressed={activeIndex === idx}
                >
                  <img src={img.src} alt={img.label} className="object-contain w-full h-full bg-black/5" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative flex-1">
              <div className="mx-auto max-h-[60vh] aspect-[3/4] rounded-xl bg-black/5 overflow-hidden">
                {main ? (
                  <img
                    src={main}
                    alt={`${card.title ?? 'Card'} (${images[activeIndex]?.label ?? 'Image'})`}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs opacity-60">
                    No Image
                  </div>
                )}
              </div>

              {/* Mobile thumbs below main image */}
              {images.length > 1 && (
                <div className="sm:hidden mt-3 grid grid-cols-2 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`rounded-lg overflow-hidden border aspect-[3/4] ${
                        activeIndex === idx
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-black/10 hover:bg-black/5'
                      }`}
                      aria-label={`Show ${img.label}`}
                      aria-pressed={activeIndex === idx}
                    >
                      <img src={img.src} alt={img.label} className="object-contain w-full h-full bg-black/5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info column */}
        <div className="space-y-4">
          <h1 className="font-header text-2xl">{card.title ?? 'Untitled card'}</h1>
          {card.price != null && <div className="text-xl">£{card.price}</div>}

          {/* Actions: Buy Now + cart + heart */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleBuyNow}
              className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90"
            >
              Buy Now
            </button>

            {/* Add to Basket (icon-only) */}
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

            {/* Wishlist (icon-only) */}
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
