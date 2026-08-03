function CheckGlyph({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6.25 4.75 8.5 9.5 3.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function WaitlistCheckbox({ id, checked, onChange, children }) {
  return (
    <label
      htmlFor={id}
      className="group -mx-2 flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm leading-snug text-muted-foreground transition-colors hover:bg-muted/35 hover:text-foreground"
    >
      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center rounded-[0.45rem] border border-border bg-input shadow-sm transition-all duration-200 group-hover:border-primary/35 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:shadow-[0_0_0_3px_hsl(var(--primary)/0.14)] peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100"
        >
          <CheckGlyph className="h-2.5 w-2.5 scale-75 opacity-0 transition-all duration-200" />
        </span>
      </span>
      <span className="pt-px">{children}</span>
    </label>
  )
}
