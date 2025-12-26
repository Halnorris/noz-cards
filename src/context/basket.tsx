import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type BasketItem = {
  id: string
  title: string | null
  price: number | null
  image_url: string | null
  qty: number
}

type BasketCtx = {
  items: BasketItem[]
  count: number
  addItem: (item: Omit<BasketItem, 'qty'>, qty?: number) => void
  removeItem: (id: string) => void
  clear: () => void
  openMiniCart: () => void
  closeMiniCart: () => void
  miniCartOpen: boolean
}

const BasketContext = createContext<BasketCtx | undefined>(undefined)

const STORAGE_KEY = 'noz_basket_v1'

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([])
  const [miniCartOpen, setMiniCartOpen] = useState(false)

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = (item: Omit<BasketItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id)
      // If item already exists, don't add it again (can't have 2 of the same card)
      if (idx !== -1) {
        return prev
      }
      // Always add with qty=1 since cards are unique
      return [...prev, { ...item, qty: 1 }]
    })
    // Auto-open mini cart when item is added
    setMiniCartOpen(true)
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id))

  const clear = () => setItems([])

  const openMiniCart = () => setMiniCartOpen(true)
  const closeMiniCart = () => setMiniCartOpen(false)

  const count = useMemo(() => items.length, [items])

  const value = useMemo(
    () => ({ 
      items, 
      count, 
      addItem, 
      removeItem, 
      clear, 
      openMiniCart, 
      closeMiniCart, 
      miniCartOpen 
    }),
    [items, count, miniCartOpen]
  )

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

export function useBasket() {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasket must be used inside <BasketProvider>')
  return ctx
}
