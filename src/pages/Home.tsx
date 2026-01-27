import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBasket } from '@/context/basket'
import { useAuth } from '@/context/auth'

export default function Home() {
  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="rounded-2xl bg-white shadow-soft border border-black/5 p-6 md:p-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left side: headline & CTAs */}
          <div>
            <h1 className="font-header leading-tight text-4xl md:text-5xl">
              Buy, Sell & Consign <span className="text-primary">Football Cards</span>
              <span className="block text-[clamp(22px,3vw,32px)] mt-1">
                Fast, secure & hassle-free marketplace
              </span>
            </h1>

            <p className="mt-4 opacity-80 max-w-xl">
              Submit a consignment in minutes and we'll handle the rest — from professional scans
              to instant checkout and smooth payouts.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90"
              >
                Browse Marketplace
              </Link>
              <Link
                to="/submit-cards"
                className="px-5 py-3 rounded-xl bg-secondary hover:opacity-90"
              >
                Submit Cards
              </Link>
            </div>
          </div>

          {/* Right side: Top priced cards */}
          <div>
            <HeroFeaturedCards />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-8">
        <h2 className="font-header text-2xl text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Submit',
              desc: 'Fill out our online form and send your cards to us. No upfront costs.',
            },
            {
              step: '2',
              title: 'Go Live',
              desc: 'We scan, list, and promote your cards. Choose your price and start selling.',
            },
            {
              step: '3',
              title: 'Get Paid',
              desc: 'Buyers pay instantly. We deduct fees and you receive funds via Stripe.',
            },
          ].map((x) => (
            <div
              key={x.step}
              className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 text-primary font-bold grid place-items-center">
                {x.step}
              </div>
              <h3 className="font-header text-lg mb-1">{x.title}</h3>
              <p className="text-sm opacity-80">{x.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            to="/how-it-works"
            className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* EBAY SECTION (with carousel) */}
      <EbaySection />

      {/* RECENTLY UPLOADED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-header text-2xl">Recently Uploaded</h2>
          <Link
            to="/marketplace"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            See all
          </Link>
        </div>
        <RecentlyUploadedGrid />
      </section>
    </div>
  )
}

/* 🔽 Hero Featured Cards (Top 8 highest priced) WITH HOVER ICONS 🔽 */
function HeroFeaturedCards() {
  const [cards, setCards] = useState<any[]>([])
  const [wishlistCardIds, setWishlistCardIds] = useState<Set<string>>(new Set())
  const { addItem } = useBasket()
  const { user } = useAuth()

  useEffect(() => {
    async function loadCards() {
      const { data } = await supabase
        .from('cards')
        .select('id,title,price,image_url,created_at,image_orientation')
        .eq('status', 'live')
        .neq('image_orientation', 'landscape')
        .order('price', { ascending: false })
        .limit(8)
      setCards(data ?? [])
    }
    loadCards()
  }, [])

  useEffect(() => {
    if (!user) {
      setWishlistCardIds(new Set())
      return
    }
    
    async function loadWishlist() {
      const { data } = await supabase
        .from('wishlists')
        .select('card_id')
        .eq('user_id', user.id)
      
      if (data) {
        setWishlistCardIds(new Set(data.map(w => w.card_id)))
      }
    }
    loadWishlist()
  }, [user])

  const toggleWishlist = async (card: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      alert('Please sign in to add cards to your wishlist')
      return
    }

    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('card_id', card.id)
      .single()

    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id)
      setWishlistCardIds(prev => {
        const next = new Set(prev)
        next.delete(card.id)
        return next
      })
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, card_id: card.id })
      setWishlistCardIds(prev => new Set(prev).add(card.id))
    }
  }

  const addToBasket = (card: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: card.id,
      title: card.title,
      price: card.price,
      image_url: card.image_url,
    })
  }

  if (!cards.length) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-black/10 aspect-[3/4] animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {cards.map((card) => {
        const isInWishlist = wishlistCardIds.has(card.id)
        
        return (
          <Link
            key={card.id}
            to={`/card/${card.id}`}
            className="p-2 bg-white rounded-lg shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block group relative"
          >
            <div className="aspect-[3/4] bg-black/5 rounded mb-1 overflow-hidden relative">
              {card.image_url && (
                <img
                  src={card.image_url}
                  alt={card.title}
                  className="object-cover w-full h-full"
                />
              )}
              
              {/* Hover Icons */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => addToBasket(card, e)}
                  className="w-8 h-8 rounded-full bg-white text-primary hover:bg-primary hover:text-white transition flex items-center justify-center"
                  title="Add to basket"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => toggleWishlist(card, e)}
                  className={`w-8 h-8 rounded-full transition flex items-center justify-center ${
                    isInWishlist 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <h3 className="text-xs font-medium truncate">{card.title}</h3>
            <p className="text-xs opacity-70">£{card.price}</p>
          </Link>
        )
      })}
    </div>
  )
}

/* eBay Section - unchanged */
function EbaySection() {
  const EBAY_USERNAME = 'noz_cards'
  return (
    <section className="rounded-2xl bg-white shadow-soft border border-black/5 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="font-header text-2xl">Shop Noz Cards on eBay</h2>
          <p className="opacity-80 text-sm mt-1 max-w-xl">
            If you're more of an eBay browser, you can check out our listings and feedback history
            there too. Every card's handled with the same care and consistency as what you'll find
            right here on Noz Cards.
          </p>
        </div>
        <a
          href={`https://www.ebay.co.uk/usr/${EBAY_USERNAME}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm"
        >
          Visit eBay Store
        </a>
      </div>

      <EbayFeedbackCarousel />
    </section>
  )
}

function EbayFeedbackCarousel() {
  type Feedback = { id: number; text: string; username: string }

  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    async function fetchFeedback() {
      const { data, error } = await supabase
        .from('ebay_feedback')
        .select('id, text, username')
        .order('id', { ascending: false })
        .limit(24)
      if (!error && data) setItems(data as Feedback[])
      setLoading(false)
    }
    fetchFeedback()
  }, [])

  const pageCount = Math.max(1, Math.ceil(items.length / 3))

  useEffect(() => {
    if (!items.length || isHovered) return
    intervalRef.current = window.setInterval(() => {
      setPage((prev) => (prev + 1) % pageCount)
    }, 4000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [items.length, isHovered, pageCount])

  const goToPage = (p: number) => {
    if (!items.length) return
    const normalized = ((p % pageCount) + pageCount) % pageCount
    setPage(normalized)
  }
  const next = () => goToPage(page + 1)
  const prev = () => goToPage(page - 1)

  const at = (i: number) => items[i % items.length]

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft animate-pulse h-[110px]"
          />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="mt-6 opacity-60 text-sm">
        No feedback yet — add entries in Supabase to show them here.
      </div>
    )
  }

  const startIndex = page * 3
  const visible = items.length >= 3
    ? [at(startIndex), at(startIndex + 1), at(startIndex + 2)]
    : items

  return (
    <div
      className="mt-6 relative rounded-2xl border border-black/5 p-4 bg-white shadow-soft"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((f) => (
          <div
            key={`${f.id}-${f.username}`}
            className="h-full w-full rounded-xl border border-black/5 bg-white p-4 flex flex-col justify-center"
          >
            <div className="text-sm leading-6">"{f.text}"</div>
            <div className="mt-2 text-xs opacity-60">— {f.username}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous feedback"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/80 p-2 hover:bg-black/5"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next feedback"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/80 p-2 hover:bg-black/5"
      >
        ›
      </button>

      <div className="mt-3 flex items-center justify-center gap-2">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            aria-label={`Go to page ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full border border-black/10 ${
              i === page ? 'bg-primary' : 'bg-black/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* 🔽 Recently Uploaded Grid WITH HOVER ICONS 🔽 */
function RecentlyUploadedGrid() {
  type Card = {
    id: string
    title: string
    price: number | null
    image_url: string | null
    created_at: string
    status?: string
  }

  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlistCardIds, setWishlistCardIds] = useState<Set<string>>(new Set())
  const { addItem } = useBasket()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchRecent() {
      setLoading(true)
      const { data } = await supabase
        .from('cards')
        .select('id,title,price,image_url,created_at,status,image_orientation')
        .neq('image_orientation', 'landscape')
        .order('created_at', { ascending: false })
        .limit(12)
      setCards(data ?? [])
      setLoading(false)
    }
    fetchRecent()
  }, [])

  useEffect(() => {
    if (!user) {
      setWishlistCardIds(new Set())
      return
    }
    
    async function loadWishlist() {
      const { data } = await supabase
        .from('wishlists')
        .select('card_id')
        .eq('user_id', user.id)
      
      if (data) {
        setWishlistCardIds(new Set(data.map(w => w.card_id)))
      }
    }
    loadWishlist()
  }, [user])

  const toggleWishlist = async (card: Card, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      alert('Please sign in to add cards to your wishlist')
      return
    }

    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('card_id', card.id)
      .single()

    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id)
      setWishlistCardIds(prev => {
        const next = new Set(prev)
        next.delete(card.id)
        return next
      })
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, card_id: card.id })
      setWishlistCardIds(prev => new Set(prev).add(card.id))
    }
  }

  const addToBasket = (card: Card, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: card.id,
      title: card.title,
      price: card.price!,
      image_url: card.image_url,
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="p-3 bg-white rounded-2xl shadow-soft border border-black/5"
          >
            <div className="aspect-[3/4] rounded-xl bg-black/10 mb-2 animate-pulse" />
            <div className="h-4 w-2/3 bg-black/10 rounded mb-1 animate-pulse" />
            <div className="h-3 w-1/3 bg-black/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (!cards.length) {
    return (
      <div className="opacity-70 text-sm">
        No cards yet — upload some and they'll appear here.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const isInWishlist = wishlistCardIds.has(card.id)
        
        return (
          <Link
            key={card.id}
            to={`/card/${card.id}`}
            className="group rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block relative"
          >
            <div className="aspect-[3/4] rounded-xl bg-black/5 mb-2 border border-black/10 overflow-hidden relative">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.title}
                  className="object-cover w-full h-full"
                />
              ) : null}
              
              {/* Hover Icons - only show for live cards */}
              {card.status === 'live' && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => addToBasket(card, e)}
                    className="w-8 h-8 rounded-full bg-white text-primary hover:bg-primary hover:text-white transition flex items-center justify-center"
                    title="Add to basket"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => toggleWishlist(card, e)}
                    className={`w-8 h-8 rounded-full transition flex items-center justify-center ${
                      isInWishlist 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium truncate">
              {card.title ?? 'Untitled card'}
            </h3>
            {card.price != null && (
              <p className="text-sm opacity-70">£{card.price}</p>
            )}
          </Link>
        )
      })}
    </div>
  )
}
