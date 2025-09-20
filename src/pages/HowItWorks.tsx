import { Link } from 'react-router-dom'

export default function HowItWorks() {
  return (
    <div className="space-y-12">
      {/* SIMPLE HERO / INTRO */}
      <section className="rounded-2xl bg-white border border-black/5 shadow-soft p-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-sm bg-primary/10 text-primary mb-3">
          How It Works
        </span>
        <h1 className="font-header text-3xl md:text-4xl leading-tight">
          Sell your cards with ease. <span className="text-primary">We handle the rest.</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto opacity-80">
          Submit your cards in minutes. We scan, list, and promote them. Buyers pay instantly,
          and payouts are handled securely via Stripe.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/account/pending"
            className="px-5 py-3 rounded-xl bg-primary text-white hover:opacity-90"
          >
            Submit Cards
          </Link>
          <Link
            to="/marketplace"
            className="px-5 py-3 rounded-xl border border-black/10 hover:bg-black/5"
          >
            Browse Marketplace
          </Link>
        </div>
      </section>

      {/* 3-STEP STRIP */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            step: '1',
            title: 'Submit',
            desc:
              'Tell us about your cards and post them to us. No upfront fees. We handle scanning & listing.',
          },
          {
            step: '2',
            title: 'Go Live',
            desc:
              'Set your own prices, or let us do it for you. We handle marketing, storage and shipping.',
          },
          {
            step: '3',
            title: 'Get Paid',
            desc:
              'Instant checkout for buyers. We deduct fees and pay out to you via Stripe fast and securely.',
          },
        ].map((x) => (
          <div
            key={x.step}
            className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft text-center"
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 text-primary font-bold grid place-items-center">
              {x.step}
            </div>
            <h3 className="font-header text-lg mb-1">{x.title}</h3>
            <p className="text-sm opacity-80">{x.desc}</p>
          </div>
        ))}
      </section>

      {/* BUYERS & SELLERS PANELS */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-header text-xl">For Buyers</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">Secure</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="w-5 h-5 grid place-items-center rounded-full bg-primary/10 text-primary">✓</span>
              Instant checkout with transparent +10% buyer fee shown before you pay.
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 grid place-items-center rounded-full bg-primary/10 text-primary">✓</span>
              Collective shipping: buy multiple items and ship them all at once.
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 grid place-items-center rounded-full bg-primary/10 text-primary">✓</span>
              Buy from one trusted seller.
            </li>
          </ul>
          <div className="mt-4">
            <Link to="/marketplace" className="text-sm underline">Start browsing</Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-header text-xl">For Sellers</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">Easy</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="w-5 h-5 grid place-items-center rounded-full bg-primary/10 text-primary">✓</span>
              Consign &amp; sell: send us your cards and we handle the photography & listing.
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 grid place-items-center rounded-full bg-primary/10 text-primary">✓</span>
              Set your own price or we can do it for you. You can always change your prices at any time.
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 grid place-items-center rounded-full bg-primary/10 text-primary">✓</span>
              Payouts via Stripe. 15% seller fee is deducted automatically on sale.
            </li>
          </ul>
          <div className="mt-4">
            <Link to="/account/pending" className="text-sm underline">Submit your first cards</Link>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="rounded-2xl bg-white p-6 md:p-8 border border-black/5 shadow-soft">
        <h2 className="font-header text-xl mb-6">The Journey</h2>
        <ol className="relative pl-6 space-y-6">
          {[
            { title: 'Submit cards', body: 'Complete the online form and send your package.' },
            { title: 'We scan & list', body: 'High-quality images and clean titles hassle free.' },
            { title: 'Go Live', body: 'Confirm your cards and prices and they go live on our marketplace.' },
            { title: 'Buyers checkout', body: 'Instant payment at checkout.' },
            { title: 'Payout', body: 'We deduct 15% seller fee and pay the remainder to your Stripe account.' },
          ].map((row, i) => (
            <li key={i} className="relative">
              <span className="absolute left-0 top-1.5 -translate-x-6 w-3 h-3 rounded-full bg-primary" />
              <div className="font-header">{row.title}</div>
              <div className="text-sm opacity-80">{row.body}</div>
              {i !== 4 && (
                <span className="absolute left-0 top-3 -bottom-6 -translate-x-[1.125rem] w-px bg-black/10" />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ ACCORDION */}
      <section className="space-y-4">
        <h2 className="font-header text-xl">FAQ</h2>

        <Accordion
          items={[
            {
              q: 'What fees do you charge?',
              a: 'Buyers pay +10% at checkout. Sellers pay 15% which is deducted from the sale before payout.',
            },
            {
              q: 'Why do I need a Stripe account?',
              a: 'You only need a Stripe account as a seller. We use Stripe as a secure payment system that allows us to send funds to your bank account',
            },
            {
              q: 'Can I combine shipping?',
              a: 'Yes. Buy multiple items and choose collective shipping to send everything in one parcel.',
            },
            {
              q: 'When do I get paid?',
              a: 'Once a card is sold and funds clear, we trigger a Stripe payout to your connected account.',
            },
          ]}
        />
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-header text-xl">Ready to get started?</h3>
          <p className="opacity-80 text-sm">Submit your first cards now — we’ll handle the rest.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/account/pending" className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90">
            Submit Cards
          </Link>
          <Link to="/marketplace" className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5">
            Explore Marketplace
          </Link>
        </div>
      </section>
    </div>
  )
}

/** Minimal accordion component */
function Accordion({
  items,
}: {
  items: { q: string; a: string }[]
}) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <details
          key={i}
          className="group rounded-2xl bg-white border border-black/5 shadow-soft p-4"
        >
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <span className="font-medium">{it.q}</span>
            <span className="ml-3 inline-flex w-6 h-6 items-center justify-center rounded-full bg-black/5 text-xs">
              +
            </span>
          </summary>
          <div className="mt-3 text-sm opacity-80">{it.a}</div>
        </details>
      ))}
    </div>
  )
}
