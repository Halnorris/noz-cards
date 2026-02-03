import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth'
import StripeConnectButton from '@/components/StripeConnectButton'

export default function SubmitCards() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    quantity: '',
    cardDescription: '',
    acceptsTerms: false,
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin')
      return
    }

    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user, authLoading, navigate])

  const generateReferenceNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `NOZ-${date}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.phone || !formData.quantity) {
      setError('Please fill in all required fields')
      return
    }

    if (!formData.acceptsTerms) {
      setError('You must accept the terms and conditions')
      return
    }

    const quantity = parseInt(formData.quantity)
    if (isNaN(quantity) || quantity < 1) {
      setError('Please enter a valid quantity (minimum 1)')
      return
    }

    if (!user) {
      setError('You must be logged in to submit cards')
      return
    }

    setSubmitting(true)

    try {
      const referenceNumber = generateReferenceNumber()

      const { data, error: insertError } = await supabase
        .from('submissions')
        .insert({
          reference_number: referenceNumber,
          user_id: user.id,
          email: formData.email,
          phone: formData.phone,
          quantity: quantity,
          card_description: formData.cardDescription || null,
          accepts_terms: formData.acceptsTerms,
          status: 'submitted',
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating submission:', insertError)
        setError('Failed to submit. Please try again.')
        setSubmitting(false)
        return
      }

      if (!data) {
        console.error('No data returned from insert')
        setError('Submission created but could not retrieve details.')
        setSubmitting(false)
        return
      }

      console.log('✅ Submission created:', data.reference_number)
      
      // Send confirmation email
      try {
        await fetch('/api/send-submission-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: formData.email,
            referenceNumber: referenceNumber,
            quantity: quantity,
            cardDescription: formData.cardDescription || null,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't show error to user - submission still succeeded
      }
      
      navigate(`/submission-confirmation?ref=${referenceNumber}`)
      
    } catch (err) {
      console.error('Submission error:', err)
      setError('An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (authLoading) {
    return (
      <section className="max-w-3xl mx-auto space-y-4 py-8">
        <h1 className="font-header text-2xl">Submit Cards</h1>
        <div className="text-center py-8 opacity-70">Loading...</div>
      </section>
    )
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="font-header text-3xl mb-2">Submit Cards for Consignment</h1>
        <p className="opacity-80">
          Send us your cards and we'll handle everything else — from professional photography to listing and sales.
        </p>
      </div>

      {/* Stripe Connect Section */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h3 className="font-header text-sm mb-2">💰 Get Paid for Your Cards</h3>
        <p className="text-sm opacity-80 mb-3">
          Connect Stripe to receive 85% of your card sales directly to your bank account.
        </p>
        <StripeConnectButton />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5">
        <h2 className="font-header text-xl mb-3">How It Works</h2>
        <ol className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="font-bold text-primary">1.</span>
            <span>Connect your Stripe account (one-time, ~5 mins)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">2.</span>
            <span>Complete this form with your card details</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">3.</span>
            <span>We'll send you a confirmation email with our address</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">4.</span>
            <span>Send your cards to us (or arrange weekend collection)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">5.</span>
            <span>We photograph, list, and approve prices with you</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">6.</span>
            <span>Your cards go live and you get paid automatically when they sell! (85% to you)</span>
          </li>
        </ol>
      </div>

      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
        <h3 className="font-medium text-yellow-900 mb-2">⚠️ Important</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Cards must be in good condition (no damage, bends, or creases)</li>
          <li>• Damaged cards will be returned to you at your expense</li>
          <li>• For weekend collection, email support@nozcards.com after submitting</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 space-y-6">
        <h2 className="font-header text-xl">Submission Details</h2>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl"
            placeholder="your.email@example.com"
          />
          <p className="text-xs opacity-60 mt-1">We'll send your confirmation here</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl"
            placeholder="07123 456789"
          />
          <p className="text-xs opacity-60 mt-1">In case we need to contact you</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Cards <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl"
            placeholder="e.g. 15"
          />
          <p className="text-xs opacity-60 mt-1">How many cards are you submitting?</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Card Description (Optional)
          </label>
          <textarea
            value={formData.cardDescription}
            onChange={(e) => handleChange('cardDescription', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl min-h-[100px]"
            placeholder="e.g., 10x Haaland rookies, 5x Mbappe Topps Chrome, 3x Bellingham RCs..."
          />
          <p className="text-xs opacity-60 mt-1">Help us prepare for your cards</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptsTerms}
              onChange={(e) => handleChange('acceptsTerms', e.target.checked)}
              className="mt-1"
              required
            />
            <span className="text-sm">
              I accept the{' '}
              <Link to="/legal/terms" target="_blank" className="text-primary underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link to="/legal/consignment" target="_blank" className="text-primary underline">
                Consignment Policy
              </Link>
              {' '}<span className="text-red-600">*</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.acceptsTerms}
          className="w-full px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Submitting...' : 'Submit Cards for Consignment'}
        </button>
      </form>

      <div className="text-center text-sm opacity-70">
        Questions? Email us at{' '}
        <a href="mailto:support@nozcards.com" className="text-primary underline">
          support@nozcards.com
        </a>
      </div>
    </section>
  )
}
