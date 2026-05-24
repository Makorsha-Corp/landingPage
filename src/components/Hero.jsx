export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32">
      {/* Subtle gradient blob */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-br from-indigo-50 via-purple-50 to-white opacity-70 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 animate-fade-in">
          Simple ERP · Built for teams that move fast
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 animate-fade-up">
          Run your business,<br />
          <span className="text-indigo-600">not your software.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-100">
          Marker brings inventory, orders, finances, and your team into one clean workspace — no bloat, no six-month onboarding.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-200">
          <button className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
            Start free trial
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
            See a demo
          </button>
        </div>

        {/* Dashboard preview placeholder */}
        <div className="mt-20 animate-fade-up delay-300">
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl shadow-gray-200 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-200 bg-white">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-gray-400 font-mono">app.marker.so/dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              {[
                { label: 'Revenue', value: '$84,320', change: '+12%', color: 'indigo' },
                { label: 'Open Orders', value: '142', change: '+5%', color: 'emerald' },
                { label: 'Low Stock', value: '7 items', change: '-3%', color: 'amber' },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left"
                >
                  <p className="text-xs text-gray-400 font-medium mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-xs mt-1 font-semibold ${card.color === 'amber' ? 'text-amber-500' : card.color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                    {card.change} this month
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {['Order #1041 — Acme Corp', 'Order #1040 — Global Traders', 'Order #1039 — Sunrise Ltd'].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-700 font-medium">{row}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
                      {['Shipped', 'Processing', 'Confirmed'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
