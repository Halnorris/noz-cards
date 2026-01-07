import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

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

function normKey(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function pretty(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter options
  const [sports, setSports] = useState<string[]>([])
  const [leagues, setLeagues] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [sets, setSets] = useState<string[]>([])

  // Mobile filter drawer
  const [showFilters, setShowFilters] = useState(false)

  // Local search input (debounced)
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

  // Data
  const [cards, setCards] = useState<Card[]>([])
  const [liveTotal, setLiveTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [page, setPage] = useState(0)

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

  // Debounce search input: update filters.search only after user stops typing for 500ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput }))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchInput])

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

  // Load cards function
  const loadCards = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!append) {
      setInitialLoading(true)
    }
    setLoading(true)

    let query = supabase
      .from('cards')
      .select('id,title,price,image_url,image_orientation,sport,league,team,set,created_at')
      .eq('status', 'live')

    if (filters.sport) query = query.eq('sport', filters.sport)
    if (filters.league) query = query.eq('league', filters.league)
    if (filters.team) query = query.eq('team', filters.team)
    if (filters.set) query = query.eq('set', filters.set)
    if (filters.minPrice) query = query.gte('price', Number(filters.minPrice))
    if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice))
    if (filters.search) query = query.ilike('title', `%${filters.search}%`)

    if (filters.sort === 'newest') query = query.order('created_at', { ascending: false })
    if (filters.sort === 'oldest') query = query.order('created_at', { ascending: true })
    if (filters.sort === 'price_asc') query = query.order('price', { ascending: true, nullsFirst: true })
    if (filters.sort === 'price_desc') query = query.order('price', { ascending: false, nullsLast: true })

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
  }, [filters])

  // Reset and load on filter change
  useEffect(() => {
    setPage(0)
    setCards([])
    setHasMore(true)
    loadCards(0, false)
  }, [filters.sport, filters.league, filters.team, filters.set, filters.minPrice, filters.maxPrice, filters.search, filters.sort])

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
        loadCards(nextPage, true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, loadCards])

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  function resetFilters() {
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
  }

  function removeFilter(key: keyof Filters) {
    if (key === 'search') setSearchInput('')
    setFilters(f => ({ ...f, [key]: '' }))
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

  // Filter sidebar component
  const FilterSidebar = () => (
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
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Card title…"
          className="mt-1 w-full rounded-xl border border-black/10 p-2"
        />
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
          {sets.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <label className="block text-sm">
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
        <label className="block text-sm">
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
  )

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
            <FilterSidebar />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block">
          <FilterSidebar />
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
