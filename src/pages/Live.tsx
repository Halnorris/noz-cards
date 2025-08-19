export default function Live() {
  return (
    <section className="space-y-4">
      <h1 className="font-header text-2xl">Live Cards</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-4 shadow-soft border border-black/5 relative">
            <button className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-red-600 text-white">Request Back</button>
            <div className="aspect-[3/4] rounded-xl bg-black/5 mb-3" />
            <div className="text-sm font-medium mb-2">Card #{i + 1}</div>
            <div className="flex gap-2">
              <input className="flex-1 border rounded-xl px-3 py-2" defaultValue={((i + 1) * 10).toFixed(2)} />
              <button className="px-3 py-2 rounded-xl bg-primary text-white">Update Price</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
