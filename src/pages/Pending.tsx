export default function Pending() {
  return (
    <section className="space-y-4">
      <h1 className="font-header text-2xl">Pending Cards</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-4 shadow-soft border border-black/5">
            <div className="aspect-[3/4] rounded-xl bg-black/5 mb-3" />
            <div className="text-sm opacity-80 mb-2">Example card description</div>
            <input
              className="w-full border rounded-xl px-3 py-2 mb-2"
              placeholder="Set your price (£)"
              type="number"
              min="0"
              step="0.01"
            />
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-xl bg-primary text-white">Confirm</button>
              <button className="px-3 py-2 rounded-xl bg-secondary">List as Auction</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
