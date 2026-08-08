import { useRef, useState } from 'react'
import {
  getDevBypassTurnstileToken,
  getTurnstileSiteKey,
  submitWaitlistSignup,
} from '../lib/waitlistApi'

export default function useWaitlistForm({
  source = 'waitlist_section',
  formIdPrefix = 'waitlist',
} = {}) {
  const turnstileSiteKey = getTurnstileSiteKey()
  const turnstileRef = useRef(null)
  const honeypotRef = useRef(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [wantsUpdates, setWantsUpdates] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(getDevBypassTurnstileToken())
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const canSubmit =
    status !== 'submitting' &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
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

      // TODO(waitlist-fields): firstName/lastName/companyName are collected but not yet
      // persisted. Needs waitlist_signups columns + schema + migration before wiring up.

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
    idPrefix: formIdPrefix,
  }

  return { formProps, isSuccess }
}
