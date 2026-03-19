import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBasket } from '@/context/basket'

type Card = {
  id: string
  title: string
  price: number | null
  image_url: string | null
  nozid: string | null
}

const ROTATION_CATEGORIES = [
  { text: 'Arsenal', query: { team: 'Arsenal' } },
  { text: 'La Liga', query: { league: 'La Liga' } },
  { text: 'Obsidian', query: { set: 'Obsidian' } },
  { text: 'Topps', query: { set: 'Topps' } },
]

export default function Home() {
  return (
    <div className="space-y-8">
      {/* HERO SECTION - Rotating */}
      <HeroSection />

      {/* FEATURES SECTION */}
      <FeaturesSection />

      {/* TOP 16 MOST EXPENSIVE CARDS */}
      <TopExpensiveCards />

      {/* BANNER */}
      <BannerSection />

      {/* HOW IT WORKS */}
      <HowItWorksSection />

      {/* EBAY SECTION */}
      <EbaySection />

      {/* RECENTLY UPLOADED */}
      <RecentlyUploadedSection />
    </div>
  )
}

/* ===== HERO SECTION WITH ROTATING TEXT & CARDS ===== */
function HeroSection() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [categoryCards, setCategoryCards] = useState<{ [key: string]: Card[] }>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTransitioningCards, setIsTransitioningCards] = useState(false)

  const currentCategory = ROTATION_CATEGORIES[currentIndex]
  const targetText = currentCategory.text

  // Fetch top 3 cards for each category
  useEffect(() => {
    async function fetchCategoryCards() {
      const results: { [key: string]: Card[] } = {}

      for (const category of ROTATION_CATEGORIES) {
        let query = supabase
          .from('cards')
          .select('id, title, price, image_url, nozid')
          .eq('status', 'live')
          .not('price', 'is', null)
          .order('price', { ascending: false })
          .limit(6)

        // Apply the category filter
        if (category.query.team) {
          query = query.eq('team', category.query.team)
        } else if (category.query.league) {
          query = query.eq('league', category.query.league)
        } else if (category.query.set) {
          query = query.eq('set', category.query.set)
        }

        const { data } = await query
        results[category.text] = data || []
      }

      setCategoryCards(results)
    }

    fetchCategoryCards()
  }, [])

  // Typing/deleting effect
  useEffect(() => {
    if (isDeleting) {
      if (displayText.length === 0) {
        // Pause with blank screen before moving to next word
        const timeout = setTimeout(() => {
          setIsDeleting(false)
          setIsTransitioningCards(true)
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % ROTATION_CATEGORIES.length)
            setIsTransitioningCards(false)
          }, 100)
        }, 500) // 500ms blank pause
        return () => clearTimeout(timeout)
      }
      // Slow down at the end of deletion
      const deleteSpeed = displayText.length <= 2 ? 150 : 50
      const timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1))
      }, deleteSpeed)
      return () => clearTimeout(timeout)
    } else {
      if (displayText === targetText) {
        // Wait 4 seconds before starting to delete
        const timeout = setTimeout(() => setIsDeleting(true), 4000)
        return () => clearTimeout(timeout)
      }
      const timeout = setTimeout(() => {
        setDisplayText(targetText.slice(0, displayText.length + 1))
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [displayText, isDeleting, targetText, currentIndex])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/marketplace')
    }
  }

  const cards = categoryCards[currentCategory.text] || []

  return (
    <section className="bg-white text-black min-h-screen flex items-center px-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text & Search */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-2">
              Making{' '}
              <span className="inline-block min-w-[200px]">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-4xl md:text-5xl font-header text-brass mb-8">
              collecting easier
            </p>

            <p className="text-lg text-black/70 mb-8">
              Buy and Sell football card singles all through one trusted seller
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3 border border-black/20 focus:outline-none focus:border-black transition"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white font-medium hover:bg-black/80 transition"
              >
                Find it
              </button>
            </form>
          </div>

          {/* Right: Card Images - 2 rows of 3 */}
          <div 
            className={`grid grid-cols-3 grid-rows-2 gap-4 transition-opacity duration-300 ${
              isTransitioningCards ? 'opacity-0' : 'opacity-100'
            }`}
            key={`cards-${currentCategory.text}`}
          >
            {cards.slice(0, 6).map((card, idx) => (
              <Link
                key={card.id}
                to={`/card/${card.id}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-white border border-black/10 overflow-hidden hover:border-black transition shadow-sm">
                  {card.image_url && (
                    <img
                      src={card.image_url}
                      alt={card.title || ''}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-black/70 line-clamp-1">{card.title}</div>
                  <div className="text-black font-bold">£{card.price?.toFixed(2)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== TOP 16 MOST EXPENSIVE CARDS ===== */
function TopExpensiveCards() {
  const [cards, setCards] = useState<Card[]>([])
  const { addItem } = useBasket()

  useEffect(() => {
    async function fetchTopCards() {
      const { data } = await supabase
        .from('cards')
        .select('id, title, price, image_url, nozid')
        .eq('status', 'live')
        .not('price', 'is', null)
        .order('price', { ascending: false })
        .limit(16)

      setCards(data || [])
    }

    fetchTopCards()
  }, [])

  const handleAddToBasket = (e: React.MouseEvent, card: Card) => {
    e.preventDefault()
    if (card.price) {
      addItem({
        id: card.id,
        title: card.title || '',
        price: card.price,
        image_url: card.image_url || '',
        nozid: card.nozid || '',
      })
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4">
      <h2 className="font-header text-3xl mb-6">Most Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {cards.map((card) => (
          <Link
            key={card.id}
            to={`/card/${card.id}`}
            className="group relative"
          >
            <div className="aspect-[3/4] bg-gray-100 border border-black/10 overflow-hidden hover:border-black transition relative">
              {card.image_url && (
                <img
                  src={card.image_url}
                  alt={card.title || ''}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Hover overlay with icons */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => handleAddToBasket(e, card)}
                  className="p-2 bg-white text-black hover:bg-black hover:text-white transition"
                  title="Add to basket"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="p-2 bg-white text-black hover:bg-black hover:text-white transition"
                  title="Add to wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs">
              <div className="line-clamp-1 text-black/70">{card.title}</div>
              <div className="font-bold">£{card.price?.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ===== FEATURES SECTION ===== */
function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Trusted Seller',
      desc: 'All cards sold through one verified seller with guaranteed authenticity',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'All In One Place',
      desc: 'Browse, buy, and manage your entire collection in a single marketplace',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Store Cards',
      desc: 'Buy multiple cards and store them to ship all together - save on shipping costs',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Easy To Browse',
      desc: 'Advanced filters and search make finding exactly what you want effortless',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Instant Checkout',
      desc: 'Secure payment processing with instant confirmation and fast shipping',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Seller Payouts',
      desc: 'Consign your cards and receive automatic payouts when they sell',
    },
  ]

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4 tracking-wide">BUY SMART. SELL SMART.</h3>
          <h2 className="font-header text-4xl mb-4">
            Everything you need to build up your collection or get extra cash to splash on that Holy Grail
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="text-center p-8 bg-white rounded-lg hover:shadow-md transition"
            >
              <div className="flex justify-center mb-4 text-brass">{feature.icon}</div>
              <h3 className="font-header text-xl mb-3">{feature.title}</h3>
              <p className="text-sm text-black/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== BANNER SECTION ===== */
function BannerSection() {
  return (
    <section className="w-full bg-black text-white py-8 px-4">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-normal">
          New cards uploaded every week
        </h2>
      </div>
    </section>
  )
}

/* ===== HOW IT WORKS SECTION ===== */
function HowItWorksSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 space-y-8">
      <div className="text-center">
        <h2 className="font-header text-3xl mb-2">How It Works</h2>
        <p className="text-black/60">Learn how to sell your cards with us</p>
      </div>
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
            className="rounded-2xl bg-white p-8 shadow-soft border border-black/10 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-black text-white font-bold text-xl grid place-items-center">
              {x.step}
            </div>
            <h3 className="font-header text-xl mb-2">{x.title}</h3>
            <p className="text-sm text-black/70">{x.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link
          to="/how-it-works"
          className="inline-block px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition font-medium"
        >
          Learn More
        </Link>
      </div>
    </section>
  )
}

/* ===== EBAY SECTION ===== */
function EbaySection() {
  const EBAY_USERNAME = 'noz_cards'
  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="rounded-2xl bg-white shadow-soft border border-black/5 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-header text-2xl">Shop Noz Cards on <span className="text-brass">eBay</span></h2>
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
            className="inline-block px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition text-sm font-medium"
          >
            Visit eBay Store
          </a>
        </div>

        <EbayFeedbackCarousel />
      </div>
    </section>
  )
}

function EbayFeedbackCarousel() {
  type Feedback = { id: number; text: string; username: string }

  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
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
    const interval = window.setInterval(() => {
      setPage((prev) => (prev + 1) % pageCount)
    }, 4000)
    return () => window.clearInterval(interval)
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
              i === page ? 'bg-black' : 'bg-black/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ===== RECENTLY UPLOADED SECTION ===== */
function RecentlyUploadedSection() {
  const [cards, setCards] = useState<Card[]>([])
  const { addItem } = useBasket()

  useEffect(() => {
    async function fetchRecentCards() {
      const { data } = await supabase
        .from('cards')
        .select('id, title, price, image_url, nozid')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(12)

      setCards(data || [])
    }

    fetchRecentCards()
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-header text-3xl">Recently Uploaded</h2>
        <Link
          to="/marketplace"
          className="text-sm border-b-2 border-black hover:opacity-70 transition"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="group">
            <Link to={`/card/${card.id}`}>
              <div className="aspect-[3/4] bg-gray-100 border border-black/10 overflow-hidden hover:border-black transition">
                {card.image_url && (
                  <img
                    src={card.image_url}
                    alt={card.title || ''}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Link>
            <div className="mt-2 text-sm">
              <Link to={`/card/${card.id}`} className="line-clamp-2 text-black/70 hover:text-black min-h-[2.5rem]">
                {card.title}
              </Link>
              <div className="font-bold mt-1">£{card.price?.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
