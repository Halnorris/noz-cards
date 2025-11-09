// src/components/MiniCartDrawer.tsx
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBasket } from '@/context/basket'

type BasketItem = {
  id: string
  title: string
  price: number | null
  image_url: string | null
  qty?: number
}

function formatPrice(n: number | null | undefined) {
  if (n == null) return '—'
  return `£${n.toFixed(2)}`
}

export default function MiniCartDrawer() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { items = [], removeItem, setQty, clear } = useBasket() as any

  const count = useMemo(
    () => items.reduce((sum: number, it: BasketItem) => sum + (it.qty ?? 1), 0),
    [items]
  )
  const subtotal = useMemo(
    () => items.reduce((sum: number, it: BasketItem) => sum + ((it.qty ?? 1) * (it.price ?? 0)), 0),
    [items]
  )

  return (
    <>
      {/* Launcher button (badge) */}
      <button
        aria-label="Open cart"
        onClick={() => setOpen(true)}
        className="relative rounded-xl border border-black/10 px-3 py-2 hover:bg-black/5"
      >
        <span className="inline-block">🛒</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 text-[11px] px-1.5 py-0.5 rounded-full bg-primary text-white">
            {count}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute right-0 top-0 h-full w-[92vw] sm:w-[420px] bg-white shadow-2xl border-l border-black/10 p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="font-header">Your Basket</div>
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5"
              >
                Close
              </button>
            </div>

            {/* Items */}
            <div className="mt-3 space-y-3 overflow-auto">
              {items.length === 0 ? (
                <div className="opacity-70 text-sm py-12 text-center">
                  Your basket is empty.
                </div>
              ) : (
                items.map((it: BasketItem) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 border border-black/5 rounded-xl p-2"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/5 border border-black/10">
                      {it.image_url ? (
                        <img src={it.image_url} alt={it.title} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/card/${it.id}`}
                        className="block text-sm font-medium truncate hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        {it.title}
                      </Link>
                      <div className="text-xs opacity-70">{formatPrice(it.price)}</div>
                      <div className="mt-1 flex items-center gap-2">
                        {/* Qty control (UI-only; uses setQty if available) */}
                        <div className="flex items-center gap-1">
                          <button
                            className="px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-xs"
                            onClick={() => setQty?.(it.id, Math.max(1, (it.qty ?? 1) - 1))}
                            disabled={!setQty}
                            title={setQty ? 'Decrease' : 'Qty editing coming soon'}
                          >
                            −
                          </button>
                          <span className="text-sm w-6 text-center">{it.qty ?? 1}</span>
                          <button
                            className="px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-xs"
                            onClick={() => setQty?.(it.id, (it.qty ?? 1) + 1)}
                            disabled={!setQty}
                            title={setQty ? 'Increase' : 'Qty editing coming soon'}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="ml-2 text-xs px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5"
                          onClick={() => removeItem?.(it.id)}
                          disabled={!removeItem}
                          title={removeItem ? 'Remove' : 'Remove coming soon'}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / totals */}
            <div className="mt-auto pt-3 border-t border-black/10">
              <div className="flex items-center justify-between text-sm">
                <div className="opacity-70">Subtotal</div>
                <div className="font-header">{formatPrice(subtotal)}</div>
              </div>
              <div className="mt-1 text-[11px] opacity-70">
                Shipping & fees calculated at checkout.
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/basket"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm text-center"
                >
                  View Basket
                </Link>
                <button
                  onClick={() => {
                    setOpen(false)
                    navigate('/checkout')
                  }}
                  className="px-3 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm"
                >
                  Checkout
                </button>
              </div>

              <button
                onClick={() => clear?.()}
                disabled={!clear || items.length === 0}
                className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-xs disabled:opacity-50"
              >
                Clear basket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
