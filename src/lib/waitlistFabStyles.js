export const DEFAULT_WAITLIST_FAB_STYLE = 'pill_rainbow'

export const WAITLIST_FAB_STYLE_LIST = [
  { id: 'pill_rainbow', label: 'Rainbow pill' },
  { id: 'fab_icon', label: 'Circle icon' },
  { id: 'glass_chip', label: 'Glass chip' },
  { id: 'mini_banner', label: 'Mini banner' },
]

const MORPH_META_BY_STYLE = {
  pill_rainbow: { label: 'Sign Up', variant: 'brand', face: 'rainbow' },
  fab_icon: { label: 'Sign Up', variant: 'brand', face: 'rainbow' },
  glass_chip: { label: 'Sign Up', variant: 'brand', face: 'rainbow' },
  mini_banner: { label: 'Join waitlist', variant: 'brand', face: 'rainbow' },
}

export function getWaitlistFabStyle(styleId = DEFAULT_WAITLIST_FAB_STYLE) {
  return (
    WAITLIST_FAB_STYLE_LIST.find((entry) => entry.id === styleId)?.id ?? DEFAULT_WAITLIST_FAB_STYLE
  )
}

export function getWaitlistFabMorphMeta(styleId = DEFAULT_WAITLIST_FAB_STYLE) {
  const id = getWaitlistFabStyle(styleId)
  return MORPH_META_BY_STYLE[id] ?? MORPH_META_BY_STYLE.pill_rainbow
}
