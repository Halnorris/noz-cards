export default function Privacy() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Privacy Policy</h1>
      <p className="text-sm opacity-70">Last updated: 21/09/2025</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-6 text-sm leading-6">
        <section>
          <p>
            Your privacy matters to us. This Privacy Policy explains how Noz Cards (“we”, “our”, or “us”)
            collects, uses, stores, and protects your personal information when you visit or use our website and
            services (the “Site”). By using Noz Cards, you consent to this policy.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">1. Information We Collect</h2>
          <p className="mb-2 font-medium">a. Information you provide directly</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Name, email address, and contact details</li>
            <li>Account login details (username, password)</li>
            <li>Billing and shipping addresses</li>
            <li>Payment details (handled securely by our payment processor—see Section 3)</li>
            <li>Card submission details (e.g. card descriptions, prices)</li>
          </ul>

          <p className="mt-4 mb-2 font-medium">b. Information we collect automatically</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address, browser type, device information</li>
            <li>Usage data (pages visited, time spent, referral source)</li>
            <li>
              Cookies and similar tracking technologies (see our{' '}
              <a href="/legal/cookies" className="text-primary underline">
                Cookies Policy
              </a>
              )
            </li>
          </ul>

          <p className="mt-4 mb-2 font-medium">c. Information from third parties</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Payment confirmation from our payment provider</li>
            <li>Authentication or login details if you sign in using a third-party service (e.g. Supabase Auth)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create and manage your Noz Cards account</li>
            <li>Process purchases, consignments, and payments</li>
            <li>Provide customer service and respond to inquiries</li>
            <li>Send essential transactional emails (order updates, password resets)</li>
            <li>Improve and personalise our Site and services</li>
            <li>Comply with legal obligations (tax, fraud prevention, record keeping)</li>
          </ul>
          <p className="mt-2">We will never sell your personal data.</p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">3. Payments</h2>
          <p>
            Payments are securely processed by our third-party payment providers (e.g. Stripe). We do not store your
            full payment card details. Our payment partners handle this information according to their own privacy
            policies.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">4. How We Share Your Data</h2>
          <p className="mb-2">We only share personal information when necessary to operate our services:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Service providers:</strong> trusted partners such as hosting (Vercel), database/authentication
              (Supabase), and payment processors.
            </li>
            <li>
              <strong>Legal compliance:</strong> if required to comply with applicable law, regulation, or legal process.
            </li>
            <li>
              <strong>Business transfers:</strong> in the event of a sale, merger, or acquisition of our business.
            </li>
          </ul>
          <p className="mt-2">We require all service providers to protect your data and use it only as instructed.</p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">5. Data Retention</h2>
          <p>
            We keep your personal data only as long as necessary for the purposes stated in this policy (for example, to
            fulfil orders or meet legal obligations). You may request deletion of your account at any time (see Section 7).
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">6. Cookies &amp; Tracking</h2>
          <p>
            We use cookies and similar technologies to keep you signed in, remember your preferences, and analyse traffic.
            You can disable cookies in your browser settings, but some features of Noz Cards may not work properly.
            See our{' '}
            <a href="/legal/cookies" className="text-primary underline">
              Cookies Policy
            </a>{' '}
            for more details.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">7. Your Privacy Rights</h2>
          <p className="mb-2">
            Depending on where you live (e.g. UK, EU, or certain U.S. states), you may have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access, correct, or delete your personal data</li>
            <li>Request a copy of your data in portable format</li>
            <li>Object to or restrict certain processing</li>
            <li>Withdraw consent (e.g. for marketing emails)</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, email us at{' '}
            <a href="mailto:support@nozcards.com" className="text-primary underline">
              support@nozcards.com
            </a>
            . We will respond within the time required by law.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">8. Security</h2>
          <p>
            We use reasonable administrative, technical, and physical safeguards to protect your personal data.
            However, no system is 100% secure. You share information with us at your own risk.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">9. Children’s Privacy</h2>
          <p>
            Noz Cards is not intended for children under 13 years of age (or the relevant minimum age in your country).
            We do not knowingly collect personal data from children.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">10. International Data Transfers</h2>
          <p>
            If you access Noz Cards from outside the UK, your data may be transferred and stored in a country with different
            data protection laws. We take steps to ensure appropriate safeguards are in place.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Significant changes will be posted on this page or emailed
            to you. Continued use of Noz Cards means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">12. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or our data practices, contact us at:{' '}
            <a href="mailto:support@nozcards.com" className="text-primary underline">
              support@nozcards.com
            </a>{' '}
            or via our{' '}
            <a href="/legal/contact" className="text-primary underline">
              Contact page
            </a>
            .
          </p>
        </section>

        <section>
          <p>
            Please also review our{' '}
            <a href="/legal/terms" className="text-primary underline">
              Terms &amp; Conditions
            </a>{' '}
            for more information on your relationship with Noz Cards.
          </p>
        </section>
      </div>
    </div>
  )
}
