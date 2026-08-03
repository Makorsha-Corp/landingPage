export const DEFAULT_HERO_SIGN_UP_BUTTON_VARIANT = 'brand'

export const HERO_SIGN_UP_BUTTON_VARIANT_LIST = [
  { id: 'brand', label: 'Purple fill' },
  { id: 'brandLight', label: 'White fill' },
]

export function getHeroSignUpButtonVariant(variantId = DEFAULT_HERO_SIGN_UP_BUTTON_VARIANT) {
  return (
    HERO_SIGN_UP_BUTTON_VARIANT_LIST.find((entry) => entry.id === variantId)?.id ??
    DEFAULT_HERO_SIGN_UP_BUTTON_VARIANT
  )
}
