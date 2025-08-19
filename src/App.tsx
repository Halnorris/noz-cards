import { Outlet, NavLink } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <footer className="p-6 text-sm text-center opacity-70">
        Noz Cards • Built with ❤️ on React + Vite + Supabase + Vercel
      </footer>
    </div>
  )
}
