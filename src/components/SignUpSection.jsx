import { useRef, useState } from 'react'
import {
  getDevBypassTurnstileToken,
  getTurnstileSiteKey,
  submitWaitlistSignup,
} from '../lib/waitlistApi'
import WaitlistForm from './waitlist/WaitlistForm'
import WaitlistSuccess from './waitlist/WaitlistSuccess'
import PurpleSplitLayout from './waitlist/PurpleSplitLayout'

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
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong — please try again.',
      )
      setTurnstileToken(getDevBypassTurnstileToken())
      turnstileRef.current?.reset()
    }
  }

  const isSuccess = status === 'success'

  const formProps = {
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
  }

  return (
    <section className="relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <PurpleSplitLayout
          isSuccess={isSuccess}
          renderForm={() => <WaitlistForm {...formProps} />}
          renderSuccess={() => <WaitlistSuccess />}
        />
      </div>
    </section>
  )
}
