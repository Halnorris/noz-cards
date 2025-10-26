import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

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
              Submit a consignment in minutes and we’ll handle the rest — from professional scans
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
                to="/account/pending"
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

      {/* ABOUT US */}
      <section className="rounded-2xl bg-white shadow-soft border border-black/5 p-6 md:p-10">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Image */}
          <div className="md:col-span-1">
            {/* <img src="/about-hal.jpg" alt="About Noz Cards" className="rounded-2xl border border-black/10 w-full h-auto object-cover" /> */}
            <div className="aspect-[4/5] rounded-2xl border border-black/10 bg-black/10" />
          </div>

          {/* Text */}
          <div className="md:col-span-2">
            <h2 className="font-header text-2xl mb-2">About Noz Cards</h2>
            <p className="opacity-80">
              Hey! I’m Hal. I fell in love with football cards years ago and started Noz Cards to
              make buying and selling safer, simpler, and way more fun. My goal is to build a
              trusted community marketplace that puts collectors first — clean listings, transparent
              fees, and fast payouts. Whether you’re picking up your first card or hunting grails,
              you’re in the right place.
            </p>
            <div className="mt-4">
              <Link
                to="/marketplace"
                className="inline-block px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm"
              >
                Visit Marketplace
              </Link>
            </div>
          </div>
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

/* 🔽 Hero Featured Cards (Top 8 highest priced) 🔽 */
function HeroFeaturedCards() {
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    async function loadCards() {
      const { data } = await supabase
        .from('cards')
        .select('id,title,price,image_url,created_at')
        .eq('status', 'live')
        .order('price', { ascending: false })
        .limit(8)
      setCards(data ?? [])
    }
    loadCards()
  }, [])

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
      {cards.map((card) => (
        <Link
          key={card.id}
          to={`/card/${card.id}`}
          className="p-2 bg-white rounded-lg shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block"
        >
          <div className="aspect-[3/4] bg-black/5 rounded mb-1 overflow-hidden">
            {card.image_url && (
              <img
                src={card.image_url}
                alt={card.title}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <h3 className="text-xs font-medium truncate">{card.title}</h3>
          <p className="text-xs opacity-70">£{card.price}</p>
        </Link>
      ))}
    </div>
  )
}

/* 🔽 eBay Section (with carousel) 🔽 */
function EbaySection() {
  const EBAY_USERNAME = 'noz_cards'
  return (
    <section className="rounded-2xl bg-white shadow-soft border border-black/5 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="font-header text-2xl">Shop Noz Cards on eBay</h2>
          <p className="opacity-80 text-sm mt-1 max-w-xl">
            If you’re more of an eBay browser, you can check out our listings and feedback history
            there too. Every card’s handled with the same care and consistency as what you’ll find
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

/* 🔽 eBay Feedback Carousel (auto-rotating, Supabase-backed) 🔽 */
function EbayFeedbackCarousel() {
  type Feedback = { id: number; text: string; user: string }

  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    async function fetchFeedback() {
      const { data, error } = await supabase
        .from('ebay_feedback')
        .select('id, text, user')
        .order('id', { ascending: false })
        .limit(12)
      if (!error && data) setItems(data as Feedback[])
      setLoading(false)
    }
    fetchFeedback()
  }, [])

  // Auto-rotate every 4s (pause on hover)
  useEffect(() => {
    if (!items.length) return
    if (isHovered) return

    intervalRef.current = window.setInterval(() => {
      setActive((prev) => (prev + 1) % items.length)
    }, 4000)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [items.length, isHovered])

  const goTo = (index: number) => {
    if (!items.length) return
    setActive((index + items.length) % items.length)
  }

  const next = () => goTo(active + 1)
  const prev = () => goTo(active - 1)

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft animate-pulse h-[110px]" />
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

  return (
    <div
      className="mt-6 relative rounded-2xl border border-black/5 p-4 bg-white shadow-soft"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative h-[120px] sm:h-[140px]">
        {items.map((f, i) => (
          <div
            key={f.id}
            className={`absolute inset-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== active}
          >
            <div className="h-full w-full rounded-xl border border-black/5 bg-white p-4 flex flex-col justify-center">
              <div className="text-sm leading-6">“{f.text}”</div>
              <div className="mt-2 text-xs opacity-60">— {f.user}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
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

      {/* Dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full border border-black/10 ${i === active ? 'bg-primary' : 'bg-black/10'}`}
          />
        ))}
      </div>
    </div>
  )
}

/* 🔽 Recently Uploaded Grid 🔽 */
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

  useEffect(() => {
    async function fetchRecent() {
      setLoading(true)
      const { data } = await supabase
        .from('cards')
        .select('id,title,price,image_url,created_at,status')
        .order('created_at', { ascending: false })
        .limit(12)
      setCards(data ?? [])
      setLoading(false)
    }
    fetchRecent()
  }, [])

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
        No cards yet — upload some and they’ll appear here.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Link
          key={card.id}
          to={`/card/${card.id}`}
          className="group rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block"
        >
          <div className="aspect-[3/4] rounded-xl bg-black/5 mb-2 border border-black/10 overflow-hidden">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.title}
                className="object-cover w-full h-full"
              />
            ) : null}
          </div>
          <h3 className="text-sm font-medium truncate">
            {card.title ?? 'Untitled card'}
          </h3>
          {card.price != null && (
            <p className="text-sm opacity-70">£{card.price}</p>
          )}
        </Link>
      ))}
    </div>
  )
}
