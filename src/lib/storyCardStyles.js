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
