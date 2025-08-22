export default function Home() {
  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="rounded-2xl bg-white shadow-soft border border-black/5 p-6 md:p-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-header leading-tight text-4xl md:text-5xl">
              Buy, Sell & Consign <span className="text-primary">Football Cards</span>
              <span className="block text-[clamp(22px,3vw,32px)] mt-1">Now with real-time Auctions</span>
            </h1>

            <p className="mt-4 opacity-80 max-w-xl">
              Submit a consignment in minutes, we do the rest. 
              KYC ID verification for buyers, keeping bidding legit. 
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/marketplace" className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90">
                Browse Marketplace
              </a>
              <a href="/account/pending" className="px-5 py-3 rounded-xl bg-secondary hover:opacity-90">
                Submit Cards
              </a>
            </div>

            {/* Updated key points */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                'Instant checkout',
                'Create a collection and ship everything together',
                'No upfront cost for sellers',
                'Auctions require ID to bid',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 grid place-items-center text-primary">✓</span>
                  <span className="opacity-80">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hero visual (placeholder or later Supabase image) */}
          <div className="rounded-xl border border-black/10 shadow-soft p-3 bg-gradient-to-br from-black/5 via-black/10 to-black/5 flex items-center justify-center">
            {/* If using a local placeholder, keep this img. If not uploaded yet, keep the grey box. */}
            {/* <img src="/hero-card.jpg" alt="Featured football card" className="rounded-xl shadow-md max-h-[420px] w-auto" /> */}
            <div className="aspect-[4/3] md:aspect-square rounded-lg bg-black/10" />
          </div>
        </div>
      </section>

      {/* FEES STRIP (new) */}
      <section className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-5 shadow-soft border border-black/5">
          <div className="text-xs uppercase tracking-wide opacity-70">Buyer Fee</div>
          <div className="text-2xl font-header">+10%</div>
          <p className="text-sm opacity-80 mt-1">Applied at checkout, shown before you pay.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft border border-black/5">
          <div className="text-xs uppercase tracking-wide opacity-70">Seller Fee</div>
          <div className="text-2xl font-header">15%</div>
          <p className="text-sm opacity-80 mt-1">Deducted from the sale; payout handled by Stripe.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft border border-black/5">
          <div className="text-xs uppercase tracking-wide opacity-70">Security</div>
          <div className="text-2xl font-header">ID Required</div>
          <p className="text-sm opacity-80 mt-1">KYC required to bid in auctions—no ghost bidding.</p>
        </div>
      </section>

      {/* FEATURED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-header text-2xl">Featured Cards</h2>
          <a href="/marketplace" className="text-sm underline opacity-80 hover:opacity-100">See all</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <article
              key={i}
              className="group rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <div className="aspect-[3/4] rounded-xl bg-black/5 mb-2 border border-black/10 relative overflow-hidden">
                <span className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-secondary/80">
                  Featured
                </span>
              </div>
              <h3 className="text-sm font-medium truncate">Card #{i + 1}</h3>
              <p className="text-sm opacity-70">£{(i + 1) * 8}.00</p>
              <button className="mt-2 w-full px-3 py-2 rounded-xl bg-primary text-white text-sm opacity-0 group-hover:opacity-100 transition">
                View
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (updated for instant checkout & Stripe) */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: '1) Submit',
            desc: 'Fill out our form, send us your cards, and we'll do the rest.',
          },
          {
            title: '2) Go Live',
            desc: 'You can price it, we can price it. Auction or Buy it Now? Your Choice.',
          },
          {
            title: '3) Get Paid',
            desc: 'Get paid out via Stripe.',
          },
        ].map((x) => (
          <div key={x.title} className="rounded-2xl bg-white p-5 shadow-soft border border-black/5">
            <div className="text-lg font-header mb-1">{x.title}</div>
            <p className="text-sm opacity-80">{x.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA BAND */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-header text-xl">Ready to sell your first card?</h3>
          <p className="opacity-80 text-sm">Instant checkout for buyers, streamlined Stripe payouts for sellers.</p>
        </div>
        <div className="flex gap-3">
          <a href="/account" className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90">Go to Dashboard</a>
          <a href="/account/pending" className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5">Submit Cards</a>
        </div>
      </section>
    </div>
  )
}
