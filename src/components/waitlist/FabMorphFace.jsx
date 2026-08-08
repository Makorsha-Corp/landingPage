import { cn } from '@/lib/utils'



const TRAVEL_LABEL_CLASS = {

  rainbow: 'text-base font-semibold text-white',

  button: 'text-sm font-semibold text-secondary-foreground',

  buttonOutline: 'text-sm font-semibold text-foreground',

  buttonCard: 'text-sm font-semibold text-foreground',

}



function getLabelClass(face, variant) {

  if (face === 'rainbow') return TRAVEL_LABEL_CLASS.rainbow

  if (variant === 'outline' || variant === 'marketingOutline') return TRAVEL_LABEL_CLASS.buttonOutline

  if (variant === 'heroGlass') return TRAVEL_LABEL_CLASS.rainbow

  return TRAVEL_LABEL_CLASS.button

}



export default function FabMorphFace({

  visible = true,

  label = 'Sign Up',

  variant = 'brand',

  face = 'rainbow',

}) {

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


