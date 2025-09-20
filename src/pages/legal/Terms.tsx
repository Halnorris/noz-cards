export default function Terms() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Terms & Conditions</h1>
      <p className="text-sm opacity-70">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-4 text-sm leading-6">
        <p>Welcome to Noz Cards. These Terms govern your use of our website and services...</p>
        <h2 className="font-header text-lg">1. Using Noz Cards</h2>
        <p>By accessing or using the site, you agree to these Terms...</p>
        <h2 className="font-header text-lg">2. Buying</h2>
        <p>All purchases include a 10% buyer fee shown at checkout...</p>
        <h2 className="font-header text-lg">3. Selling & Consignment</h2>
        <p>Seller fee is 15%, deducted from sale proceeds before payout via Stripe...</p>
        <h2 className="font-header text-lg">4. Prohibited Items</h2>
        <p>We reserve the right to refuse listings that violate our policies or laws...</p>
        <h2 className="font-header text-lg">5. Liability</h2>
        <p>Service provided as-is, to the extent permitted by law...</p>
      </div>
    </div>
  )
}
