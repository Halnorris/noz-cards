import { NavLink, Link } from 'react-router-dom'
import { useBasket } from '@/context/basket'

export default function Header() {
  const { count } = useBasket()

  const linkBase =
    'px-3 py-1 rounded-full text-sm transition'
  const linkInactive =
    'hover:bg-black/5'
  const linkActive =
    'bg-primary text-white'

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
            to="/auctions"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            Auctions
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

        {/* Actions: Sign in + Basket */}
        <div className="flex items-center gap-3">
          <Link
            to="/account"
            className="text-sm px-3 py-1 rounded-full hover:bg-black/5"
          >
            Sign in
          </Link>

          <Link
            to="/basket"
            aria-label="Basket"
            className="relative p-2 rounded-lg border border-black/10 hover:bg-black/5"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-current"
              fill="none"
              strokeWidth="2"
            >
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
        </div>
      </div>
    </header>
  )
}
