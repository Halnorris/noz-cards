import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import App from './App'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import Account from './pages/Account'
import Pending from './pages/Pending'
import Live from './pages/Live'
import Auction from './pages/Auction'
import HowItWorks from '@/pages/HowItWorks'
import CardPage from '@/pages/CardPage'
import BasketPage from '@/pages/Basket'
import NotFound from './pages/NotFound'
import Terms from '@/pages/legal/Terms'
import Privacy from '@/pages/legal/Privacy'
import Cookies from '@/pages/legal/Cookies'
import Shipping from '@/pages/policies/Shipping'
import Returns from '@/pages/policies/Returns'
import Consignment from '@/pages/policies/Consignment'
import Contact from '@/pages/Contact'

// 🧺 Wrap everything with this provider
import { BasketProvider } from '@/context/basket'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'account', element: <Account /> },
      { path: 'account/pending', element: <Pending /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'account/live', element: <Live /> },
      { path: 'auctions/:id', element: <Auction /> },
      { path: 'card/:id', element: <CardPage /> },
      { path: 'basket', element: <BasketPage /> },
      { path: '*', element: <NotFound /> },
      { path: 'legal/terms', element: <Terms /> },
      { path: 'legal/privacy', element: <Privacy /> },
      { path: 'legal/cookies', element: <Cookies /> },
      { path: 'policies/shipping', element: <Shipping /> },
      { path: 'policies/returns', element: <Returns /> },
      { path: 'policies/consignment', element: <Consignment /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ⬇️ This MUST wrap RouterProvider so Header/App/Pages are inside it */}
    <BasketProvider>
      <RouterProvider router={router} />
    </BasketProvider>
  </StrictMode>
)
