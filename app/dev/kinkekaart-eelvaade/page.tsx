import { notFound } from 'next/navigation'

/** Ainult arenduskeskkond — ava pärast `npm run dev`: /dev/kinkekaart-eelvaade */
export default function KinkekaartEelvaadePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-stone-200 p-6">
      <p className="mb-4 max-w-xl text-center text-sm text-stone-600">
        Näidiskinkekaart (PNG genereeritakse kohalikult Playwrightiga). Kui pilti ei
        laadi, oota mõni sekund ja värskenda — esimene päring võtab kauem.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/api/gift-card-sample"
        alt="Kinkekaardi eelvaade"
        className="max-w-full rounded-lg shadow-md"
        width={1080}
        height={680}
      />
    </div>
  )
}
