import { Link } from 'react-router-dom'
import { useBasket } from '@/context/basket'

export default function BasketPage() {
  const { items, removeItem, clear } = useBasket()
  const subtotal = items.reduce((t, i) => t + (i.price ?? 0) * i.qty, 0)
  const buyerFee = subtotal * 0.10
  const total = subtotal + buyerFee

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="font-header text-2xl">Your Basket</h1>
        <p className="opacity-70">Your basket is empty.</p>
        <Link to="/marketplace" className="underline">Browse the marketplace</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-header text-2xl">Your Basket</h1>
        <button onClick={clear} className="text-sm underline opacity-70 hover:opacity-100">Clear all</button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Items */}
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-black/5 shadow-soft">
              <div className="w-20 h-28 rounded-lg bg-black/5 overflow-hidden">
                {it.image_url ? <img src={it.image_url} alt={it.title ?? 'Card'} className="object-cover w-full h-full" /> : null}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{it.title ?? 'Card'}</div>
                <div className="text-sm opacity-70">Qty: {it.qty}</div>
              </div>
              <div className="text-sm">£{(it.price ?? 0).toFixed(2)}</div>
              <button onClick={() => removeItem(it.id)} className="text-xs underline opacity-70 hover:opacity-100">Remove</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft space-y-2 h-fit">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span>Buyer fee (10%)</span><span>£{buyerFee.toFixed(2)}</span></div>
          <div className="h-px bg-black/10 my-2" />
          <div className="flex justify-between font-header"><span>Total</span><span>£{total.toFixed(2)}</span></div>
          <Link to="/checkout" className="block mt-3 text-center px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </div>
  )
}
