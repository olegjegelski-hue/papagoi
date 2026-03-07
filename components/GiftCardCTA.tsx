import Link from 'next/link'
import { Gift } from 'lucide-react'
import { KINKEKAART_PATH } from '@/lib/site-links'

type GiftCardCTAVariant = 'default' | 'service'

export default function GiftCardCTA({ variant = 'default' }: { variant?: GiftCardCTAVariant }) {
  if (variant === 'service') {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">🎁 Papagoi Keskuse kinkekaart</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Tee rõõmu kellelegi olulisele – Kingi vägev elamus!
          </p>
        </div>
        <div className="p-8 text-center">
          <Link
            href={KINKEKAART_PATH}
            className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
          >
            <Gift className="w-5 h-5" />
            <span>Osta kinkekaart</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-b from-blue-50 to-yellow-50 papagoi-section-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Papagoi Keskuse kinkekaart.</h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Tee rõõmu kellelegi olulisele – Kingi vägev elamus!
            </p>
            <Link
              href={KINKEKAART_PATH}
              className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              <Gift className="w-5 h-5" />
              <span>Osta kinkekaart</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
