export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="font-header text-2xl">Ideal for Sellers, Perfect for Buyers</h1>
      <p className="opacity-80 max-w-2xl">
        Welcome to Noz Cards — a football trading card marketplace with consignment, live listings, and auctions.
        This is your fresh start build on Vercel. Use the sidebar to jump into account sections.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-3 shadow-soft border border-black/5">
            <div className="aspect-[3/4] rounded-xl bg-black/5 mb-2" />
            <div className="text-sm font-medium">Card #{i + 1}</div>
            <div className="text-sm opacity-70">£{(i + 1) * 10}.00</div>
          </div>
        ))}
      </div>
    </section>
  )
}
