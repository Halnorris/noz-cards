import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth'
import StripeConnectButton from '@/components/StripeConnectButton'

type Submission = {
  id: string
  reference_number: string
  quantity: number
  email: string
  created_at: string
}

export default function SubmissionConfirmation() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const referenceNumber = searchParams.get('ref')
  
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!referenceNumber || !user) {
      setLoading(false)
      return
    }

    async function loadSubmission() {
      const { data } = await supabase
        .from('submissions')
        .select('id, reference_number, quantity, email, created_at')
        .eq('reference_number', referenceNumber)
        .eq('user_id', user.id)
        .single()

      setSubmission(data)
      setLoading(false)
    }

    loadSubmission()
  }, [referenceNumber, user])

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto space-y-4 py-8">
        <div className="text-center py-8 opacity-70">Loading...</div>
      </section>
    )
  }

  if (!submission) {
    return (
      <section className="max-w-3xl mx-auto space-y-4 py-8">
        <div className="rounded-2xl bg-white p-8 shadow-soft border border-black/5 text-center">
          <h1 className="font-header text-2xl mb-2">Submission Not Found</h1>
          <p className="opacity-70 mb-4">We couldn't find this submission.</p>
          <Link to="/submit-cards" className="text-primary underline">
            Submit new cards
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6 py-8">
      {/* Success header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-header text-3xl mb-2">Submission Received!</h1>
        <p className="text-xl opacity-80">Reference: <strong>{submission.reference_number}</strong></p>
      </div>

      {/* Stripe Connect Reminder */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h3 className="font-header text-sm mb-2">💰 Don't Forget: Connect Stripe for Payouts</h3>
        <p className="text-sm opacity-80 mb-3">
          Before your cards go live, make sure you've connected Stripe so you can receive 85% of each sale directly to your bank.
        </p>
        <StripeConnectButton />
      </div>

      {/* Confirmation details */}
      <div className="rounded-2xl bg-white p-6 shadow-soft border border-black/5 space-y-4">
        <h2 className="font-header text-xl">What Happens Next?</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Check Your Email</p>
              <p className="opacity-70">
                We've sent a confirmation email to <strong>{submission.email}</strong> with our address and further instructions.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Pack Your Cards Safely</p>
              <p className="opacity-70">
                Place your {submission.quantity} card{submission.quantity > 1 ? 's' : ''} in protective sleeves and secure packaging.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Send to Us</p>
              <p className="opacity-70">
                Post your cards to the address in your email, or arrange a weekend collection by emailing{' '}
                <a href="mailto:support@nozcards.com" className="text-primary underline">
                  support@nozcards.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              4
            </div>
            <div>
              <p className="font-medium">We'll Get in Touch</p>
              <p className="opacity-70">
                Once we receive your cards, we'll photograph them and send you pricing suggestions to approve.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important reminders */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <h3 className="font-medium text-blue-900 mb-2">📋 Important Reminders</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep your reference number ({submission.reference_number}) for tracking</li>
          <li>• Cards must be in good condition - damaged cards will be returned</li>
          <li>• Include your reference number inside the package</li>
          <li>• We recommend tracked shipping for valuable cards</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <Link
          to="/account"
          className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90"
        >
          Go to My Account
        </Link>
        <Link
          to="/marketplace"
          className="px-6 py-3 rounded-xl border border-black/10 hover:bg-black/5"
        >
          Browse Marketplace
        </Link>
      </div>

      {/* Contact */}
      <div className="text-center text-sm opacity-70">
        Questions about your submission?{' '}
        <a href="mailto:support@nozcards.com" className="text-primary underline">
          support@nozcards.com
        </a>
      </div>
    </section>
  )
}
