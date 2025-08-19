export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-white shadow-soft border border-black/5 p-6 md:p-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-header text-3xl md:text-4xl leading-tight">
              Buy, Sell & Consign <span className="text-primary">Football Cards</span> — now with Auctions
            </h1>
            <p className="mt-3 opacity-80">
              Noz Cards is built for sellers and buyers. List your cards in minutes, run timed auctions with anti-sniping,
              and manage everything from your account dashboard.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="/marketplace" className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90">
                Browse Marketplace
              </a>
              <a href="/account/pending" className="px-4 py-2 rounded-xl bg-secondary hover:opacity-90">
                Submit Cards
              </a>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                'Zero-transfer Vercel build',
                'Supabase Auth + Realtime',
                'Auctions with reserve & buy-now',
                'Store credit & listing fees'
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 grid place-items-center text-primary">✓</span>
                  <span className="opacity-80">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-black/5 aspect-[4/3] md:aspect-square" />
        </div>
      </section>

      {/* Featured cards (placeholder) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-header text-2xl">Featured Cards</h2>
          <a href="/marketplace" className="text-sm underline opacity-80 hover:opacity-100">See all</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-3 shadow-soft border border-black/5 hover:-translate-y-0.5 transition">
              <div className="aspect-[3/4] rounded-xl bg-black/5 mb-2" />
              <div className="text-sm font-medium truncate">Card #{i + 1}</div>
              <div className="text-sm opacity-70">£{(i + 1) * 8}.00</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: '1) Submit',
            desc: 'Upload scans and details. Choose fixed price or list as auction.',
          },
          {
            title: '2) List',
            desc: 'We charge a listing fee by service level. Card goes live instantly.',
          },
          {
            title: '3) Sell',
            desc: 'Funds settle to your balance; request payout anytime.',
          },
        ].map((x) => (
          <div key={x.title} className="rounded-2xl bg-white p-5 shadow-soft border border-black/5">
            <div className="text-lg font-header mb-1">{x.title}</div>
            <p className="text-sm opacity-80">{x.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA band */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-header text-xl">Ready to sell your first card?</h3>
          <p className="opacity-80 text-sm">Create an account and list a card in under 2 minutes.</p>
        </div>
        <div className="flex gap-3">
          <a href="/account" className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90">Go to Dashboard</a>
          <a href="/account/pending" className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5">Submit Cards</a>
        </div>
      </section>
    </div>
  )
}
