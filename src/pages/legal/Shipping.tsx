export default function Shipping() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Shipping Policy</h1>
      <p className="text-sm opacity-70">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-4 text-sm leading-6">
        <h2 className="font-header text-lg">Collective Shipping</h2>
        <p>Buy multiple items and ship them together to save on costs.</p>
        <h2 className="font-header text-lg">Dispatch Times</h2>
        <p>Orders are typically dispatched within X–Y business days.</p>
        <h2 className="font-header text-lg">Tracking & Insurance</h2>
        <p>Tracked shipping options available; choose insurance at checkout where offered.</p>
        <h2 className="font-header text-lg">International</h2>
        <p>Customs duties & taxes are the buyer’s responsibility where applicable.</p>
      </div>
    </div>
  )
}
