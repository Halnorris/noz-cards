import { NavLink } from 'react-router-dom'

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-xl text-sm transition ${
        isActive ? 'bg-primary text-white' : 'hover:bg-black/5'
      }`
    }
  >
    {label}
  </NavLink>
)

export default function Header() {
  return (
    <header className="h-16 sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-black/10">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 grid place-items-center border border-primary/20">
            <span className="font-header text-primary">NC</span>
          </div>
          <span className="font-header text-lg">Noz Cards</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/" label="Home" />
          <NavItem to="/marketplace" label="Marketplace" />
          <NavItem to="/auctions/123" label="Auctions" />
          <NavItem to="/account" label="Account" />
        </nav>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl border border-black/10 hover:bg-black/5 text-sm">
            Sign In
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-primary text-white hover:opacity-90 text-sm">
            Create Account
          </button>
        </div>
      </div>
    </header>
  )
}

