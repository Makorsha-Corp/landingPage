export const DEFAULT_BRAND_LOGO_LIGHT_VARIANT = 'softTile'

export const BRAND_LOGO_LIGHT_VARIANT_LIST = [
  { id: 'purpleSilhouette', label: 'Purple silhouette' },
  { id: 'softTile', label: 'Soft tile' },
  { id: 'whiteTile', label: 'White tile' },
]

export function getBrandLogoLightVariant(variantId = DEFAULT_BRAND_LOGO_LIGHT_VARIANT) {
  return (
    BRAND_LOGO_LIGHT_VARIANT_LIST.find((entry) => entry.id === variantId)?.id ??
    DEFAULT_BRAND_LOGO_LIGHT_VARIANT
  )
}
