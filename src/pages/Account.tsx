import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Account() {
  const [liveCount, setLiveCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [soldCount, setSoldCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCardCounts() {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('No user logged in')
          setLoading(false)
          return
        }

        // Count live cards
        const { count: live } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('owner_user_id', user.id)
          .eq('status', 'live')

        // Count pending cards
        const { count: pending } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('owner_user_id', user.id)
          .eq('status', 'pending')

        // Count sold cards
        const { count: sold } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('owner_user_id', user.id)
          .eq('status', 'sold')

        setLiveCount(live || 0)
        setPendingCount(pending || 0)
        setSoldCount(sold || 0)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching card counts:', error)
        setLoading(false)
      }
    }

    fetchCardCounts()
  }, [])

  if (loading) {
    return (
      <section className="space-y-4">
        <h1 className="font-header text-2xl">Account Dashboard</h1>
        <div className="text-center py-8 opacity-70">Loading your cards...</div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h1 className="font-header text-2xl">Account Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Live Cards', count: liveCount },
          { label: 'Pending Cards', count: pendingCount },
          { label: 'Bought Cards', count: soldCount },
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
