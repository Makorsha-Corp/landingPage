export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-gray-900">
          Marker
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://frontend-theta-dusky-91.vercel.app/login2"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
          >
            Sign in
          </a>
          <a
            href="https://frontend-theta-dusky-91.vercel.app/login2"
            className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-700 transition-colors"
          >
            Get started
          </a>
        </div>
      </div>
    </nav>
  )
}
