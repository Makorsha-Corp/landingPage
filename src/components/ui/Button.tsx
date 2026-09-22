import { getButtonClasses, type ButtonVariant, type ButtonSize } from './buttonVariants'
import type { ElementType, ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export default function Button({
  as: Component = 'button',
  variant = 'default',
  size = 'default',
  className = '',
  type = 'button',
  ...props
}: ButtonProps): React.JSX.Element {
  const classes = getButtonClasses({ variant, size, className })

  if (Component === 'button') {
    return <button type={type} className={classes} {...props} />
  }

  return <Component className={classes} {...props} />
}
