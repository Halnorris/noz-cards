import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Card = {
  id: string
  title: string
  price: number
  image_url: string
}

export default function Marketplace() {
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    supabase.from('cards').select('*').eq('status', 'live').then(({ data }) => {
      if (data) setCards(data as Card[])
    })
  }, [])

  return (
    <div>
      <h1 className="font-header text-2xl mb-4">Marketplace</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="p-3 bg-white rounded-xl shadow-soft border border-black/5 hover:-translate-y-0.5 hover:shadow-md transition">
            <div className="aspect-[3/4] bg-black/5 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="opacity-50 text-xs">No Image</span>
              )}
            </div>
            <h3 className="text-sm font-medium truncate">{card.title}</h3>
            <p className="text-sm opacity-70">£{card.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

