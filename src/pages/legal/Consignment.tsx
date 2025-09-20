export default function Consignment() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Consignment Policy</h1>
      <p className="text-sm opacity-70">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-4 text-sm leading-6">
        <h2 className="font-header text-lg">Overview</h2>
        <p>We list and sell on your behalf. Seller fee is 15%, deducted at payout.</p>
        <h2 className="font-header text-lg">Submission</h2>
        <p>Provide accurate card details; we may adjust titles for clarity and search.</p>
        <h2 className="font-header text-lg">Pricing</h2>
        <p>Set your price or ask us to recommend based on comps; you can request adjustments.</p>
        <h2 className="font-header text-lg">Payouts</h2>
        <p>Payouts via Stripe to your connected account after funds clear.</p>
      </div>
    </div>
  )
}
