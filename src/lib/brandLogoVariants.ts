export const DEFAULT_BRAND_LOGO_LIGHT_VARIANT = 'softTile'

export type BrandLogoLightVariant = string

export interface BrandLogoVariant {
  id: string
  label: string
}

export const BRAND_LOGO_LIGHT_VARIANT_LIST: BrandLogoVariant[] = [
  { id: 'purpleSilhouette', label: 'Purple silhouette' },
  { id: 'softTile', label: 'Soft tile' },
  { id: 'whiteTile', label: 'White tile' },
]

export function getBrandLogoLightVariant(variantId: string = DEFAULT_BRAND_LOGO_LIGHT_VARIANT): string {
  return (
    BRAND_LOGO_LIGHT_VARIANT_LIST.find((entry) => entry.id === variantId)?.id ??
    DEFAULT_BRAND_LOGO_LIGHT_VARIANT
  )
}
