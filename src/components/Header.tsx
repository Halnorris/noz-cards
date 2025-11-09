import { NavLink, Link } from 'react-router-dom'
import MiniCartDrawer from '@/components/MiniCartDrawer'   // ⬅️ add this
import { useBasket } from '@/context/basket'

export default function Header() {
  // You can keep this if you want the count elsewhere later, but MiniCart shows its own badge
  const { count } = useBasket()

  const linkBase = 'px-3 py-1 rounded-full text-sm transition'
  const linkInactive = 'hover:bg-black/5'
  const linkActive = 'bg-primary text-white'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-grid place-items-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
            NC
          </span>
          <span className="font-header text-xl">Noz Cards</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/marketplace"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Marketplace
          </NavLink>

          <NavLink
            to="/account"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Account
          </NavLink>
        </nav>

        {/* Actions: Sign in + Mini-cart drawer */}
        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="text-sm px-3 py-1 rounded-full hover:bg-black/5"
          >
            Sign in
          </Link>

          {/* 🛒 Replaces the old /basket icon link */}
          <MiniCartDrawer />
        </div>
      </div>
    </header>
  )
}
