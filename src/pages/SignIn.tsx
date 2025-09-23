import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    // already signed in
    navigate('/account')
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setLoading(false)
    if (!error) setSent(true)
    else alert(error.message)
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="font-header text-2xl">Sign in</h1>
      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-4 text-sm">
        {sent ? (
          <p>We’ve sent a sign-in link to <strong>{email}</strong>. Check your inbox.</p>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-3">
            <label className="block text-sm">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/10 p-2"
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
