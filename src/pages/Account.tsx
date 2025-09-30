import { useAuth } from '@/context/auth'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading…</div>
  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft">
        <p className="mb-3">Please sign in to view this page.</p>
        <Link to="/signin" className="px-4 py-2 rounded-xl bg-primary text-white">
          Sign in
        </Link>
      </div>
    )
  }
  return <>{children}</>
}

export default function Account() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)

  // Load current profile data
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (error) console.error(error)
      if (data?.full_name) setFullName(data.full_name)
      setLoading(false)
    })()
  }, [user])

  async function saveProfile() {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)
    if (error) {
      alert(error.message)
    } else {
      alert('Profile updated!')
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="font-header text-2xl">Account Dashboard</h1>

      {/* Profile Box */}
      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-3 max-w-md">
        <div className="text-sm opacity-70">Email</div>
        <div className="text-sm">{user?.email}</div>

        <label className="block text-sm">
          Full Name
          <input
            className="mt-1 w-full rounded-xl border border-black/10 p-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            disabled={loading}
          />
        </label>

        <button
          onClick={saveProfile}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50"
        >
          Save
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Live Cards', count: 12 },
          { label: 'Pending Cards', count: 3 },
          { label: 'Bought Cards', count: 5 },
          { label: 'Store Credit', count: '£0.00' },
        ].map((x) => (
          <div
            key={x.label}
            className="rounded-2xl bg-white p-4 shadow-soft border border-black/5"
          >
            <div className="text-sm opacity-70">{x.label}</div>
            <div className="text-xl font-header">{x.count}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-2xl bg-primary text-white">
          Submit New Cards
        </button>
        <button className="px-4 py-2 rounded-2xl bg-secondary">Add Credit</button>
      </div>
    </section>
  )
}
