export default function Privacy() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Privacy Policy</h1>
      <p className="text-sm opacity-70">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-4 text-sm leading-6">
        <p>We respect your privacy. This policy explains what data we collect and how we use it.</p>
        <h2 className="font-header text-lg">Data We Collect</h2>
        <p>Account details, orders, payment intent IDs (via Stripe), and site usage analytics.</p>
        <h2 className="font-header text-lg">How We Use Data</h2>
        <p>To operate the marketplace, process payments, prevent fraud, and improve services.</p>
        <h2 className="font-header text-lg">Sharing</h2>
        <p>We share data with service providers (e.g., Stripe, Supabase) as needed to operate.</p>
        <h2 className="font-header text-lg">Your Rights</h2>
        <p>Request access, correction, or deletion where applicable.</p>
      </div>
    </div>
  )
}
