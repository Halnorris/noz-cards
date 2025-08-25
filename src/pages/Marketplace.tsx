import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Marketplace() {
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    supabase.from('cards').select('*').then(({ data }) => {
      if (data) setCards(data)
    })
  }, [])

  return (
    <div>
      <h1 className="font-header text-2xl mb-4">Marketplace</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="p-3 bg-white rounded-xl shadow-soft border border-black/5">
            <div className="aspect-[3/4] bg-black/5 rounded-lg mb-2" />
            <h3 className="text-sm font-medium">{card.title}</h3>
            <p className="text-sm opacity-70">£{card.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
