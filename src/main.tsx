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
import Shipping from '@/pages/legal/Shipping'
import Returns from '@/pages/legal/Returns'
import Consignment from '@/pages/legal/Consignment'
import Contact from '@/pages/legal/Contact'
import SignIn from '@/pages/SignIn'
import Checkout from '@/pages/Checkout'

// Providers
import { BasketProvider } from '@/context/basket'
import { AuthProvider } from '@/context/auth'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'account', element: <Account /> },
      { path: 'account/pending', element: <Pending /> },
      { path: 'account/live', element: <Live /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'auctions/:id', element: <Auction /> },
      { path: 'card/:id', element: <CardPage /> },
      { path: 'basket', element: <BasketPage /> },
      { path: 'legal/terms', element: <Terms /> },
      { path: 'legal/privacy', element: <Privacy /> },
      { path: 'legal/cookies', element: <Cookies /> },
      { path: 'legal/shipping', element: <Shipping /> },
      { path: 'legal/returns', element: <Returns /> },
      { path: 'legal/consignment', element: <Consignment /> },
      { path: 'legal/contact', element: <Contact /> },
      { path: 'signin', element: <SignIn /> },
      { path: '*', element: <NotFound /> },
      { path: 'checkout', element: <Checkout /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BasketProvider>
        <RouterProvider router={router} />
      </BasketProvider>
    </AuthProvider>
  </StrictMode>
)
