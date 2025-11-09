import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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

  // Offer modal
  const [offerOpen, setOfferOpen] = useState(false)

  // Gallery
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Related
  const [related, setRelated] = useState<SimpleCard[]>([])
  const [relatedLoading, setRelatedLoading] = useState(true)
  const relatedRef = useRef<HTMLDivElement | null>(null)

  const navigate = useNavigate()

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
        .limit(24)

      if (card.team) query = query.eq('team', card.team)
      else if (card.league) query = query.eq('league', card.league)

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

  async function handleCopyTitle() {
    if (!card?.title) return
    try {
      await navigator.clipboard.writeText(card.title)
    } catch {}
  }

  async function handleShare() {
    try {
      const shareData = {
        title: card?.title ?? 'Noz Cards',
        text: card?.title ?? 'Noz Cards',
        url: window.location.href,
      }
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch {}
  }

  // Back to where I was
  function handleBack() {
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
    <div className="space-y-6 pb-20 md:pb-0">
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
            {/* Thumbs */}
            <div className="hidden sm:flex flex-col gap-2 w-14">
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

            {/* Main image */}
            <div className="relative flex-1">
              <div
                className={`${orientation} mx-auto max-h-[56vh] rounded-xl bg-black/5 overflow-hidden cursor-zoom-in`}
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

          {/* Flip / Zoom buttons */}
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
          {/* Title + quick actions */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-header text-2xl pr-2">{card.title ?? 'Untitled card'}</h1>
            <div className="shrink-0 flex items-center gap-1">
              <button
                onClick={handleCopyTitle}
                title="Copy title"
                className="px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-xs"
              >
                Copy
              </button>
              <button
                onClick={handleShare}
                title="Share"
                className="px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-xs"
              >
                Share
              </button>
            </div>
          </div>

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

              {/* Make an Offer (UI-only) */}
              <button
                onClick={() => setOfferOpen(true)}
                className="px-5 py-3 rounded-xl border border-black/10 hover:bg-black/5"
              >
                Make an Offer
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
                className={`p-3 rounded-xl border ${wishlisted ? 'border-red-300 bg-red-50' : 'border-black/10 hover:bg-black/5'}`}
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

            {/* Trust strip */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] opacity-80">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                UK-based
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                Tracked shipping
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                Stripe checkout
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                Secure payouts
              </div>
            </div>
          </div>

          {/* Spec chips (quick filter links) */}
          <div className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft space-y-2">
            <div className="text-sm font-header">Details</div>
            <div className="flex flex-wrap gap-2">
              {chip('Sport', 'sport', card.sport ?? undefined)}
              {chip('League', 'league', card.league ?? undefined)}
              {chip('Team', 'team', card.team ?? undefined)}
              {chip('Set', 'set', card.set ?? undefined)}
            </div>
          </div>

          {/* Shipping & Returns accordion */}
          <div className="rounded-2xl bg-white p-2 border border-black/5 shadow-soft">
            <details className="group p-2 rounded-xl">
              <summary className="cursor-pointer list-none font-header text-sm flex items-center justify-between">
                Shipping
                <span className="opacity-60 group-open:rotate-180 transition">⌃</span>
              </summary>
              <div className="mt-2 text-sm opacity-80">
                Orders are shipped from the UK with tracking. Packaging is card-safe and secure.
                Dispatch typically within 2–3 business days.
              </div>
            </details>
            <hr className="border-black/5 my-2" />
            <details className="group p-2 rounded-xl">
              <summary className="cursor-pointer list-none font-header text-sm flex items-center justify-between">
                Returns & Refunds
                <span className="opacity-60 group-open:rotate-180 transition">⌃</span>
              </summary>
              <div className="mt-2 text-sm opacity-80">
                For details, see our{' '}
                <Link to="/returns" className="underline">Returns & Refunds Policy</Link>.
              </div>
            </details>
            <hr className="border-black/5 my-2" />
            <details className="group p-2 rounded-xl">
              <summary className="cursor-pointer list-none font-header text-sm flex items-center justify-between">
                Consignment
                <span className="opacity-60 group-open:rotate-180 transition">⌃</span>
              </summary>
              <div className="mt-2 text-sm opacity-80">
                These listings may be on consignment. Learn more in our{' '}
                <Link to="/consignment-policy" className="underline">Consignment Policy</Link>.
              </div>
            </details>
            <hr className="border-black/5 my-2" />
            <details className="group p-2 rounded-xl">
              <summary className="cursor-pointer list-none font-header text-sm flex items-center justify-between">
                Authenticity
                <span className="opacity-60 group-open:rotate-180 transition">⌃</span>
              </summary>
              <div className="mt-2 text-sm opacity-80">
                Cards are visually inspected and scanned. If something looks off, contact us and we’ll make it right.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* RELATED CARDS — carousel */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-header text-lg">Related cards</h2>
          {!relatedLoading && related.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const el = relatedRef.current
                  if (!el) return
                  el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
                }}
                className="px-3 py-1 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={() => {
                  const el = relatedRef.current
                  if (!el) return
                  el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
                }}
                className="px-3 py-1 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
                aria-label="Next"
              >
                ›
              </button>
            </div>
          )}
        </div>

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
          <div
            ref={relatedRef}
            className="overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            <div className="flex gap-4">
              {related.map((rc) => {
                const aspect =
                  rc.image_orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'
                return (
                  <Link
                    key={rc.id}
                    to={`/card/${rc.id}`}
                    className="snap-start shrink-0 basis-1/2 sm:basis-1/3 lg:basis-1/6 rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block"
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
          </div>
        )}
      </section>

      {/* LIGHTBOX with PAN + ZOOM */}
      {lightboxOpen && main && (
        <Lightbox
          src={images[activeIndex]!.src}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
          onNext={() => setActiveIndex((i) => (i + 1) % images.length)}
          multiple={images.length > 1}
          title={card.title ?? 'Card'}
        />
      )}

      {/* MAKE AN OFFER MODAL (UI-only) */}
      {offerOpen && (
        <MakeOfferModal
          cardTitle={card.title ?? 'Card'}
          askingPrice={card.price ?? null}
          onClose={() => setOfferOpen(false)}
          onSubmit={(offer) => {
            console.log('Offer submitted:', {
              cardId: card.id,
              offerPrice: offer.price,
              note: offer.note,
            })
            setOfferOpen(false)
          }}
        />
      )}

      {/* Sticky mobile purchase bar */}
      <div className="fixed md:hidden bottom-3 left-0 right-0 px-3">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white/95 backdrop-blur border border-black/10 shadow-soft p-3 flex items-center justify-between gap-3">
          <div className="text-base font-header">
            {card.price != null ? `£${card.price}` : '—'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToBasket}
              className="px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
            >
              Add to Basket
            </button>
            <button
              onClick={handleBuyNow}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Pan & Zoom Lightbox ---------- */
function Lightbox({
  src,
  title,
  multiple,
  onClose,
  onPrev,
  onNext,
}: {
  src: string
  title?: string
  multiple?: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [dragging, setDragging] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    // Reset when image changes
    setScale(1)
    setTx(0)
    setTy(0)
  }, [src])

  function clampTranslate(nextTx: number, nextTy: number) {
    const el = containerRef.current
    if (!el) return { x: nextTx, y: nextTy }
    const rect = el.getBoundingClientRect()
    const maxX = (rect.width * (scale - 1)) / 2
    const maxY = (rect.height * (scale - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, nextTx)),
      y: Math.max(-maxY, Math.min(maxY, nextTy)),
    }
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const el = containerRef.current
    if (!el) return

    const delta = -e.deltaY
    const zoomFactor = 1 + delta * 0.0015
    const newScale = Math.min(6, Math.max(1, scale * zoomFactor))

    const rect = el.getBoundingClientRect()
    const cx = e.clientX - rect.left - rect.width / 2
    const cy = e.clientY - rect.top - rect.height / 2

    const k = (newScale - scale) / newScale
    let nextTx = tx - cx * k
    let nextTy = ty - cy * k
    const clamped = clampTranslate(nextTx, nextTy)

    setScale(newScale)
    setTx(clamped.x)
    setTy(clamped.y)
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    setDragging(true)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging || !lastPos.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    const clamped = clampTranslate(tx + dx, ty + dy)
    setTx(clamped.x)
    setTy(clamped.y)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  function onMouseUp() {
    setDragging(false)
    lastPos.current = null
  }

  function onDoubleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (scale === 1) {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const newScale = 2
      const k = (newScale - scale) / newScale
      let nextTx = tx - cx * k
      let nextTy = ty - cy * k
      const clamped = clampTranslate(nextTx, nextTy)
      setScale(newScale)
      setTx(clamped.x)
      setTy(clamped.y)
    } else {
      setScale(1)
      setTx(0)
      setTy(0)
    }
  }

  function zoomStep(dir: 1 | -1) {
    const el = containerRef.current
    if (!el) return
    const newScale = Math.min(6, Math.max(1, scale * (dir === 1 ? 1.25 : 0.8)))
    const k = (newScale - scale) / newScale
    let nextTx = tx - 0 * k
    let nextTy = ty - 0 * k
    const clamped = clampTranslate(nextTx, nextTy)
    setScale(newScale)
    setTx(clamped.x)
    setTy(clamped.y)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-10 right-0 flex items-center gap-2">
          <button
            className="text-white/80 hover:text-white text-sm underline"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Controls */}
        <div className="absolute -top-10 left-0 flex items-center gap-2">
          <button
            className="text-white/80 hover:text-white text-sm underline"
            onClick={() => zoomStep(-1)}
          >
            −
          </button>
          <span className="text-white/70 text-sm">Zoom</span>
          <button
            className="text-white/80 hover:text-white text-sm underline"
            onClick={() => zoomStep(1)}
          >
            +
          </button>
          <button
            className="text-white/80 hover:text-white text-sm underline ml-3"
            onClick={() => { setScale(1); setTx(0); setTy(0); }}
          >
            Reset
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative w-full rounded-xl bg-black/20 overflow-hidden shadow-2xl"
          style={{ aspectRatio: '3 / 4' }}
          onWheel={handleWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onDoubleClick={onDoubleClick}
        >
          <img
            src={src}
            alt={`${title ?? 'Card'} (zoom)`}
            className="w-full h-full object-contain select-none"
            draggable={false}
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 0.05s linear',
              willChange: 'transform',
            }}
          />

          {multiple && (
            <>
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white"
                onClick={onPrev}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-white/90 hover:text-white"
                onClick={onNext}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Make Offer Modal (UI-only) ---------- */
function MakeOfferModal({
  cardTitle,
  askingPrice,
  onClose,
  onSubmit,
}: {
  cardTitle: string
  askingPrice: number | null
  onClose: () => void
  onSubmit: (payload: { price: number; note?: string }) => void
}) {
  const [price, setPrice] = useState<string>(askingPrice ? String(Math.max(1, Math.floor(askingPrice * 0.9))) : '')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function validate(): number | null {
    const n = Number(price)
    if (!price || Number.isNaN(n)) {
      setError('Enter a valid offer amount.')
      return null
    }
    if (n < 1) {
      setError('Minimum offer is £1.')
      return null
    }
    if (n > 1000000) {
      setError('That amount seems too high.')
      return null
    }
    setError(null)
    return n
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = validate()
    if (valid == null) return
    setSubmitting(true)

    // Stub only — replace with Supabase insert later
    await new Promise((r) => setTimeout(r, 500))
    setSubmitting(false)
    setSent(true)

    setTimeout(() => {
      onSubmit({ price: valid, note: note.trim() || undefined })
    }, 600)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-header text-lg">Make an Offer</h3>
            <p className="text-sm opacity-70">{cardTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm">
            Your offer (£)
            <input
              inputMode="decimal"
              type="number"
              min={1}
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={askingPrice != null ? `e.g. ${Math.max(1, Math.floor(askingPrice * 0.9))}` : 'Enter amount'}
              className="mt-1 w-full rounded-xl border border-black/10 p-2"
              required
            />
          </label>

          <label className="block text-sm">
            Message to seller (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 p-2 min-h-[90px]"
              placeholder="Add context, shipping notes, etc."
            />
          </label>

          {askingPrice != null && (
            <div className="text-xs opacity-70">
              Current asking price: <span className="font-medium">£{askingPrice}</span>
            </div>
          )}

          {error && <div className="text-xs text-red-600">{error}</div>}

          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-60 text-sm"
            >
              {submitting ? 'Sending…' : sent ? 'Sent!' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
