export default function Cookies() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Cookie Policy</h1>
      <p className="text-sm opacity-70">Last updated: 21/09/2025</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-6 text-sm leading-6">
        <section>
          <p>
            This Cookie Policy explains how Noz Cards (“we”, “our”, or “us”) uses cookies and similar technologies on our
            website (the “Site”). By continuing to browse or use our Site, you agree that we can store and access cookies
            as described in this policy.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your computer, tablet, or phone when you visit a website.
            They help websites work properly, remember your preferences, and improve your browsing experience.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">2. How We Use Cookies</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Essential site operations</strong> – Keep you logged in, remember your shopping basket, and ensure key features work.</li>
            <li><strong>Performance and analytics</strong> – Understand how people use Noz Cards so we can improve the site (e.g. which pages are popular).</li>
            <li><strong>Preferences</strong> – Remember your settings, such as currency or display options.</li>
            <li><strong>Marketing (optional)</strong> – If enabled, show you relevant offers or ads and measure their effectiveness.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">3. Types of Cookies We Set</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-black/5">
              <thead className="bg-black/5">
                <tr>
                  <th className="p-2 font-medium">Cookie Type</th>
                  <th className="p-2 font-medium">Purpose</th>
                  <th className="p-2 font-medium">Examples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr>
                  <td className="p-2">Strictly necessary</td>
                  <td className="p-2">Required for the website to function.</td>
                  <td className="p-2">Session cookies, login authentication</td>
                </tr>
                <tr>
                  <td className="p-2">Performance/analytics</td>
                  <td className="p-2">Help us analyse how users interact with our site.</td>
                  <td className="p-2">Google Analytics or similar tools</td>
                </tr>
                <tr>
                  <td className="p-2">Functionality</td>
                  <td className="p-2">Remember your preferences.</td>
                  <td className="p-2">Language, currency, display settings</td>
                </tr>
                <tr>
                  <td className="p-2">Advertising/targeting</td>
                  <td className="p-2">Provide personalised ads (only if marketing cookies are used).</td>
                  <td className="p-2">Remarketing tags</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">4. Third-Party Cookies</h2>
          <p>
            Some cookies are set by third-party services that we use, such as:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Supabase (for authentication and database hosting)</li>
            <li>Vercel (site hosting)</li>
            <li>Payment providers (e.g. Stripe)</li>
            <li>Analytics tools (e.g. Google Analytics, if enabled)</li>
          </ul>
          <p>These third parties have their own privacy and cookie policies.</p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">5. Managing or Disabling Cookies</h2>
          <p className="mb-2">You can manage cookies in several ways:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies.</li>
            <li><strong>Opt-out links:</strong> If we use analytics or advertising cookies, you can opt out via their specific settings (e.g. Google Analytics opt-out).</li>
            <li><strong>Cookie banner:</strong> When you first visit Noz Cards, you may see a banner giving you choices for accepting or rejecting non-essential cookies.</li>
          </ul>
          <p className="mt-2">Please note that disabling essential cookies may cause parts of the site to stop working properly.</p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">6. Legal Basis for Cookies</h2>
          <p>
            Where required by law (e.g. GDPR/UK GDPR), we will ask for your consent before placing non-essential cookies on
            your device. Essential cookies are used on the basis of our legitimate interest in providing a secure and
            functional website.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">7. Changes to This Cookie Policy</h2>
          <p>
            We may update this policy to reflect changes in technology, law, or our practices. Any changes will be posted
            here with an updated “Last updated” date.
          </p>
        </section>

        <section>
          <h2 className="font-header text-lg mb-2">8. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, contact us at:{' '}
            <a href="mailto:support@nozcards.com" className="text-primary underline">
              support@nozcards.com
            </a>{' '}
            or via our{' '}
            <a href="/legal/contact" className="text-primary underline">
              Contact page
            </a>
            . For details on how we handle personal data, see our{' '}
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

