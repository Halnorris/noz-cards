import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBasket } from '@/context/basket'
import { useAuth } from '@/context/auth'
import { supabase } from '@/lib/supabase'

export default function Checkout() {
  const { items, total, clearBasket } = useBasket()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/signin')
      return
    }
    if (items.length === 0) {
      navigate('/marketplace')
    }
  }, [user, items, navigate])

  const handleCheckout = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          status: 'pending',
          shipping_method: 'standard',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        card_id: item.id,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Call Stripe checkout (we'll create this API endpoint next)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
          }
