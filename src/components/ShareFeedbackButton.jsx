import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from './ui/Button'

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Async clipboard often blocked after long audit — fall through.
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus({ preventScroll: true })
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

function ShareFeedbackReportSheet({ open, reportText, copyState, onCopy, onClose }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const frame = requestAnimationFrame(() => {
      const node = textareaRef.current
      if (!node) return
      node.focus({ preventScroll: true })
      node.select()
      node.setSelectionRange(0, node.value.length)
    })
    return () => cancelAnimationFrame(frame)
  }, [open, reportText])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="pointer-events-auto flex max-h-[min(85dvh,36rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-labelledby="share-feedback-title"
        aria-modal="true"
      >
        <div className="border-b border-border px-4 py-3">
          <h2 id="share-feedback-title" className="text-sm font-semibold text-foreground">
            Performance report
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap <strong>Copy report</strong> below, then paste it in a message to the Kolom team.
          </p>
        </div>

        <textarea
          ref={textareaRef}
          readOnly
          value={reportText}
          className="min-h-[14rem] flex-1 resize-none border-0 bg-transparent px-4 py-3 font-mono text-[10px] leading-relaxed text-foreground outline-none"
          aria-label="Performance report text"
        />

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button type="button" variant="default" size="sm" onClick={onCopy}>
            {copyState === 'copied'
              ? 'Copied'
              : copyState === 'failed'
                ? 'Copy failed — select text above'
                : 'Copy report'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function ShareFeedbackButton({ collectReport, className = '' }) {
  const [scanState, setScanState] = useState('idle')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [reportText, setReportText] = useState('')
  const [copyState, setCopyState] = useState('idle')

  const handleFeedbackClick = async () => {
    if (scanState === 'scanning') return
    setScanState('scanning')
    setCopyState('idle')

    try {
      const text = await collectReport?.()
      if (!text) {
        setScanState('failed')
        window.setTimeout(() => setScanState('idle'), 2500)
        return
      }
      setReportText(text)
      setSheetOpen(true)
      setScanState('idle')
    } catch {
      setScanState('failed')
      window.setTimeout(() => setScanState('idle'), 2500)
    }
  }

  const handleCopy = async () => {
    if (!reportText) return
    const ok = await copyText(reportText)
    setCopyState(ok ? 'copied' : 'failed')
    if (ok) {
      window.setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  const handleClose = () => {
    setSheetOpen(false)
    setCopyState('idle')
  }

  const label =
    scanState === 'scanning'
      ? 'Scanning…'
      : scanState === 'failed'
        ? 'Scan failed'
        : 'Feedback'

  return (
    <>
      <Button
        type="button"
        variant="navGhost"
        size="sm"
        className={`h-9 shrink-0 rounded-full px-3 text-xs sm:text-sm ${className}`}
        aria-label="Share feedback about page performance"
        onClick={handleFeedbackClick}
        disabled={scanState === 'scanning'}
      >
        {label}
      </Button>

      <ShareFeedbackReportSheet
        open={sheetOpen}
        reportText={reportText}
        copyState={copyState}
        onCopy={handleCopy}
        onClose={handleClose}
      />
    </>
  )
}
