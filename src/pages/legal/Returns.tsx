export default function Returns() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Returns &amp; Refunds Policy</h1>
      <p className="text-sm opacity-70">Last updated: 21/09/2025</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-6 text-sm leading-6">
        <section>
          <p>
            We want you to be happy with every purchase on Noz Cards. Because trading cards are unique
            collectibles, please read this policy carefully before buying or consigning.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">1. General Policy</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All sales on Noz Cards are final.</li>
            <li>
              Returns and refunds are not accepted unless required by law (e.g. defective or misdescribed items).
            </li>
            <li>
              This policy applies to all purchases, whether shipped immediately or stored in your account for later shipping.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">2. Exceptions – When We Will Help</h2>
          <p className="mb-2">We will consider a refund or replacement if:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The card you receive is significantly misdescribed (e.g. wrong card or wrong grading).</li>
            <li>The card is damaged in transit due to packaging issues.</li>
            <li>The order was processed in error (e.g. duplicate charge).</li>
          </ul>
          <p className="mt-2 mb-2">If any of the above happens:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contact us within <strong>7 days</strong> of delivery.</li>
            <li>Provide your order number, a clear description, and photos of the item and packaging.</li>
            <li>We will assess the issue and arrange a solution (refund, replacement, or store credit).</li>
          </ul>
          <p className="mt-2">
            For shipping issues, also see our{' '}
            <a href="/legal/shipping" className="text-primary underline">
              Shipping Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">3. Store Credit</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>In some cases, we may issue a store credit instead of a refund.</li>
            <li>Store credit can be used for future purchases, listing fees, or shipping costs.</li>
            <li>Store credit is non-transferable and non-refundable once issued.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">4. Non-Returnable Situations</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Change of mind or buyer’s remorse.</li>
            <li>Normal wear or slight variations typical of collectible cards.</li>
            <li>Cards damaged after delivery due to improper handling or storage.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">5. Lost or Damaged Shipments</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All shipments are tracked.</li>
            <li>
              If your package appears lost or arrives damaged, contact us within <strong>7 days</strong>.
            </li>
            <li>
              We will help you file a claim with the carrier and work toward a resolution.
            </li>
          </ul>
          <p className="mt-2">
            For dispatch and packaging details, see our{' '}
            <a href="/legal/shipping" className="text-primary underline">
              Shipping Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">6. Refund Method &amp; Timing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              If a refund is approved, it will be processed via the original payment method (or store credit if agreed).
            </li>
            <li>Refunds typically appear within <strong>5–10 business days</strong> after approval.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">7. Contact Us</h2>
          <p>
            For return or refund questions, email us at{' '}
            <a href="mailto:support@nozcards.com" className="text-primary underline">
              support@nozcards.com
            </a>
            . You can also reach us via our{' '}
            <a href="/legal/contact" className="text-primary underline">
              Contact page
            </a>
            . For information on personal data handling, see our{' '}
            <a href="/legal/privacy" className="text-primary underline">
              Privacy Policy
            </a>
            , and for overall site rules, see our{' '}
            <a href="/legal/terms" className="text-primary underline">
              Terms &amp; Conditions
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
