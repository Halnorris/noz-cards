import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          <Sidebar />
          <main className="flex-1 py-6">
            <Outlet />
          </main>
        </div>
      </div>
      <footer className="mt-8 p-6 text-sm text-center opacity-70">
        Noz Cards • Built with ❤️ on React + Vite + Supabase + Vercel
      </footer>
    </div>
  )
}
