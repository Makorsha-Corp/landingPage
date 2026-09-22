import { createContext, useContext, type ReactNode } from 'react'
import { DEFAULT_BRAND_LOGO_LIGHT_VARIANT } from '../lib/brandLogoVariants'

const BrandLogoVariantContext = createContext<string>(DEFAULT_BRAND_LOGO_LIGHT_VARIANT)

export interface BrandLogoVariantProviderProps {
  value?: string
  children: ReactNode
}

export function BrandLogoVariantProvider({
  value = DEFAULT_BRAND_LOGO_LIGHT_VARIANT,
  children,
}: BrandLogoVariantProviderProps): React.JSX.Element {
  return (
    <BrandLogoVariantContext.Provider value={value}>
      {children}
    </BrandLogoVariantContext.Provider>
  )
}

export function useBrandLogoLightVariant(): string {
  return useContext(BrandLogoVariantContext)
}
