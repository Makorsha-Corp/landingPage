import { Turnstile } from '@marsidev/react-turnstile'
import Button from '../ui/Button'
import { loginInput } from '../../lib/loginSurfaceStyles'

export default function WaitlistForm({
  email,
  setEmail,
  wantsUpdates,
  setWantsUpdates,
  honeypotRef,
  turnstileRef,
  turnstileSiteKey,
  setTurnstileToken,
  errorMessage,
  canSubmit,
  status,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
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
            placeholder="yourname@factory.com"
            className={loginInput}
          />
        </div>
        <Button
          type="submit"
          variant="marketing"
          size="lg"
          className="h-11 w-full shrink-0 sm:w-auto"
          disabled={!canSubmit}
        >
          {status === 'submitting' ? 'Joining…' : 'Join waitlist'}
        </Button>
      </div>

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
        <div className="flex justify-center pt-1 sm:justify-start">
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

      <p className="text-xs text-muted-foreground">
        We&apos;ll only use your email for Marker waitlist and optional updates.{' '}
        <a href="#faq" className="text-primary hover:underline">
          Privacy
        </a>
      </p>
    </form>
  )
}
