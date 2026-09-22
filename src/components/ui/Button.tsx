import { getButtonClasses, type ButtonVariant, type ButtonSize } from './buttonVariants'
import type { ElementType, ButtonHTMLAttributes, AnchorHTMLAttributes, ComponentPropsWithoutRef } from 'react'

type ButtonAsButton = {
  as?: 'button'
  href?: never
} & ButtonHTMLAttributes<HTMLButtonElement>

type ButtonAsAnchor = {
  as: 'a'
  href?: string
} & AnchorHTMLAttributes<HTMLAnchorElement>

type ButtonAsOther<T extends ElementType> = {
  as: T
} & ComponentPropsWithoutRef<T>

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} & (ButtonAsButton | ButtonAsAnchor | ButtonAsOther<ElementType>)

export default function Button({
  as,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: ButtonProps): React.JSX.Element {
  const classes = getButtonClasses({ variant, size, className })
  const Component = as || 'button'

  if (Component === 'button') {
    const { type = 'button', ...buttonProps } = props as ButtonHTMLAttributes<HTMLButtonElement>
    return <button type={type} className={classes} {...buttonProps} />
  }

  return <Component className={classes} {...props} />
}
