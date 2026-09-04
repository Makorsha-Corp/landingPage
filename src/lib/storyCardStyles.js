export function getStoryCardStyles(theme) {
  if (theme === 'dark') {
    return {
      card: 'border-white/10 bg-black/45 text-white backdrop-blur-md',
      title: '',
      desc: 'text-white/80',
    }
  }
  return {
    card: 'border-white/60 bg-white/75 text-foreground backdrop-blur-md ring-1 ring-black/5 shadow-black/10',
    title: 'text-foreground',
    desc: 'text-muted-foreground',
  }
}

/** Clickable feature/capability cards — elevated at rest; subtle hover tint; press glow on touch. */
export function getStoryCardInteractiveClasses(theme) {
  const shared =
    'cursor-pointer transition-[box-shadow,border-color,ring-color] duration-300 ease-out ' +
    'active:scale-[0.98] active:duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  if (theme === 'dark') {
    return (
      `${shared} ` +
      'shadow-[0_12px_32px_-14px_rgba(0,0,0,0.55)] ring-1 ring-white/10 ' +
      'hover:border-primary/50 hover:ring-primary/35 ' +
      'hover:shadow-[0_28px_56px_-16px_rgba(149,104,184,0.48)] ' +
      'active:border-primary/45 active:ring-primary/30 ' +
      'active:shadow-[0_24px_48px_-14px_rgba(149,104,184,0.42)]'
    )
  }

  return (
    `${shared} ` +
    'shadow-[0_12px_32px_-16px_rgba(0,0,0,0.14)] ' +
    'hover:border-primary/45 hover:ring-primary/30 ' +
    'hover:shadow-[0_28px_56px_-16px_rgba(149,104,184,0.32)] ' +
    'active:border-primary/40 active:ring-primary/25 ' +
    'active:shadow-[0_24px_48px_-14px_rgba(149,104,184,0.28)]'
  )
}

/** Top-right open affordance on feature/capability cards. */
export function getStoryCardArrowPillClasses(theme) {
  const shared =
    'pointer-events-none absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm ' +
    'text-primary transition-[background-color,color,transform] ' +
    'group-hover:translate-x-0.5 group-hover:bg-primary/25 group-hover:text-white ' +
    'group-active:translate-x-0.5 group-active:bg-primary/30 group-active:text-white'

  if (theme === 'dark') {
    return `${shared} bg-white/10`
  }

  return `${shared} bg-black/5 ring-1 ring-black/5`
}

/** Static elevated glass cards (testimonials, etc.) — feature-card look without click affordances. */
export function getStoryCardElevatedClasses(theme) {
  const { card: cardCls } = getStoryCardStyles(theme)
  const base =
    `relative rounded-2xl border p-5 sm:p-6 backdrop-blur-md transition-shadow duration-300 ${cardCls} ` +
    'hover:shadow-[0_20px_40px_-14px_rgba(149,104,184,0.25)]'

  if (theme === 'dark') {
    return `${base} shadow-[0_12px_32px_-14px_rgba(0,0,0,0.55)] ring-1 ring-white/10`
  }

  return `${base} shadow-[0_12px_32px_-16px_rgba(0,0,0,0.14)]`
}

/** Static glass panel — no hover motion (testimony quote panel). */
export function getStoryCardStaticClasses(theme) {
  const { card: cardCls } = getStoryCardStyles(theme)
  const base = `relative rounded-2xl border p-5 sm:p-6 backdrop-blur-md ${cardCls}`

  if (theme === 'dark') {
    return `${base} shadow-[0_12px_32px_-14px_rgba(0,0,0,0.55)] ring-1 ring-white/10`
  }

  return `${base} shadow-[0_12px_32px_-16px_rgba(0,0,0,0.14)]`
}
