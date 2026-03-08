import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-papagoi-beige-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-deep-anthracite mb-4">404</h1>
      <p className="text-warm-gray-600 mb-8">Lehte ei leitud.</p>
      <Link
        href="/et"
        className="px-6 py-3 bg-papagoi-green text-white font-semibold rounded-full hover:bg-papagoi-green/90 transition-colors"
      >
        Tagasi avalehele
      </Link>
    </div>
  )
}
