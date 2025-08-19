import { NavLink } from 'react-router-dom'

const Item = ({ to, label, count }: { to: string; label: string; count?: number }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white transition ${
        isActive ? 'bg-white text-primary shadow-soft' : 'text-foreground/80'
      }`
    }
  >
    <span>{label}</span>
    {typeof count === 'number' && (
      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/30 border border-secondary/60">{count}</span>
    )}
  </NavLink>
)

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 py-6">
      <div className="sticky top-20 space-y-2">
        <h2 className="text-sm uppercase tracking-wide opacity-70 mb-2">Account</h2>
        <Item to="/account" label="Dashboard" />
        <Item to="/account/pending" label="Pending Cards" count={3} />
        <Item to="/account/live" label="Live Cards" count={12} />
        <div className="h-px bg-black/10 my-2" />
        <h2 className="text-sm uppercase tracking-wide opacity-70 mb-2">Explore</h2>
        <Item to="/marketplace" label="Marketplace" />
        <Item to="/auctions/123" label="Sample Auction" />
      </div>
    </aside>
  )
}
