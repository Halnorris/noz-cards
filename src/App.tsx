import { Outlet, NavLink } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import MiniCartDrawer from '@/components/MiniCartDrawer'

export default function App() {
  const { pathname } = useLocation()

  const showSidebar =
    pathname.startsWith('/account') ||
    pathname.startsWith('/auctions')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop />
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

      <Footer />

      {/* 🔽 Global mini-cart drawer (no launcher button here) */}
      <MiniCartDrawer />
    </div>
  )
}
