export default function HowItWorks() {
  return (
    <div className="space-y-10">
      <h1 className="font-header text-3xl">How It Works</h1>

      <section className="space-y-4">
        <h2 className="font-header text-xl">1. Submit Your Cards</h2>
        <p className="opacity-80">
          Use our simple submission form to tell us which cards you want to consign. 
          You’ll then send us the cards in one shipment — no upfront costs at all. 
          When we receive them, we professionally scan and prepare them for sale.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-header text-xl">2. Go Live</h2>
        <p className="opacity-80">
          Once scanned, your cards appear on the marketplace. You choose whether 
          to set a fixed price or run an auction. Auctions require buyers to verify 
          their ID (KYC), which prevents ghost bidding and protects sellers.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-header text-xl">3. Buyers Pay Instantly</h2>
        <p className="opacity-80">
          When a buyer checks out, they pay immediately. The checkout includes a 10% 
          buyer fee which is added on top of their price. This is shown before they confirm.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-header text-xl">4. You Get Paid</h2>
        <p className="opacity-80">
          We take a 15% seller fee and send the rest straight to you via Stripe Connect. 
          No waiting, no messing around with store credit. You get your balance quickly and securely.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-header text-xl">Why It Works Better</h2>
        <ul className="list-disc pl-5 space-y-1 opacity-80">
          <li>No upfront cost to consign</li>
          <li>Instant payouts via Stripe</li>
          <li>ID verification keeps auctions legit</li>
          <li>One shipment for your whole collection</li>
        </ul>
      </section>
    </div>
  )
}
