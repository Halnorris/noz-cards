import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useBasket } from '@/context/basket'

function formatPrice(n: number | null | undefined) {
  if (n == null) return '—'
  return `£${n.toFixed(2)}`
}

export default function MiniCartDrawer() {
  const navigate = useNavigate()
  const { items, removeItem, setQty, clear, isOpen, closeMiniCart } = useBasket()

  const count = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items]
  )
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (it.price ?? 0) * it.qty, 0),
    [items]
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMiniCart}
      />
      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-[92vw] sm:w-[420px] bg-white shadow-2xl border-l border-black/10 p-4 flex flex-col transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-header">Your Basket ({count})</div>
          <button
            onClick={closeMiniCart}
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
            items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 border border-black/5 rounded-xl p-2">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-black/5 border border-black/10">
                  {it.image_url && (
                    <img src={it.image_url} alt={it.title ?? 'Card'} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/card/${it.id}`}
                    className="block text-sm font-medium truncate hover:underline"
                    onClick={closeMiniCart}
                  >
                    {it.title ?? 'Card'}
                  </Link>
                  <div className="text-xs opacity-70">{formatPrice(it.price)}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        className="px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-xs"
                        onClick={() => setQty(it.id, Math.max(1, it.qty - 1))}
                        title="Decrease"
                      >
                        −
                      </button>
                      <span className="text-sm w-6 text-center">{it.qty}</span>
                      <button
                        className="px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5 text-xs"
                        onClick={() => setQty(it.id, it.qty + 1)}
                        title="Increase"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="ml-2 text-xs px-2 py-1 rounded-lg border border-black/10 hover:bg-black/5"
                      onClick={() => removeItem(it.id)}
                      title="Remove"
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
              onClick={closeMiniCart}
              className="px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-sm text-center"
            >
              View Basket
            </Link>
            <button
              onClick={() => {
                closeMiniCart()
                navigate('/checkout')
              }}
              className="px-3 py-2 rounded-xl bg-primary text-white hover:opacity-90 text-sm"
            >
              Checkout
            </button>
          </div>

          <button
            onClick={clear}
            disabled={items.length === 0}
            className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-xs disabled:opacity-50"
          >
            Clear basket
          </button>
        </div>
      </aside>
    </>
  )
}
