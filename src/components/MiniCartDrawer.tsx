import { Link } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { useMemo } from 'react'

export default function MiniCartDrawer() {
  const { items, miniCartOpen, closeMiniCart, removeItem, setQty } = useBasket()

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (it.qty * (it.price ?? 0)), 0),
    [items]
  )

  if (!miniCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={closeMiniCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className="font-header text-xl">Your Basket</h2>
          <button
            onClick={closeMiniCart}
            className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center"
            aria-label="Close basket"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-sm opacity-70 mb-4">Your basket is empty</p>
            <Link
              to="/marketplace"
              onClick={closeMiniCart}
              className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-black/5 hover:bg-black/[0.02] transition group">
                  <Link
                    to={`/card/${item.id}`}
                    onClick={closeMiniCart}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-black/5 border border-black/10 shrink-0"
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title || 'Card'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black/5" />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/card/${item.id}`}
                      onClick={closeMiniCart}
                      className="text-sm font-medium hover:underline line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs opacity-70 mt-0.5">
                      £{(item.price ?? 0).toFixed(2)} each
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                        className="w-6 h-6 rounded-lg border border-black/10 hover:bg-black/5 flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm w-8 text-center font-medium">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        className="w-6 h-6 rounded-lg border border-black/10 hover:bg-black/5 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-xs text-red-600 hover:underline opacity-0 group-hover:opacity-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-header shrink-0">
                    £{((item.price ?? 0) * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-black/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-70">Subtotal</span>
                <span className="font-header text-lg">£{subtotal.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                onClick={closeMiniCart}
                className="block w-full px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90 text-center font-medium"
              >
                Checkout
              </Link>

              <Link
                to="/basket"
                onClick={closeMiniCart}
                className="block w-full px-5 py-2 rounded-xl border border-black/10 hover:bg-black/5 text-center text-sm"
              >
                View Full Basket
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
