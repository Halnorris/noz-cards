import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="h-16 bg-white/70 backdrop-blur sticky top-0 z-40 shadow-soft border-b border-black/5">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 grid place-items-center border border-primary/20">
            <span className="font-header text-primary">NC</span>
          </div>
          <span className="font-header text-lg">Noz Cards</span>
        </div>

        <nav className="flex items-center gap-6">
          <NavLink to="/" className={({isActive}) => isActive ? 'text-primary font-medium' : 'opacity-80 hover:opacity-100'}>Home</NavLink>
          <NavLink to="/marketplace" className={({isActive}) => isActive ? 'text-primary font-medium' : 'opacity-80 hover:opacity-100'}>Marketplace</NavLink>
          <NavLink to="/account" className={({isActive}) => isActive ? 'text-primary font-medium' : 'opacity-80 hover:opacity-100'}>Account</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 rounded-2xl bg-primary text-white hover:opacity-90 text-sm">
            Sign In
          </button>
        </div>
      </div>
    </header>
  )
}
