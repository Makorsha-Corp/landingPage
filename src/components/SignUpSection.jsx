import { useRef, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import Button from './ui/Button'
import SectionEyebrow from './SectionEyebrow'
import {
  getDevBypassTurnstileToken,
  getTurnstileSiteKey,
  submitWaitlistSignup,
} from '../lib/waitlistApi'

const inputCls =
  'w-full rounded-xl border border-border bg-background/90 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'

export default function SignUpSection({ source = 'waitlist_section' }) {
  const turnstileSiteKey = getTurnstileSiteKey()
  const turnstileRef = useRef(null)
  const honeypotRef = useRef(null)

  const [email, setEmail] = useState('')
  const [wantsUpdates, setWantsUpdates] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(getDevBypassTurnstileToken())
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const canSubmit =
    status !== 'submitting' &&
    email.trim().length > 0 &&
    (turnstileToken || !turnstileSiteKey)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const token = turnstileToken || getDevBypassTurnstileToken()
      if (!token) {
        throw new Error('Please complete verification and try again.')
      }

      await submitWaitlistSignup({
        email: email.trim(),
        wantsProductUpdates: wantsUpdates,
        turnstileToken: token,
        source,
        website: honeypotRef.current?.value || '',
      })
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong — please try again.')
      setTurnstileToken(getDevBypassTurnstileToken())
      turnstileRef.current?.reset()
    }
  }

  if (status === 'success') {
    return (
      <section className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <SectionEyebrow>Early access</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            You&apos;re on the list
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            We&apos;ll email you when Marker opens. Thanks for your interest.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center">
          <SectionEyebrow>Early access</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Join the waitlist
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Be first to know when Marker opens. We&apos;ll email you when your spot is ready.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="sr-only" htmlFor="waitlist-email">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@factory.com"
            className={inputCls}
          />

          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={wantsUpdates}
              onChange={(event) => setWantsUpdates(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
            />
            <span>Also send me product updates and factory ops tips</span>
          </label>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="waitlist-website">Website</label>
            <input
              ref={honeypotRef}
              id="waitlist-website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {turnstileSiteKey ? (
            <div className="flex justify-center pt-1">
              <Turnstile
                ref={turnstileRef}
                siteKey={turnstileSiteKey}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken('')}
                onError={() => setTurnstileToken('')}
                options={{ theme: 'auto', size: 'normal' }}
              />
            </div>
          ) : null}

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" variant="marketing" size="lg" className="w-full" disabled={!canSubmit}>
            {status === 'submitting' ? 'Joining…' : 'Join waitlist'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            We&apos;ll only use your email for Marker waitlist and optional updates.{' '}
            <a href="#faq" className="text-primary hover:underline">
              Privacy
            </a>
          </p>
        </form>
      </div>
    </section>
  )
}
