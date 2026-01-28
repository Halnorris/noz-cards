import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBasket } from '@/context/basket'
import { useAuth } from '@/context/auth'

type Card = {
  id: string
  title: string
  price: number | null
  image_url: string | null
  image_orientation: 'portrait' | 'landscape' | null
  sport: string | null
  league: string | null
  team: string | null
  set: string | null
  nozid: string | null
  created_at: string
}

type Filters = {
  sport: string
  league: string
  team: string
  set: string
  minPrice: string
  maxPrice: string
  search: string
  sort: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
}

const PAGE_SIZE = 24

// Memoized FilterSidebar component to prevent input focus loss
const FilterSidebar = React.memo(({
  searchInput,
  setSearchInput,
  handleSearchKeyPress,
  triggerSearch,
  filters,
  update,
  sports,
  leagues,
  teams,
  sets,
  resetFilters,
  activeFilterCount,
  pretty
}: {
  searchInput: string
  setSearchInput: (value: string) => void
  handleSearchKeyPress: (e: React.KeyboardEvent) => void
  triggerSearch: () => void
  filters: Filters
  update: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  sports: string[]
  leagues: string[]
  teams: string[]
  sets: string[]
  resetFilters: () => void
  activeFilterCount: number
  pretty: (s: string) => string
}) => (
  <div className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft h-fit sticky top-20">
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-header text-lg">Filters</h2>
      {activeFilterCount > 0 && (
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
          {activeFilterCount} active
        </span>
      )}
    </div>

    {/* Search */}
    <label className="block text-sm mb-3">
      Search
      <div className="relative mt-1">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          placeholder="Card title… (press Enter)"
          className="w-full rounded-xl border border-black/10 pl-3 pr-11 py-2 text-sm"
        />
        <button
          onClick={triggerSearch}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white hover:opacity-90 transition"
          title="Search"
        >
          🔍
        </button>
      </div>
    </label>

    <label className="block text-sm mb-3">
      Sport
      <select
        value={filters.sport}
        onChange={(e) => update('sport', e.target.value)}
        className="mt-1 w-full rounded-xl border border-black/10 p-2 bg-white"
      >
        <option value="">All</option>
        {sports.map((s) => (
          <option key={s} value={s}>{pretty(s)}</option>
        ))}
      </select>
    </label>

    <label className="block text-sm mb-3">
      League
      <select
        value={filters.league}
        onChange={(e) => update('league', e.target.value)}
        className="mt-1 w-full rounded-xl border border-black/10 p-2 bg-white"
      >
        <option value="">All</option>
        {leagues.map((l) => (
          <option key={l} value={l}>{pretty(l)}</option>
        ))}
      </select>
    </label>

    <label className="block text-sm mb-3">
      Team
      <select
        value={filters.team}
        onChange={(e) => update('team', e.target.value)}
        className="mt-1 w-full rounded-xl border border-black/10 p-2 bg-white"
      >
        <option value="">All</option>
        {teams.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </label>

    <label className="block text-sm mb-3">
      Set
      <select
        value={filters.set}
        onChange={(e) => update('set', e.target.value)}
        className="mt-1 w-full rounded-xl border border-black/10 p-2 bg-white"
      >
        <option value="">All</option>
        {sets.map((st) => (
          <option key={st} value={st}>{st}</option>
        ))}
      </select>
    </label>

    <div className="flex gap-2 mb-3">
      <label className="block text-sm flex-1">
        Min £
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => update('minPrice', e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 p-2"
          placeholder="0"
          min="0"
        />
      </label>
      <label className="block text-sm flex-1">
        Max £
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => update('maxPrice', e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 p-2"
          placeholder="1000"
          min="0"
        />
      </label>
    </div>

    <label className="block text-sm mb-4">
      Sort by
      <select
        value={filters.sort}
        onChange={(e) => update('sort', e.target.value as Filters['sort'])}
        className="mt-1 w-full rounded-xl border border-black/10 p-2 bg-white"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>
    </label>

    {activeFilterCount > 0 && (
      <button
        onClick={resetFilters}
        className="w-full px-3 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm"
      >
        Clear all filters
      </button>
    )}
  </div>
))

function normKey(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function pretty(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem } = useBasket()
  const { user } = useAuth()

  // Filter options
  const [sports, setSports] = useState<string[]>([])
  const [leagues, setLeagues] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [sets, setSets] = useState<string[]>([])

  // Mobile filter drawer
  const [showFilters, setShowFilters] = useState(false)

  // Local search input (NOT automatically synced - user must press Enter or click Search)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')

  // Filters (initialize from URL)
  const [filters, setFilters] = useState<Filters>(() => ({
    sport: searchParams.get('sport') ?? '',
    league: searchParams.get('league') ?? '',
    team: searchParams.get('team') ?? '',
    set: searchParams.get('set') ?? '',
    minPrice: searchParams.get('min') ?? '',
    maxPrice: searchParams.get('max') ?? '',
    search: searchParams.get('q') ?? '',
    sort: (searchParams.get('sort') as Filters['sort']) ?? 'newest',
  }))

  // Keep a ref to latest filters for scroll handler
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Data
  const [cards, setCards] = useState<Card[]>([])
  const [liveTotal, setLiveTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [wishlistCardIds, setWishlistCardIds] = useState<Set<string>>(new Set())

  // Keep URL in sync
  useEffect(() => {
    const params: Record<string, string> = {}
    if (filters.sport) params.sport = filters.sport
    if (filters.league) params.league = filters.league
    if (filters.team) params.team = filters.team
    if (filters.set) params.set = filters.set
    if (filters.minPrice) params.min = filters.minPrice
    if (filters.maxPrice) params.max = filters.maxPrice
    if (filters.search) params.q = filters.search
    if (filters.sort && filters.sort !== 'newest') params.sort = filters.sort
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Manual search trigger function
  const triggerSearch = useCallback(() => {
    console.log('🔍 Manual search triggered with:', searchInput)
    setFilters(f => ({ ...f, search: searchInput }))
  }, [searchInput])

  // Handle Enter key in search input
  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      triggerSearch()
    }
  }, [triggerSearch])

  // Load filter options
  useEffect(() => {
    async function loadFilterOptions() {
      const [sp, lg, tm, st] = await Promise.all([
        supabase.from('cards').select('sport').eq('status', 'live'),
        supabase.from('cards').select('league').eq('status', 'live'),
        supabase.from('cards').select('team').eq('status', 'live'),
        supabase.from('cards').select('set').eq('status', 'live'),
      ])

      const dedupe = (rows: any[], key: string) => {
        const seen = new Map<string, string>()
        for (const r of rows ?? []) {
          const raw = (r?.[key] ?? '').toString()
          const trimmed = raw.trim()
          if (!trimmed) continue
          const k = normKey(trimmed)
          if (!seen.has(k)) seen.set(k, trimmed)
        }
        return Array.from(seen.values()).sort((a, b) => a.localeCompare(b))
      }

      setSports(dedupe(sp.data as any[], 'sport'))
      setLeagues(dedupe(lg.data as any[], 'league'))
      setTeams(dedupe(tm.data as any[], 'team'))
      setSets(dedupe(st.data as any[], 'set'))
    }
    loadFilterOptions()
  }, [])

  // Load global live total
  useEffect(() => {
    async function loadLiveTotal() {
      const { count } = await supabase
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'live')
      setLiveTotal(count ?? 0)
    }
    loadLiveTotal()
  }, [])

  // Load user's wishlist card IDs
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

  // Load cards function
  const loadCards = useCallback(async (pageNum: number, append: boolean = false, currentFilters: Filters) => {
    if (!append) {
      setInitialLoading(true)
    }
    setLoading(true)

    let query = supabase
      .from('cards')
      .select('id,title,price,image_url,image_orientation,sport,league,team,set,nozid,created_at')
      .eq('status', 'live')

    if (currentFilters.sport) query = query.eq('sport', currentFilters.sport)
    if (currentFilters.league) query = query.eq('league', currentFilters.league)
    if (currentFilters.team) query = query.eq('team', currentFilters.team)
    if (currentFilters.set) query = query.eq('set', currentFilters.set)
    if (currentFilters.minPrice) query = query.gte('price', Number(currentFilters.minPrice))
    if (currentFilters.maxPrice) query = query.lte('price', Number(currentFilters.maxPrice))
    if (currentFilters.search) query = query.ilike('title', `%${currentFilters.search}%`)

    if (currentFilters.sort === 'newest') query = query.order('created_at', { ascending: false })
    if (currentFilters.sort === 'oldest') query = query.order('created_at', { ascending: true })
    if (currentFilters.sort === 'price_asc') query = query.order('price', { ascending: true, nullsFirst: true })
    if (currentFilters.sort === 'price_desc') query = query.order('price', { ascending: false, nullsLast: true })

    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, error } = await query

    if (!error && data) {
      if (append) {
        setCards(prev => [...prev, ...(data as Card[])])
      } else {
        setCards(data as Card[])
      }
      setHasMore(data.length === PAGE_SIZE)
    }

    setLoading(false)
    setInitialLoading(false)
  }, [])

  // Reset and load on filter change
  useEffect(() => {
    console.log('🚀 Filter changed, loading cards with filters:', filters)
    setPage(0)
    setCards([])
    setHasMore(true)
    loadCards(0, false, filters)
  }, [filters.sport, filters.league, filters.team, filters.set, filters.minPrice, filters.maxPrice, filters.search, filters.sort, loadCards])

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return

      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Load more when 500px from bottom
      if (scrollTop + windowHeight >= documentHeight - 500) {
        const nextPage = page + 1
        setPage(nextPage)
        loadCards(nextPage, true, filtersRef.current)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, loadCards])

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  const resetFilters = useCallback(() => {
    setSearchInput('')
    setFilters({
      sport: '',
      league: '',
      team: '',
      set: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'newest',
    })
  }, [])

  function removeFilter(key: keyof Filters) {
    if (key === 'search') setSearchInput('')
    setFilters(f => ({ ...f, [key]: '' }))
  }

  // Wishlist toggle handler
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
      // Remove from local state
      setWishlistCardIds(prev => {
        const next = new Set(prev)
        next.delete(card.id)
        return next
      })
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, card_id: card.id })
      // Add to local state
      setWishlistCardIds(prev => new Set(prev).add(card.id))
    }
  }

  // Add to basket handler
  const addToBasket = (card: Card, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: card.id,
      title: card.title,
      price: card.price!,
      image_url: card.image_url,
      nozid: card.nozid, // Include nozid for inventory tracking
    } as any)
  }

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return [
      filters.sport,
      filters.league,
      filters.team,
      filters.set,
      filters.minPrice,
      filters.maxPrice,
      filters.search,
    ].filter(Boolean).length
  }, [filters])

  return (
    <div className="relative">
      {/* Mobile filter button */}
      <div className="md:hidden mb-4 flex items-center justify-between">
        <div className="text-sm opacity-70">
          <span className="font-medium">{liveTotal}</span> cards live
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl bg-primary text-white flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-background p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-header text-xl">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-2xl">&times;</button>
            </div>
            <FilterSidebar
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              handleSearchKeyPress={handleSearchKeyPress}
              triggerSearch={triggerSearch}
              filters={filters}
              update={update}
              sports={sports}
              leagues={leagues}
              teams={teams}
              sets={sets}
              resetFilters={resetFilters}
              activeFilterCount={activeFilterCount}
              pretty={pretty}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block">
          <FilterSidebar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearchKeyPress={handleSearchKeyPress}
            triggerSearch={triggerSearch}
            filters={filters}
            update={update}
            sports={sports}
            leagues={leagues}
            teams={teams}
            sets={sets}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
            pretty={pretty}
          />
        </aside>

        {/* Main content */}
        <section className="space-y-4">
          {/* Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="text-sm opacity-70">
              <span className="font-medium">{liveTotal}</span> cards live
            </div>
          </div>

          {/* Active filter badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.sport && (
                <button
                  onClick={() => removeFilter('sport')}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
                >
                  Sport: {pretty(filters.sport)} <span>&times;</span>
                </button>
              )}
              {filters.league && (
                <button
                  onClick={() => removeFilter('league')}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
                >
                  League: {pretty(filters.league)} <span>&times;</span>
                </button>
              )}
              {filters.team && (
                <button
                  onClick={() => removeFilter('team')}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
                >
                  Team: {filters.team} <span>&times;</span>
                </button>
              )}
              {filters.set && (
                <button
                  onClick={() => removeFilter('set')}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
                >
                  Set: {filters.set} <span>&times;</span>
                </button>
              )}
              {filters.search && (
                <button
                  onClick={() => removeFilter('search')}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
                >
                  Search: "{filters.search}" <span>&times;</span>
                </button>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={() => {
                    removeFilter('minPrice')
                    removeFilter('maxPrice')
                  }}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
                >
                  Price: £{filters.minPrice || '0'}-£{filters.maxPrice || '∞'} <span>&times;</span>
                </button>
              )}
            </div>
          )}

          {/* Cards grid */}
          {initialLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="p-3 bg-white rounded-2xl shadow-soft border border-black/5">
                  <div className="aspect-[3/4] rounded-xl bg-black/10 mb-2 animate-pulse" />
                  <div className="h-4 w-2/3 bg-black/10 rounded mb-1 animate-pulse" />
                  <div className="h-3 w-1/3 bg-black/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12 opacity-70">
              <p>No matching cards found.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cards.map((card) => {
                  const aspect = card.image_orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'
                  const isInWishlist = wishlistCardIds.has(card.id)
                  
                  return (
                    <Link
                      key={card.id}
                      to={`/card/${card.id}`}
                      className="group rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block"
                    >
                      <div className={`${aspect} rounded-xl bg-black/5 mb-2 border border-black/10 overflow-hidden relative`}>
                        {card.image_url && (
                          <img
                            src={card.image_url}
                            alt={card.title}
                            loading="lazy"
                            className="object-cover w-full h-full"
                          />
                        )}
                        
                        {/* Hover Icons Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => addToBasket(card, e)}
                            className="w-10 h-10 rounded-full bg-white text-primary hover:bg-primary hover:text-white transition flex items-center justify-center"
                            title="Add to basket"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => toggleWishlist(card, e)}
                            className={`w-10 h-10 rounded-full transition flex items-center justify-center ${
                              isInWishlist 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-white text-red-500 hover:bg-red-500 hover:text-white'
                            }`}
                            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xs font-medium leading-snug line-clamp-2 min-h-[2.25rem]">
                        {card.title ?? 'Untitled card'}
                      </h3>
                      {card.price != null && (
                        <p className="text-sm opacity-70">£{card.price}</p>
                      )}
                      <p className="mt-1 text-[11px] opacity-60 truncate">
                        {[card.sport, card.league].filter(Boolean).join(' • ')}
                      </p>
                    </Link>
                  )
                })}
              </div>

              {/* Loading more indicator */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm opacity-70">Loading more cards...</p>
                </div>
              )}

              {!hasMore && cards.length > 0 && (
                <div className="text-center py-8 opacity-70 text-sm">
                  That's all the cards! 🎉
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
