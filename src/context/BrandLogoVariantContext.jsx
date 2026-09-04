import { createContext, useContext } from 'react'
import { DEFAULT_BRAND_LOGO_LIGHT_VARIANT } from '../lib/brandLogoVariants'

const BrandLogoVariantContext = createContext(DEFAULT_BRAND_LOGO_LIGHT_VARIANT)

export function BrandLogoVariantProvider({ value = DEFAULT_BRAND_LOGO_LIGHT_VARIANT, children }) {
  return <BrandLogoVariantContext.Provider value={value}>{children}</BrandLogoVariantContext.Provider>
}

export function useBrandLogoLightVariant() {
  return useContext(BrandLogoVariantContext)
}
