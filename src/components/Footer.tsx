import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        {/* Brand blurb */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-grid place-items-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
              NC
            </span>
            <span className="font-header text-lg">Noz Cards</span>
          </div>
          <p className="text-sm opacity-80">
            Buy, sell & consign football cards. Simple checkout, secure payouts.
          </p>
        </div>

        {/* Company */}
        <div>
          <div className="font-header mb-2">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/how-it-works" className="hover:underline">How it Works</Link></li>
            <li><Link to="/marketplace" className="hover:underline">Marketplace</Link></li>
            <li><Link to="/submit-cards" className="hover:underline">Submit Cards</Link></li>
            <li><Link to="/legal/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <div className="font-header mb-2">Policies</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/legal/terms" className="hover:underline">Terms & Conditions</Link></li>
            <li><Link to="/legal/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/legal/cookies" className="hover:underline">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Shipping & Consignment */}
        <div>
          <div className="font-header mb-2">Selling & Shipping</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/legal/shipping" className="hover:underline">Shipping Policy</Link></li>
            <li><Link to="/legal/returns" className="hover:underline">Returns & Refunds</Link></li>
            <li><Link to="/legal/consignment" className="hover:underline">Consignment Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs opacity-70 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Noz Cards. All rights reserved.</span>
          <span>Built on React · Vite · Supabase · Vercel</span>
        </div>
      </div>
    </footer>
  )
}
