import { useAuth } from '@/context/auth'
import { Link } from 'react-router-dom'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading…</div>
  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft">
        <p className="mb-3">Please sign in to view this page.</p>
        <Link to="/signin" className="px-4 py-2 rounded-xl bg-primary text-white">Sign in</Link>
      </div>
    )
  }
  return <>{children}</>
}
export default function Account() {
  return (
    <section className="space-y-4">
      <h1 className="font-header text-2xl">Account Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Live Cards', count: 12 },
          { label: 'Pending Cards', count: 3 },
          { label: 'Bought Cards', count: 5 },
          { label: 'Store Credit', count: '£0.00' },
        ].map((x) => (
          <div key={x.label} className="rounded-2xl bg-white p-4 shadow-soft border border-black/5">
            <div className="text-sm opacity-70">{x.label}</div>
            <div className="text-xl font-header">{x.count}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-2xl bg-primary text-white">Submit New Cards</button>
        <button className="px-4 py-2 rounded-2xl bg-secondary">Add Credit</button>
      </div>
    </section>
  )
}
