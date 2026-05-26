export default function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 sm:px-16 sm:py-20">
          {/* Background Pattern */}
          <div 
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Gradient Overlay */}
          <div 
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to streamline your operations?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Join hundreds of manufacturers who've simplified their workflows with Marker. 
              Start your free 14-day trial today — no credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://frontend-theta-dusky-91.vercel.app/login2"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:-translate-y-0.5"
              >
                Get started free
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#pricing"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border-2 border-white/30 px-8 text-base font-semibold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
              >
                View pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
