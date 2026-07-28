import { getButtonClasses } from './buttonVariants'

export default function Button({
  as: Component = 'button',
  variant = 'default',
  size = 'default',
  className = '',
  type = 'button',
  ...props
}) {
  const classes = getButtonClasses({ variant, size, className })

  if (Component === 'button') {
    return <button type={type} className={classes} {...props} />
  }

  return <Component className={classes} {...props} />
}
