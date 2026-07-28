import { useNavLayout } from '../context/NavLayoutContext'
import Button from './ui/Button'

export default function NavLayoutToggle({ className = '' }) {
  const { navLayout, cycleNavLayout } = useNavLayout()

  return (
    <Button
      type="button"
      variant="navGhost"
      size="sm"
      className={`hidden sm:inline-flex ${className}`}
      onClick={cycleNavLayout}
      aria-label="Toggle navbar layout"
    >
      Nav: {navLayout}
    </Button>
  )
}
