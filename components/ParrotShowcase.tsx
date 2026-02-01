
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

// Fallback andmed, kui Notion'ist ei tule andmeid
const fallbackParrots = [
  {
    id: 1,
    name: 'Sinine ja Kuldne Ara',
    species: 'Ara ararauna',
    image: 'https://cdn.abacus.ai/images/4844f1b4-b44f-4444-a1a4-413b9b35da3c.png',
    description: 'Üks meie kõige suuremaid ja muljetavaldavamaid papagoie. Sinised ja kollased suled säravad igas valguses.',
    personality: 'Sõbralik, intelligentne, armastab tähelepanu'
  },
  {
    id: 2,
    name: 'Solomon Kakadu',
    species: 'Eclectus roratus',
    image: 'https://live.staticflickr.com/2808/9551347720_ceb75f4667_b.jpg',
    description: 'Värvirikas emane Eclectus papagoi kaunite punaste ja oranžide sulgedega. Tõeline ilu kuninganna.',
    personality: 'Rahuliku loomuga, sõbralik, armastab vaatlemist'
  }
]

interface Parrot {
  id: string | number
  name: string
  species: string
  image: string
  description?: string
  story?: string
  personality?: string | string[]
}

interface ParrotShowcaseProps {
  parrots?: Parrot[]
}

export default function ParrotShowcase({ parrots: parrotsProp }: ParrotShowcaseProps) {
  // Kasutame props'ist tulevaid andmeid või fallback'e
  const parrots = parrotsProp && parrotsProp.length > 0 
    ? parrotsProp.map((p, idx) => ({
        ...p,
        id: p.id || idx,
        description: p.description || p.story || '',
        personality: typeof p.personality === 'string' 
          ? p.personality 
          : Array.isArray(p.personality) 
            ? p.personality.join(', ') 
            : ''
      }))
    : fallbackParrots

  const [selectedParrot, setSelectedParrot] = useState<Parrot | null>(null)
  const [hoveredParrot, setHoveredParrot] = useState<string | number | null>(null)

  // Uuenda selectedParrot, kui parrots muutub
  useEffect(() => {
    if (parrots.length > 0 && !selectedParrot) {
      setSelectedParrot(parrots[0])
    }
  }, [parrots, selectedParrot])

  if (!parrots || parrots.length === 0) {
    return null
  }

  // Grupeerime liikide järgi
  const groupedBySpecies = parrots.reduce((acc, parrot) => {
    const species = parrot.species || 'Muu'
    if (!acc[species]) {
      acc[species] = []
    }
    acc[species].push(parrot)
    return acc
  }, {} as Record<string, Parrot[]>)

  const speciesList = Object.keys(groupedBySpecies).sort()

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Tutvuge meie <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">papagoidega</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Meie juures elab <strong>{parrots.length} papagoid</strong> erinevatest liikidest. Iga lind omab ainulaadset isikust ja lugu.
          </p>
        </div>

        {/* Kompaktne Grid Layout - väiksemad pildid */}
        <div className="mb-12">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3 md:gap-4">
            {parrots.map((parrot) => (
              <div
                key={parrot.id}
                onClick={() => setSelectedParrot(parrot)}
                onMouseEnter={() => setHoveredParrot(parrot.id)}
                onMouseLeave={() => setHoveredParrot(null)}
                className={`group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  selectedParrot?.id === parrot.id 
                    ? 'ring-2 ring-green-500 shadow-lg' 
                    : 'hover:scale-105'
                }`}
              >
                {/* Väike pilt */}
                <div className="relative w-full aspect-square bg-gray-100">
                  {parrot.image ? (
                    <Image
                      src={parrot.image}
                      alt={`${parrot.name} - ${parrot.species}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                      <span className="text-2xl">🦜</span>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity ${
                    hoveredParrot === parrot.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-semibold drop-shadow-lg">{parrot.name}</p>
                      <p className="text-white/90 text-[10px] drop-shadow">{parrot.species}</p>
                    </div>
                  </div>
                </div>
                
                {/* Nimi all */}
                <div className="p-2 text-center">
                  <p className="text-xs font-medium text-gray-800 truncate" title={parrot.name}>
                    {parrot.name}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate" title={parrot.species}>
                    {parrot.species}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Valitud papagoi detailid (kui on valitud) */}
        {selectedParrot && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Pilt */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden bg-gray-100">
                  {selectedParrot.image ? (
                    <Image
                      src={selectedParrot.image}
                      alt={`${selectedParrot.name} - ${selectedParrot.species}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                      <span className="text-4xl">🦜</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  {selectedParrot.name}
                </h3>
                <p className="text-sm text-gray-500 italic mb-4">
                  {selectedParrot.species}
                </p>
                
                {selectedParrot.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {selectedParrot.description}
                  </p>
                )}
                
                {selectedParrot.personality && (
                  <div className="flex flex-wrap gap-2">
                    {typeof selectedParrot.personality === 'string' 
                      ? selectedParrot.personality.split(',').map((p, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {p.trim()}
                          </span>
                        ))
                      : null
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liikide grupeerimine (valikuline) */}
        {speciesList.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Liikide järgi:</h3>
            <div className="flex flex-wrap gap-2">
              {speciesList.map((species) => (
                <span key={species} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {species} ({groupedBySpecies[species].length})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Soovite kõigi meie papagoidega tutvuda?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Igaühel on oma lugu ja isikupära!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/broneeri"
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition text-sm"
              >
                Broneeri külastus
              </a>
              <a
                href="/papagoid"
                className="text-green-600 border-2 border-green-600 px-6 py-2 rounded-full font-semibold hover:bg-green-600 hover:text-white transition text-sm"
              >
                Vaata kõiki papagoie
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
