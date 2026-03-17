import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { useAuth } from '@/context/auth'

export default function Header() {
  const { count, openMiniCart } = useBasket()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const linkBase = 'px-4 py-2 text-sm font-medium transition-all relative'
  const linkInactive = 'text-foreground/70 hover:text-foreground after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all hover:after:w-full'
  const linkActive = 'text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand - Updated Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://rmviffmljrfpskwkznhk.supabase.co/storage/v1/object/public/logos/2.jpg%20small.jpg" 
            alt="Noz Cards" 
            className="h-10 w-10 object-contain"
          />
          <img 
            src="https://rmviffmljrfpskwkznhk.supabase.co/storage/v1/object/public/logos/Black%20and%20White%20Modern%20Streetwear%20Logo.png" 
            alt="Noz Cards - Card Marketplace" 
            className="h-8 object-contain hidden sm:block"
          />
        </Link>
        
        {/* Nav - Underline style */}
        <nav className="flex items-center gap-1">
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
        
        {/* Actions: Sign in/out + Basket button */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => signOut()}
              className="text-sm px-4 py-2 border-b-2 border-transparent hover:border-black transition-all"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/signin"
              className="text-sm px-4 py-2 border-b-2 border-transparent hover:border-black transition-all"
            >
              Sign in
            </Link>
          )}
          
          <button
            onClick={openMiniCart}
            aria-label="Basket"
            className="relative p-2 border border-black hover:bg-black hover:text-white transition-all"
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
              <span className="absolute -top-2 -right-2 text-xs px-2 py-0.5 bg-black text-white font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
