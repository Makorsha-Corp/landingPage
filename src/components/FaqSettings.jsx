import Button from './ui/Button'

const inputCls =
  'w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'

export default function FaqSettings({ item, index, onChange, onSave }) {
  const updateField = (field, value) => {
    onChange({ ...item, [field]: value })
  }

  return (
    <div className="space-y-2.5">
      <div className="text-xs font-semibold text-primary">Editing FAQ {index + 1}</div>
      <div>
        <label className={labelCls} htmlFor={`faq-q-${index}`}>
          Question
        </label>
        <input
          id={`faq-q-${index}`}
          className={inputCls}
          value={item.question}
          onChange={(e) => updateField('question', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`faq-a-${index}`}>
          Answer
        </label>
        <textarea
          id={`faq-a-${index}`}
          rows={4}
          className={inputCls}
          value={item.answer}
          onChange={(e) => updateField('answer', e.target.value)}
        />
      </div>
      <Button type="button" onClick={onSave} size="xs" className="w-full">
        Save section
      </Button>
    </div>
  )
}
