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
import CardPage from '@/pages/Card.tsx'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'account', element: <Account /> },
      { path: 'account/pending', element: <Pending /> },
      { path: '/how-it-works', element: <HowItWorks /> },
      { path: 'account/live', element: <Live /> },
      { path: 'auctions/:id', element: <Auction /> },
      { path: '/card/:id', element: <CardPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
