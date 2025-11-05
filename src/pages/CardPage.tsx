import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBasket } from '@/context/basket'

type Card = {
  id: string
  title: string | null
  price: number | null
  image_url: string | null
  image_back_url: string | null
  image_orientation?: 'portrait' | 'landscape' | null
  sport?: string | null
  league?: string | null
  team?: string | null
  set?: string | null
  created_at?: string
  owner_user_id?: string | null
}

type SimpleCard = {
  id: string
  title: string | null
  price: number | null
  image_url: string | null
  image_orientation?: 'portrait' | 'landscape' | null
  sport?: string | null
  league?: string | null
  team?: string | null
  set?: string | null
}

export default function CardPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem } = useBasket()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wishlisted, setWishlisted] = useState(false)

  // Gallery state
  const [activeIndex, setActiveIndex] = useState(0) // 0 = first image
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Related cards
  const [related, setRelated] = useState<SimpleCard[]>([])
  const [relatedLoading, setRelatedLoading] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()

  // Fetch primary card
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
        .select('id,title,price,image_url,image_back_url,image_orientation,sport,league,team,set,created_at,owner_user_id')
        .eq('id', id)
        .single()

      if (error || !data) {
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

  // Build images array
  const images = useMemo(() => {
    if (!card) return []
    return [
      card.image_url ? { src: card.image_url, label: 'Front' } : null,
      card.image_back_url ? { src: card.image_back_url, label: 'Back' } : null,
    ].filter(Boolean) as { src: string; label: string }[]
  }, [card])

  const main = images[activeIndex]?.src

  // Fetch related cards (prefer same team, fallback to same league)
  useEffect(() => {
    async function loadRelated() {
      if (!card) return
      setRelatedLoading(true)

      let query = supabase
        .from('cards')
        .select('id,title,price,image_url,image_orientation,sport,league,team,set')
        .eq('status', 'live')
        .neq('id', card.id)
        .limit(12)

      if (card.team) {
        query = query.eq('team', card.team)
      } else if (card.league) {
        query = query.eq('league', card.league)
      }

      const { data, error } = await query
      if (!error && data) setRelated(data as SimpleCard[])
      setRelatedLoading(false)
    }
    loadRelated()
  }, [card])

  function handleBuyNow() {
    // TODO: route to /checkout or Stripe Checkout
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

  // Preserve “back to where I was” (returns to previous page with filters)
  function handleBack() {
    // If history has somewhere to go back, do that; else send to marketplace
    if (window.history.length > 1) navigate(-1)
    else navigate('/marketplace')
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

  const orientation =
    card.image_orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'

  const chip = (label: string, param: string, value?: string | null) =>
    value ? (
      <Link
        to={`/marketplace?${param}=${encodeURIComponent(value)}`}
        className="px-2 py-1 rounded-full text-xs border border-black/10 hover:bg-black/5"
      >
        {label}: <span className="opacity-80">{value}</span>
      </Link>
    ) : null

  return (
    <div className="space-y-6">
      {/* Breadcrumbs + Back */}
      <div className="flex items-center justify-between gap-3">
        <nav className="text-sm opacity-70 truncate">
          <Link to="/" className="underline">Home</Link>
          <span> / </span>
          <Link to="/marketplace" className="underline">Marketplace</Link>
          <span> / </span>
          <span className="opacity-100">{card.title ?? 'Card'}</span>
        </nav>
        <button
          onClick={handleBack}
          className="text-sm px-3 py-1 rounded-xl border border-black/10 hover:bg-black/5"
        >
          Back
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* IMAGE COLUMN */}
        <div className="rounded-2xl bg-white p-3 shadow-soft border border-black/5">
          <div className="flex gap-3">
            {/* Thumbs (vertical on sm+) */}
            <div className="hidden sm:flex flex-col gap-2 w-16">
              {images.map((img, idx) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-lg overflow-hidden border ${orientation} ${
                    activeIndex === idx
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-black/10 hover:bg-black/5'
                  }`}
                  aria-label={`Show ${img.label}`}
                  aria-pressed={activeIndex === idx}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className="object-contain w-full h-full bg-black/5"
                  />
                </button>
              ))}
            </div>

            {/* Main image with lightbox trigger */}
            <div className="relative flex-1">
              <div
                className={`${orientation} mx-auto rounded-xl bg-black/5 overflow-hidden cursor-zoom-in`}
                onClick={() => main && setLightboxOpen(true)}
                aria-label="Open full image"
                role="button"
              >
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

              {/* Mobile thumbs */}
              {images.length > 1 && (
                <div className="sm:hidden mt-3 grid grid-cols-2 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`rounded-lg overflow-hidden border ${orientation} ${
                        activeIndex === idx
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-black/10 hover:bg-black/5'
                      }`}
                      aria-label={`Show ${img.label}`}
                      aria-pressed={activeIndex === idx}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className="object-contain w-full h-full bg-black/5"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Gallery controls */}
          <div className="mt-3 flex items-center gap-2">
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i === 0 ? 1 : 0))}
                className="px-3 py-1 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
              >
                Flip to {activeIndex === 0 ? 'Back' : 'Front'}
              </button>
            )}
            {main && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="px-3 py-1 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
              >
                Zoom
              </button>
            )}
          </div>
        </div>

        {/* INFO COLUMN (sticky) */}
        <div className="space-y-4 md:sticky md:top-20">
          <h1 className="font-header text-2xl">{card.title ?? 'Untitled card'}</h1>

          {/* Price + actions */}
          <div className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft space-y-3">
            {card.price != null && (
              <div className="text-2xl font-header">£{card.price}</div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBuyNow}
                className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90"
              >
                Buy Now
              </button>
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
            <div className="text-xs opacity-70">
              Instant checkout. Buyer pays +10% at checkout. Seller payout via Stripe (15% fee).
            </div>
          </div>

          {/* Spec chips */}
          <div className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft space-y-2">
            <div className="text-sm font-header">Details</div>
            <div className="flex flex-wrap gap-2">
              {chip('Sport', 'sport', card.sport ?? undefined)}
              {chip('League', 'league', card.league ?? undefined)}
              {chip('Team', 'team', card.team ?? undefined)}
              {chip('Set', 'set', card.set ?? undefined)}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED CARDS */}
      <section className="space-y-2">
        <h2 className="font-header text-lg">Related cards</h2>
        {relatedLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-3 bg-white rounded-2xl shadow-soft border border-black/5">
                <div className="aspect-[3/4] rounded-xl bg-black/10 mb-2 animate-pulse" />
                <div className="h-4 w-2/3 bg-black/10 rounded mb-1 animate-pulse" />
                <div className="h-3 w-1/3 bg-black/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : related.length === 0 ? (
          <div className="opacity-60 text-sm">No related cards yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((rc) => {
              const aspect =
                rc.image_orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'
              return (
                <Link
                  key={rc.id}
                  to={`/card/${rc.id}`}
                  className="group rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block"
                >
                  <div className={`${aspect} rounded-xl bg-black/5 mb-2 border border-black/10 overflow-hidden`}>
                    {rc.image_url ? (
                      <img
                        src={rc.image_url}
                        alt={rc.title ?? 'Card'}
                        className="object-cover w-full h-full"
                      />
                    ) : null}
                  </div>
                  <h3 className="text-[13px] leading-tight line-clamp-2 min-h-[2.2em]">
                    {rc.title ?? 'Untitled card'}
                  </h3>
                  {rc.price != null && (
                    <p className="text-sm opacity-70">£{rc.price}</p>
                  )}
                  <p className="mt-1 text-[11px] opacity-60 truncate">
                    {[rc.sport, rc.league].filter(Boolean).join(' • ')}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* LIGHTBOX */}
      {lightboxOpen && main && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm underline"
              onClick={() => setLightboxOpen(false)}
            >
              Close
            </button>
            <div className="relative w-full">
              <img
                src={images[activeIndex]!.src}
                alt={`${card.title ?? 'Card'} (zoom)`}
                className="w-full h-auto rounded-xl shadow-2xl"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white"
                    onClick={() =>
                      setActiveIndex((i) => (i - 1 + images.length) % images.length)
                    }
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white"
                    onClick={() =>
                      setActiveIndex((i) => (i + 1) % images.length)
                    }
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
