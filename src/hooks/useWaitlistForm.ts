import { useRef, useState, type FormEvent, type RefObject } from 'react'
import {
  getDevBypassTurnstileToken,
  getTurnstileSiteKey,
  submitWaitlistSignup,
} from '../lib/waitlistApi'

export interface UseWaitlistFormOptions {
  source?: string
  formIdPrefix?: string
}

export interface TurnstileWidget {
  reset(): void
}

export interface FormProps {
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  companyName: string
  setCompanyName: (value: string) => void
  email: string
  setEmail: (value: string) => void
  wantsUpdates: boolean
  setWantsUpdates: (value: boolean) => void
  honeypotRef: RefObject<HTMLInputElement | null>
  turnstileRef: RefObject<TurnstileWidget | null>
  turnstileSiteKey: string
  setTurnstileToken: (token: string) => void
  errorMessage: string
  canSubmit: boolean
  status: 'idle' | 'submitting' | 'success' | 'error'
  handleSubmit: (event: FormEvent) => Promise<void>
  idPrefix: string
}

export interface UseWaitlistFormReturn {
  formProps: FormProps
  isSuccess: boolean
}

export default function useWaitlistForm({
  source = 'waitlist_section',
  formIdPrefix = 'waitlist',
}: UseWaitlistFormOptions = {}): UseWaitlistFormReturn {
  const turnstileSiteKey = getTurnstileSiteKey()
  const turnstileRef = useRef<TurnstileWidget | null>(null)
  const honeypotRef = useRef<HTMLInputElement | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [wantsUpdates, setWantsUpdates] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(getDevBypassTurnstileToken())
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const canSubmit =
    status !== 'submitting' &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    Boolean(turnstileToken || !turnstileSiteKey)

  const handleSubmit = async (event: FormEvent): Promise<void> => {
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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        companyName: companyName.trim(),
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

  const formProps: FormProps = {
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
