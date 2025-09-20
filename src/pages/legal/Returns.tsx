export default function Returns() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Returns & Refunds</h1>
      <p className="text-sm opacity-70">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-4 text-sm leading-6">
        <p>We want you to be happy. If there’s an issue, contact us within X days of delivery.</p>
        <h2 className="font-header text-lg">Eligibility</h2>
        <p>Items must be returned in the same condition; sealed slabs must remain sealed.</p>
        <h2 className="font-header text-lg">Process</h2>
        <p>Contact support with your order number; we’ll provide the return address and steps.</p>
        <h2 className="font-header text-lg">Refunds</h2>
        <p>Once inspected, refunds are issued to the original payment method (minus shipping).</p>
      </div>
    </div>
  )
}
