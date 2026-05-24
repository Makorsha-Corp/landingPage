export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <span className="font-bold text-gray-900 text-base">Marker</span>
        <span>Simple ERP for growing businesses.</span>
        <span>© {new Date().getFullYear()} Makorsh Corp. All rights reserved.</span>
      </div>
    </footer>
  )
}
