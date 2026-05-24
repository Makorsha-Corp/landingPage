export default function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="bg-indigo-600 rounded-3xl px-10 py-16 shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to simplify your operations?
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-lg mx-auto">
            Get started in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://frontend-theta-dusky-91.vercel.app/login2"
              className="w-full sm:w-auto text-center px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl shadow-md hover:bg-indigo-50 transition-all"
            >
              Start for free
            </a>
            <button className="w-full sm:w-auto px-8 py-3.5 border border-indigo-400 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all">
              Talk to sales
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
