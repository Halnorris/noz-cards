export default function Shipping() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Shipping Policy</h1>
      <p className="text-sm opacity-70">Last updated: 21/09/2025</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-6 text-sm leading-6">
        <section>
          <p>
            Thank you for buying and consigning with Noz Cards. This Shipping Policy explains how
            shipping works for cards purchased through our marketplace.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">1. Shipping Overview</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Buyer-controlled shipping:</strong> When you purchase cards on Noz Cards,
              they are stored securely in your account until you request shipment.
            </li>
            <li>
              <strong>Tracked shipping only:</strong> Every shipment is sent with a tracking number
              for your peace of mind.
            </li>
            <li>
              <strong>Calculated shipping rates:</strong> Shipping costs are calculated based on the
              weight and number of cards in your requested shipment.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">2. Requesting Shipping</h2>
          <p className="mb-2">
            At any time, you can request that some or all of your purchased cards be shipped to you.
          </p>
          <p className="mb-2">
            Simply visit <em>My Cards → Request Shipping</em> in your account.
          </p>
          <p>
            We will pack and dispatch your cards within <strong>2–5 business days</strong> of
            receiving your shipping request and payment.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">3. Shipping Costs</h2>
          <p className="mb-2">The cost of shipping depends on:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The total weight of the cards in your shipment</li>
            <li>The number of cards or packages requested</li>
            <li>Your shipping destination</li>
          </ul>
          <p className="mt-2">
            Shipping fees will be clearly displayed at checkout before you confirm your request.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">4. Tracking &amp; Notifications</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Every package includes tracked shipping.</li>
            <li>
              Once shipped, you will receive a tracking number via email and inside your account
              dashboard.
            </li>
            <li>You can monitor delivery progress using the carrier’s tracking link.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">5. Delivery Times</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Delivery times vary depending on your location and the shipping method chosen.
            </li>
            <li>Estimated delivery times will be shown at checkout.</li>
            <li>
              Please note that external factors (e.g. weather, customs) can occasionally delay
              deliveries.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">6. Packaging &amp; Handling</h2>
          <p className="mb-2">
            All cards are packed securely to prevent damage during transit.
          </p>
          <p>
            Handling time is typically <strong>1–2 business days</strong>, unless otherwise stated.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">7. Shipping Address</h2>
          <p>
            It is your responsibility to provide a correct and complete shipping address in your
            account. We are not responsible for delays or losses caused by incorrect or incomplete
            addresses.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">8. International Shipping</h2>
          <p className="mb-2">
            We currently ship to the United Kingdom and select international destinations.
          </p>
          <p>
            International buyers are responsible for any customs duties, taxes, or import fees that
            may apply.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">9. Lost or Damaged Shipments</h2>
          <p className="mb-2">All shipments are tracked.</p>
          <p>
            If your package is lost or arrives damaged, please contact us within{' '}
            <strong>7 days</strong> of the expected delivery date. We will assist with carrier
            claims and help resolve the issue. For general return rules, see our{' '}
            <a href="/legal/returns" className="text-primary underline">
              Returns &amp; Refunds Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">10. Contact Us</h2>
          <p>
            For questions about shipping or to report an issue, contact us at:{' '}
            <a href="mailto:support@nozcards.com" className="text-primary underline">
              support@nozcards.com
            </a>
            . You can also reach us via our{' '}
            <a href="/legal/contact" className="text-primary underline">
              Contact page
            </a>
            . For how we handle your personal data, see our{' '}
            <a href="/legal/privacy" className="text-primary underline">
              Privacy Policy
            </a>
            . For site rules, see our{' '}
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
