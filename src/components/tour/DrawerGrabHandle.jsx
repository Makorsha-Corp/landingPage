export default function DrawerGrabHandle({ className = '' }) {
  return (
    <div className={`flex justify-center py-2 ${className}`} aria-hidden="true">
      <span className="h-1 w-10 rounded-full bg-muted-foreground/35" />
    </div>
  )
}
