export default function Consignment() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Consignment Policy</h1>
      <p className="text-sm opacity-70">Last updated: 21/09/2025</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-6 text-sm leading-6">
        <section>
          <p>
            Thank you for choosing Noz Cards to sell your football trading cards. This Consignment Policy explains how
            consigning cards with us works and what consignors (“you”, “seller”, or “consignor”) can expect.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">1. How Consignment Works</h2>
          <p className="font-medium mb-1">Submit the Consignment Form</p>
          <p className="mb-2">Fill out our online consignment form with details such as:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>The number of cards you are sending</li>
            <li>Whether you want to set your own prices or have Noz Cards price them for you</li>
            <li>Any special notes about the cards</li>
          </ul>

          <p className="font-medium mb-1">Ship Your Cards to Us</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pack your cards securely and ship them to the address provided after you submit the form.</li>
            <li>You (the consignor) are responsible for all shipping costs.</li>
            <li>Please use tracked shipping — we are not responsible for packages lost in transit.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">2. Receiving &amp; Processing Your Cards</h2>
          <p className="mb-2">Once we receive your cards, our team will:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Inspect each card for authenticity and condition</li>
            <li>Photograph and list approved cards in your Noz Cards account under <em>Pending Cards</em></li>
            <li>Allow you to set prices (if you didn’t request us to do so)</li>
          </ul>
          <p className="mt-2">
            Listing fees and any credits are handled per our{' '}
            <a href="/legal/terms" className="text-primary underline">
              Terms &amp; Conditions
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">3. Condition &amp; Acceptance</h2>
          <p className="mb-2">We reserve the right to reject any cards that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Do not meet our quality standards</li>
            <li>Are counterfeit, altered, or otherwise ineligible for sale</li>
          </ul>
          <p className="mt-2 mb-2">If we reject a card, we will contact you to arrange one of the following:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Return shipment (shipping cost at your expense)</li>
            <li>Disposal or donation of the item (with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">4. Pricing &amp; Listing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You may set your own prices through your account or request that Noz Cards set prices for you.</li>
            <li>Once pricing is confirmed, cards will move to <em>Live Cards</em> and become visible on the marketplace.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">5. Payments &amp; Seller Proceeds</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              When a consigned card sells, we deduct our commission and applicable fees (as stated in our{' '}
              <a href="/legal/terms" className="text-primary underline">
                Terms &amp; Conditions
              </a>
              ) and then process your payout.
            </li>
            <li>Payouts are made via Stripe to your connected account.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">6. Risk &amp; Liability</h2>
          <p className="mb-2">
            While your cards are in our possession, we will take reasonable care to protect them.
          </p>
          <p>
            However, we are not responsible for damage or loss caused by events beyond our control, such as postal delays,
            natural disasters, or third-party carrier issues. For packaging, timelines, and shipment handling, see our{' '}
            <a href="/legal/shipping" className="text-primary underline">
              Shipping Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">7. Contact &amp; Support</h2>
          <p>
            If you have questions or need to arrange a return of rejected cards, contact us at{' '}
            <a href="mailto:support@nozcards.com" className="text-primary underline">
              support@nozcards.com
            </a>
            . You can also reach us via our{' '}
            <a href="/legal/contact" className="text-primary underline">
              Contact page
            </a>
            . For how we handle personal data, see our{' '}
            <a href="/legal/privacy" className="text-primary underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
