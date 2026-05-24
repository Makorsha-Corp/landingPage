const features = [
  {
    icon: '📦',
    title: 'Inventory Management',
    desc: 'Track stock levels, set reorder points, and get low-stock alerts before you run out.',
  },
  {
    icon: '🧾',
    title: 'Orders & Invoicing',
    desc: 'Create, send, and manage orders end-to-end. Auto-generate invoices with one click.',
  },
  {
    icon: '💰',
    title: 'Finance Overview',
    desc: 'See your revenue, expenses, and margins in a single clear dashboard.',
  },
  {
    icon: '👥',
    title: 'Team Access',
    desc: 'Role-based permissions so everyone sees exactly what they need — nothing more.',
  },
  {
    icon: '📊',
    title: 'Reports',
    desc: 'Export clean reports by date range, product, or customer with zero setup.',
  },
  {
    icon: '🔗',
    title: 'Integrations',
    desc: 'Connect to your existing tools — accounting, shipping, or e-commerce platforms.',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Everything you need, nothing you don't
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Marker covers the core of running a business — kept lean so your team actually uses it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 animate-fade-up delay-${(i + 1) * 100}`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
