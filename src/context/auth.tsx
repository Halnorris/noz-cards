import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type AuthUser = {
  id: string
  email?: string
} | null

type AuthContextValue = {
  user: AuthUser
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // fetch current user on load
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return
      if (error || !data.user) {
        setUser(null)
      } else {
        setUser({ id: data.user.id, email: data.user.email ?? undefined })
      }
      setLoading(false)
    })

    // listen to auth changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      const u = session?.user
      setUser(u ? { id: u.id, email: u.email ?? undefined } : null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
