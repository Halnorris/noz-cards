export default function Terms() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Terms & Conditions</h1>
      <p className="text-sm opacity-70">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-6 text-sm leading-6">
        <section>
          <h2 className="font-header text-lg mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or using Noz Cards you agree to be bound by these Terms
            & Conditions and any future updates we publish. If you do not agree,
            please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">2. Buying</h2>
          <p>
            All purchases are processed instantly at checkout. A 10% buyer fee
            is added to each order and displayed before payment. You are
            responsible for providing accurate shipping information.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">3. Selling & Consignment</h2>
          <p>
            Sellers consign cards to Noz Cards for listing on our marketplace.
            We photograph and list items and deduct a 15% seller fee from the
            final sale price before payout. Payouts are made via Stripe to the
            seller’s chosen account.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">4. Shipping & Returns</h2>
          <p>
            Buyers can choose collective shipping to combine multiple orders.
            Shipping times and carriers are outlined in our{' '}
            <a href="/legal/shipping" className="text-primary underline">
              Shipping Policy
            </a>
            . Returns are handled according to our{' '}
            <a href="/legal/returns" className="text-primary underline">
              Returns & Refunds Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">5. Prohibited Items</h2>
          <p>
            Noz Cards reserves the right to refuse or remove any listings that
            infringe intellectual property, violate applicable laws, or are
            deemed inappropriate for the marketplace.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">6. Limitation of Liability</h2>
          <p>
            The service is provided “as is” and “as available.” To the fullest
            extent permitted by law, Noz Cards is not liable for any indirect,
            incidental, or consequential damages arising from your use of the
            site.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">7. Privacy & Data</h2>
          <p>
            Your use of Noz Cards is also governed by our{' '}
            <a href="/legal/privacy" className="text-primary underline">
              Privacy Policy
            </a>
            , which explains how we collect and use your information.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">8. Changes to These Terms</h2>
          <p>
            We may update these Terms & Conditions at any time. Continued use of
            the site after changes are posted constitutes acceptance of the
            updated Terms.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">9. Contact</h2>
          <p>
            Questions? Please visit our{' '}
            <a href="/legal/contact" className="text-primary underline">
              Contact page
            </a>{' '}
            for ways to reach us.
          </p>
        </section>
      </div>
    </div>
  )
}
