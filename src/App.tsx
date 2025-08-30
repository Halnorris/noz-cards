import { Outlet, useLocation, NavLink, Link } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { useBasket } from '@/context/basket'

export default function App() {
  const { pathname } = useLocation()
  const { count } = useBasket()

  // Show sidebar only on these sections
  const showSidebar =
    pathname.startsWith('/account') ||
    pathname.startsWith('/marketplace') ||
    pathname.startsWith('/auctions')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER with cart badge */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-header text-xl">Noz Cards</Link>

          <nav className="flex items-center gap-4">
            <NavLink to="/" end className={({isActive}) => isActive ? 'underline' : 'hover:underline'}>
              Home
            </NavLink>
            <NavLink to="/marketplace" className={({isActive}) => isActive ? 'underline' : 'hover:underline'}>
              Marketplace
            </NavLink>
            <NavLink to="/how-it-works" className={({isActive}) => isActive ? 'underline' : 'hover:underline'}>
              How it Works
            </NavLink>
            <NavLink to="/account" className={({isActive}) => isActive ? 'underline' : 'hover:underline'}>
              Account
            </NavLink>

            {/* Basket icon + live count */}
            <Link to="/basket" aria-label="Basket" className="relative ml-2 p-2 rounded-lg border border-black/10 hover:bg-black/5">
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current" fill="none" strokeWidth="2">
                <path d="M6 6h15l-1.5 9H7.5L6 6Z" />
                <path d="M6 6H3" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT with optional sidebar */}
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
