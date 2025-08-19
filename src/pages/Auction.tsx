import { useParams } from 'react-router-dom'

export default function Auction() {
  const { id } = useParams()
  return (
    <section className="space-y-4">
      <h1 className="font-header text-2xl">Auction #{id}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white p-4 shadow-soft border border-black/5">
          <div className="aspect-square rounded-xl bg-black/5" />
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-soft border border-black/5 space-y-3">
          <div className="text-sm opacity-70">Time remaining:</div>
          <div className="text-xl font-header">00:10:00</div>
          <div className="text-sm opacity-70">Current price:</div>
          <div className="text-2xl font-header">£50.00</div>
          <div className="flex gap-2">
            <input className="flex-1 border rounded-xl px-3 py-2" placeholder="Your bid (£)" />
            <button className="px-3 py-2 rounded-xl bg-primary text-white">Place Bid</button>
          </div>
          <button className="px-3 py-2 rounded-xl bg-secondary w-full">Buy It Now</button>
          <div className="pt-3">
            <div className="text-sm font-medium mb-2">Recent bids</div>
            <ul className="space-y-1 text-sm opacity-80">
              <li>£50.00 — user123</li>
              <li>£45.00 — user987</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
