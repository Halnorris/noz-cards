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
    <div className="space-y-16">
      {/* HERO SECTION - Rotating */}
      <HeroSection />

      {/* TOP 16 MOST EXPENSIVE CARDS */}
      <TopExpensiveCards />

      {/* FEATURES SECTION */}
      <FeaturesSection />

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
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentCategory = ROTATION_CATEGORIES[currentIndex]

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
          .limit(3)

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

  // Rotate categories every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ROTATION_CATEGORIES.length)
        setIsTransitioning(false)
      }, 300) // Fade transition duration
    }, 4000)

    return () => clearInterval(interval)
  }, [])

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
    <section className="bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text & Search */}
          <div>
            <h1 className="font-header text-5xl md:text-6xl leading-tight mb-4">
              Making{' '}
              <span 
                className={`inline-block transition-opacity duration-300 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
                key={currentCategory.text}
              >
                {currentCategory.text}
              </span>
              <br />
              <span className="text-white/80">collecting better</span>
            </h1>

            <p className="text-lg text-white/70 mb-8">
              Buy and Sell football card singles all through one trusted seller
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3 bg-white text-black border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-medium hover:bg-white/90 transition"
              >
                Find it
              </button>
            </form>
          </div>

          {/* Right: Card Images */}
          <div 
            className={`grid grid-cols-3 gap-4 transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            key={`cards-${currentCategory.text}`}
          >
            {cards.map((card, idx) => (
              <Link
                key={card.id}
                to={`/card/${card.id}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-white/10 border-2 border-white/20 overflow-hidden hover:border-white transition">
                  {card.image_url && (
                    <img
                      src={card.image_url}
                      alt={card.title || ''}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-white/90 line-clamp-1">{card.title}</div>
                  <div className="text-white font-bold">£{card.price?.toFixed(2)}</div>
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

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {cards.map((card) => (
          <Link
            key={card.id}
            to={`/card/${card.id}`}
            className="group"
          >
            <div className="aspect-[3/4] bg-gray-100 border border-black/10 overflow-hidden hover:border-black transition">
              {card.image_url && (
                <img
                  src={card.image_url}
                  alt={card.title || ''}
                  className="w-full h-full object-cover"
                />
              )}
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
      icon: '🛡️',
      title: 'Trusted Seller',
      desc: 'All cards sold through one verified seller with guaranteed authenticity',
    },
    {
      icon: '📦',
      title: 'All In One Place',
      desc: 'Browse, buy, and manage your entire collection in a single marketplace',
    },
    {
      icon: '💰',
      title: 'Store Cards',
      desc: 'Buy multiple cards and store them to ship all together - save on shipping costs',
    },
    {
      icon: '🔍',
      title: 'Easy To Browse',
      desc: 'Advanced filters and search make finding exactly what you want effortless',
    },
    {
      icon: '⚡',
      title: 'Instant Checkout',
      desc: 'Secure payment processing with instant confirmation and fast shipping',
    },
    {
      icon: '🎯',
      title: 'Seller Payouts',
      desc: 'Consign your cards and receive automatic payouts when they sell',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-header text-4xl mb-4">
          Everything you need to stay ahead of the market
        </h2>
        <p className="text-lg text-black/70 max-w-3xl mx-auto">
          The latest listings, trusted seller, and innovative tools to maximize the value of your
          collection and future investments
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="text-center p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="font-header text-xl mb-3">{feature.title}</h3>
            <p className="text-sm text-black/70">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ===== BANNER SECTION ===== */
function BannerSection() {
  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="bg-black text-white py-12 px-8 text-center rounded-2xl">
        <h2 className="font-header text-3xl md:text-4xl">
          New cards uploaded every week!
        </h2>
      </div>
    </section>
  )
}

/* ===== HOW IT WORKS SECTION ===== */
function HowItWorksSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 space-y-8">
      <h2 className="font-header text-3xl text-center">How It Works</h2>
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
  const [currentPage, setCurrentPage] = useState(0)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    async function fetchEbayCards() {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(18)

      setCards(data || [])
      setLoading(false)
    }

    fetchEbayCards()
  }, [])

  const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE)
  const currentCards = cards.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  if (loading || cards.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-header text-3xl">Also Available on eBay</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-2 border border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-2 border border-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {currentCards.map((card) => (
          <Link
            key={card.id}
            to={`/card/${card.id}`}
            className="group"
          >
            <div className="aspect-[3/4] bg-gray-100 border border-black/10 overflow-hidden hover:border-black transition">
              {card.image_url && (
                <img
                  src={card.image_url}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="mt-2 text-sm">
              <div className="line-clamp-2 text-black/70 min-h-[2.5rem]">{card.title}</div>
              <div className="font-bold mt-1">£{card.price?.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
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
