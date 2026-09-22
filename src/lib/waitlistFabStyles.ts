export const DEFAULT_WAITLIST_FAB_STYLE = 'pill_rainbow'

export interface WaitlistFabStyleEntry {
  id: string
  label: string
}

export const WAITLIST_FAB_STYLE_LIST: WaitlistFabStyleEntry[] = [
  { id: 'pill_rainbow', label: 'Rainbow pill' },
  { id: 'fab_icon', label: 'Circle icon' },
  { id: 'glass_chip', label: 'Glass chip' },
  { id: 'mini_banner', label: 'Mini banner' },
]

export interface WaitlistFabMorphMeta {
  label: string
  variant: string
  face: string
}

const MORPH_META_BY_STYLE: Record<string, WaitlistFabMorphMeta> = {
  pill_rainbow: { label: 'Sign Up', variant: 'brand', face: 'rainbow' },
  fab_icon: { label: 'Sign Up', variant: 'brand', face: 'rainbow' },
  glass_chip: { label: 'Sign Up', variant: 'brand', face: 'rainbow' },
  mini_banner: { label: 'Join waitlist', variant: 'brand', face: 'rainbow' },
}

export function getWaitlistFabStyle(styleId: string = DEFAULT_WAITLIST_FAB_STYLE): string {
  return (
    WAITLIST_FAB_STYLE_LIST.find((entry) => entry.id === styleId)?.id ?? DEFAULT_WAITLIST_FAB_STYLE
  )
}

export function getWaitlistFabMorphMeta(styleId: string = DEFAULT_WAITLIST_FAB_STYLE): WaitlistFabMorphMeta {
  const id = getWaitlistFabStyle(styleId)
  return MORPH_META_BY_STYLE[id] ?? MORPH_META_BY_STYLE.pill_rainbow
}
