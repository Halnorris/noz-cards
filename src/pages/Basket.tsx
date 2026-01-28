// src/pages/Basket.tsx
import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useBasket } from '@/context/basket'

type BasketItem = {
  id: string
  title: string
  price: number | null
  image_url: string | null
  nozid?: string
  qty: number
}

function formatPrice(n: number | null | undefined) {
  if (n == null) return '—'
  return `£${n.toFixed(2)}`
}

export default function BasketPage() {
  const navigate = useNavigate()
  const { items = [], removeItem, clear } = useBasket()

  const subtotal = useMemo(
    () => items.reduce((s: number, it: BasketItem) => s + (it.price ?? 0), 0),
    [items]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-header text-2xl">Your Basket ({items.length})</h1>
        <Link to="/marketplace" className="underline text-sm">Continue shopping</Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft text-center">
          <div className="text-sm opacity-70">Your basket is empty.</div>
          <Link to="/marketplace" className="inline-block mt-3 px-4 py-2 rounded-xl bg-primary text-white">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Items list */}
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="rounded-2xl bg-white p-3 border border-black/5 shadow-soft flex gap-3">
                <Link to={`/card/${it.id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-black/5 border border-black/10">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.title} className="w-full h-full object-cover" />
                  ) : null}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/card/${it.id}`} className="font-medium text-sm hover:underline block truncate">
                    {it.title}
                  </Link>
                  <div className="text-sm font-header mt-1">{formatPrice(it.price)}</div>

                  <button
                    className="mt-2 text-xs text-red-600 hover:underline"
                    onClick={() => removeItem?.(it.id)}
                    disabled={!removeItem}
                  >
                    Remove
                  </button>
                </div>

                <div className="text-sm font-header">
                  {formatPrice(it.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="rounded-2xl bg-white p-4 border border-black/5 shadow-soft h-fit">
            <div className="text-lg font-header">Order Summary</div>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="opacity-70">Subtotal ({items.length} {items.length === 1 ? 'card' : 'cards'})</span>
                <span className="font-header">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Shipping</span>
                <span className="opacity-70">Calculated at checkout</span>
              </div>
              <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                <span>Total</span>
                <span className="font-header">{formatPrice(subtotal)}</span>
              </div>
              <div className="text-[11px] opacity-70">
                Fees & taxes (if any) shown at checkout.
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-3 w-full px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90"
            >
              Go to Checkout
            </button>

            <Link
              to="/marketplace"
              className="mt-2 block w-full text-center px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm"
            >
              Continue Shopping
            </Link>

            <button
              onClick={() => clear?.()}
              disabled={!clear || items.length === 0}
              className="mt-3 w-full px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-xs disabled:opacity-50"
            >
              Clear basket
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
