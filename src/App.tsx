import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

export default function App() {
  const { pathname } = useLocation()

  // Show sidebar only on these sections
  const showSidebar =
    pathname.startsWith('/account') ||
    pathname.startsWith('/marketplace') ||
    pathname.startsWith('/auctions')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header (with cart badge now handled inside Header.tsx) */}
      <Header />

      <div className="max-w-7xl mx-auto px-4">
        {showSidebar ? (
          <div className="flex gap-6">
            <Sidebar />
            <main className="flex-1 py-6">
              <Outlet />
            </main>
          </div>
        ) : (
          <main className="py-6">
            <Outlet />
          </main>
        )}
      </div>

      <footer className="mt-8 p-6 text-sm text-center opacity-70">
        Noz Cards • Built with ❤️ on React + Vite + Supabase + Vercel
      </footer>
    </div>
  )
}
