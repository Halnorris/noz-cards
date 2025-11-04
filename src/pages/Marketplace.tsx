import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

const PAGE_SIZE = 48

// Normalize strings for deduping option lists
function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}
// Nice display (optional): Title Case-ish
function pretty(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Marketplace() {
  // Distinct option lists
  const [sports, setSports] = useState<string[]>([])
  const [leagues, setLeagues] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [sets, setSets] = useState<string[]>([])

  // Filters / UI
  const [filters, setFilters] = useState<Filters>({
    sport: '',
    league: '',
    team: '',
    set: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: 'newest',
  })

  // Data / pagination / counts
  const [cards, setCards] = useState<Card[]>([])
  const [total, setTotal] = useState(0)          // filtered total (for pagination)
  const [liveTotal, setLiveTotal] = useState(0)  // global live total (header)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Load distinct values for filters (from live cards only) — de-duplicated client-side
  useEffect(() => {
    async function loadFilterOptions() {
      const [sp, lg, tm, st] = await Promise.all([
        supabase.from('cards').select('sport', { distinct: true }).eq('status', 'live'),
        supabase.from('cards').select('league', { distinct: true }).eq('status', 'live'),
        supabase.from('cards').select('team', { distinct: true }).eq('status', 'live'),
        supabase.from('cards').select('set', { distinct: true }).eq('status', 'live'),
      ])

      const dedupe = (rows: any[], key: string) => {
        const seen = new Set<string>()
        const out: string[] = []
        for (const r of rows ?? []) {
          const raw = (r?.[key] ?? '').toString().trim()
          if (!raw) continue
          const k = norm(raw)
          if (seen.has(k)) continue
          seen.add(k)
          out.push(pretty(raw))
        }
        return out.sort((a, b) => a.localeCompare(b))
      }

      setSports(dedupe(sp.data as any[], 'sport'))
      setLeagues(dedupe(lg.data as any[], 'league'))
      setTeams(dedupe(tm.data as any[], 'team'))
      setSets(dedupe(st.data as any[], 'set'))
    }
    loadFilterOptions()
  }, [])

  // Load global live total (independent of filters)
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

  // Build query whenever filters/page change
  useEffect(() => {
    async function loadCards() {
      setLoading(true)
      let query = supabase
        .from('cards')
        .select('id,title,price,image_url,image_orientation,sport,league,team,set,created_at', { count: 'exact' })
        .eq('status', 'live')

      if (filters.sport) query = query.ilike('sport', filters.sport)   // ilike to be forgiving vs pretty()
      if (filters.league) query = query.ilike('league', filters.league)
      if (filters.team) query = query.ilike('team', filters.team)
      if (filters.set) query = query.ilike('set', filters.set)
      if (filters.minPrice) query = query.gte('price', Number(filters.minPrice))
      if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice))
      if (filters.search) query = query.ilike('title', `%${filters.search}%`)

      // Sorting
      if (filters.sort === 'newest') query = query.order('created_at', { ascending: false })
      if (filters.sort === 'oldest') query = query.order('created_at', { ascending: true })
      if (filters.sort === 'price_asc') query = query.order('price', { ascending: true, nullsFirst: true })
      if (filters.sort === 'price_desc') query = query.order('price', { ascending: false, nullsLast: true })

      // Pagination
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data, count, error } = await query
      if (!error) {
        setCards((data ?? []) as Card[])
        setTotal(count ?? 0)
      }
      setLoading(false)
    }
    loadCards()
  }, [filters, page])

  // Reset pagination when filters change (except page)
  useEffect(() => {
    setPage(1)
  }, [
    filters.sport,
    filters.league,
    filters.team,
    filters.set,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.sort,
  ])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  function resetFilters() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
      {/* Sidebar Filters (marketplace-only sidebar; NOT the global Account sidebar) */}
      <aside className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft h-fit sticky top-20">
        <h2 className="font-header text-lg mb-3">Filters</h2>

        {/* Search */}
        <label className="block text-sm mb-3">
          Search
          <input
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Card title…"
            className="mt-1 w-full rounded-xl border border-black/10 p-2"
          />
        </label>

        {/* Sport */}
        <label className="block text-sm mb-3">
          Sport
          <select
            value={filters.sport}
            onChange={(e) => update('sport', e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 p-2 bg-white"
          >
            <option value="">All</option>
            {sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {/* League */}
        <label className="block text-sm mb-3">
          League
          <select
            value={filters.league}
            onChange={(e) => update('league', e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 p-2 bg-white"
          >
            <option value="">All</option>
            {leagues.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>

        {/* Team */}
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

        {/* Set */}
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

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <label className="block text-sm">
            Min £
            <input
              type="number"
              inputMode="decimal"
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
              inputMode="decimal"
              value={filters.maxPrice}
              onChange={(e) => update('maxPrice', e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 p-2"
              placeholder="1000"
              min="0"
            />
          </label>
        </div>

        {/* Sort */}
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

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="w-full px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
        >
          Reset filters
        </button>
      </aside>

      {/* Main content */}
      <section className="space-y-4">
        {/* Header bar with global live total + pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm opacity-70">
            <span className="font-medium">{liveTotal}</span> cards live
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-xl border border-black/10 hover:bg-black/5 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm opacity-70">
              Page <span className="font-medium">{page}</span> / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(total / PAGE_SIZE)), p + 1))}
              disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))}
              className="px-3 py-1 rounded-xl border border-black/10 hover:bg-black/5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="p-3 bg-white rounded-2xl shadow-soft border border-black/5">
                <div className="aspect-[3/4] rounded-xl bg-black/10 mb-2 animate-pulse" />
                <div className="h-4 w-2/3 bg-black/10 rounded mb-1 animate-pulse" />
                <div className="h-3 w-1/3 bg-black/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="opacity-70 text-sm">No matching cards. Try clearing a filter.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cards.map((card) => {
              const aspect =
                card.image_orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'
              return (
                <Link
                  key={card.id}
                  to={`/card/${card.id}`}
                  className="group rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition block"
                >
                  <div className={`${aspect} rounded-xl bg-black/5 mb-2 border border-black/10 overflow-hidden`}>
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
                  {/* Tiny meta row (sport • league) */}
                  <p className="mt-1 text-[11px] opacity-60 truncate">
                    {[card.sport, card.league].filter(Boolean).join(' • ')}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
