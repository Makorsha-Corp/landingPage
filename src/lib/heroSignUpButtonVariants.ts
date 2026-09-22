export const DEFAULT_LIGHT_SIGN_UP_VARIANT = 'brand'
export const DEFAULT_DARK_SIGN_UP_VARIANT = 'brand'

/** @deprecated Use DEFAULT_LIGHT_SIGN_UP_VARIANT */
export const DEFAULT_HERO_SIGN_UP_BUTTON_VARIANT = DEFAULT_LIGHT_SIGN_UP_VARIANT

export interface SignUpButtonVariant {
  id: string
  label: string
}

export const SIGN_UP_BUTTON_VARIANT_LIST: SignUpButtonVariant[] = [
  { id: 'brand', label: 'Purple fill' },
  { id: 'brandLight', label: 'White fill' },
  { id: 'outline', label: 'Rainbow outline' },
  { id: 'heroGlass', label: 'Glass + rainbow' },
]

/** @deprecated Use SIGN_UP_BUTTON_VARIANT_LIST */
export const HERO_SIGN_UP_BUTTON_VARIANT_LIST = SIGN_UP_BUTTON_VARIANT_LIST

export function getSignUpButtonVariant(variantId: string = DEFAULT_LIGHT_SIGN_UP_VARIANT): string {
  return (
    SIGN_UP_BUTTON_VARIANT_LIST.find((entry) => entry.id === variantId)?.id ??
    DEFAULT_LIGHT_SIGN_UP_VARIANT
  )
}

/** @deprecated Use getSignUpButtonVariant */
export function getHeroSignUpButtonVariant(variantId: string = DEFAULT_HERO_SIGN_UP_BUTTON_VARIANT): string {
  return getSignUpButtonVariant(variantId)
}

export function getSignUpVariantForTheme(
  theme: string = 'light',
  lightVariant?: string,
  darkVariant?: string,
): string {
  const light = getSignUpButtonVariant(lightVariant ?? DEFAULT_LIGHT_SIGN_UP_VARIANT)
  const dark = getSignUpButtonVariant(darkVariant ?? DEFAULT_DARK_SIGN_UP_VARIANT)
  return theme === 'dark' ? dark : light
}

/** @deprecated Use getSignUpVariantForTheme with explicit light/dark state */
export function getThemeAwareSignUpVariant(theme: string = 'light'): string {
  return getSignUpVariantForTheme(theme, DEFAULT_LIGHT_SIGN_UP_VARIANT, 'brandLight')
}
