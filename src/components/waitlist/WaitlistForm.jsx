import { Turnstile } from '@marsidev/react-turnstile'
import WaitlistCheckbox from './WaitlistCheckbox'
import WaitlistSubmitButton from './WaitlistSubmitButton'
import { waitlistInput } from '../../lib/loginSurfaceStyles'
import { BRAND_NAME } from '../../lib/brand.js'

export default function WaitlistForm({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  companyName,
  setCompanyName,
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
  idPrefix = 'waitlist',
}) {
  const firstNameId = `${idPrefix}-first-name`
  const lastNameId = `${idPrefix}-last-name`
  const companyId = `${idPrefix}-company`
  const emailId = `${idPrefix}-email`
  const updatesId = `${idPrefix}-updates`
  const websiteId = `${idPrefix}-website`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="sr-only" htmlFor={firstNameId}>
          First name
        </label>
        <input
          id={firstNameId}
          type="text"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="First name"
          className={waitlistInput}
        />
      </div>

      <div>
        <label className="sr-only" htmlFor={lastNameId}>
          Last name
        </label>
        <input
          id={lastNameId}
          type="text"
          autoComplete="family-name"
          required
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Last name"
          className={waitlistInput}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="sr-only" htmlFor={emailId}>
            Work email
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Work email"
            className={waitlistInput}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor={companyId}>
            Company name
          </label>
          <input
            id={companyId}
            type="text"
            autoComplete="organization"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Company name"
            className={waitlistInput}
          />
        </div>
      </div>

      <WaitlistCheckbox
        id={updatesId}
        checked={wantsUpdates}
        onChange={(event) => setWantsUpdates(event.target.checked)}
      >
        Also send me product updates and factory ops tips
      </WaitlistCheckbox>

      <div className="hidden" aria-hidden="true">
        <label htmlFor={websiteId}>Website</label>
        <input
          ref={honeypotRef}
          id={websiteId}
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

      <WaitlistSubmitButton disabled={!canSubmit} isSubmitting={status === 'submitting'} />

      <p className="text-xs text-muted-foreground">
        We&apos;ll only use your email for {BRAND_NAME} waitlist and optional updates.{' '}
        <a href="#faq" className="text-primary hover:underline">
          Privacy
        </a>
      </p>
    </form>
  )
}
