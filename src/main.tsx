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
import BasketPage from '@/pages/Basket' // ✅ fixed here
import NotFound from './pages/NotFound'
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
      { path: 'how-it-works', element: <HowItWorks /> }, // ✅ dropped the extra slash
      { path: 'account/live', element: <Live /> },
      { path: 'auctions/:id', element: <Auction /> },
      { path: 'card/:id', element: <CardPage /> },
      { path: 'basket', element: <BasketPage /> },// ✅ fixed here
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
