import { cn } from '@/lib/utils'

type FaceType = 'rainbow' | 'button'
type VariantType = 'brand' | 'outline' | 'marketingOutline' | 'heroGlass' | string

const TRAVEL_LABEL_CLASS: Record<string, string> = {
  rainbow: 'text-base font-semibold text-white',
  button: 'text-sm font-semibold text-secondary-foreground',
  buttonOutline: 'text-sm font-semibold text-foreground',
  buttonCard: 'text-sm font-semibold text-foreground',
}

function getLabelClass(face: FaceType, variant: VariantType): string {
  if (face === 'rainbow') return TRAVEL_LABEL_CLASS.rainbow
  if (variant === 'outline' || variant === 'marketingOutline') return TRAVEL_LABEL_CLASS.buttonOutline
  if (variant === 'heroGlass') return TRAVEL_LABEL_CLASS.rainbow
  return TRAVEL_LABEL_CLASS.button
}

export interface FabMorphFaceProps {
  visible?: boolean
  label?: string
  variant?: VariantType
  face?: FaceType
}

export default function FabMorphFace({
  visible = true,
  label = 'Sign Up',
  variant = 'brand',
  face = 'rainbow',
}: FabMorphFaceProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center justify-center px-3 transition-opacity duration-150 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden="true"
    >
      <span className={cn('truncate', getLabelClass(face, variant))}>{label}</span>
    </div>
  )
}
