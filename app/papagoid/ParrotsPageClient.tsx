
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Star, Users, Clock, Euro, Check, Gift, Phone, Mail, X, Eye, Calendar } from 'lucide-react'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    case 'sponsored': return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
    case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return 'Otsib ristiisa'
    case 'sponsored': return 'On ristiisa'
    case 'pending': return 'Ootel'
    default: return 'Teadmata'
  }
}

// Arvutab vanuse sünnipäeva põhjal
const calculateAge = (birthday: string) => {
  if (!birthday) return null
  
  try {
    const birthDate = new Date(birthday)
    const today = new Date()
    let years = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--
    }
    
    return years
  } catch (error) {
    return null
  }
}

// Formateerib kuupäeva
const formatDate = (dateString: string) => {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } catch (error) {
    return dateString
  }
}

export default function ParrotsPageClient({ allParrots }: { allParrots: any[] }) {
  const [filter, setFilter] = useState('all')
  const [nameFilter, setNameFilter] = useState('all')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [selectedParrot, setSelectedParrot] = useState<any | null>(null)
  const [expandedStories, setExpandedStories] = useState<{ [key: string]: boolean }>({})

  // Kõik unikaalsed liigid
  const allSpecies = Array.from(new Set(allParrots.map(p => p.species).filter(Boolean))).sort()
  
  // Kõik unikaalsed nimed
  const allNames = Array.from(new Set(allParrots.map(p => p.name).filter(Boolean))).sort()

  const filteredParrots = allParrots.filter(parrot => {
    // Ristiisa staatuse filter
    if (filter !== 'all') {
      if (filter === 'available' && parrot.sponsorship?.status !== 'available') return false
      if (filter === 'sponsored' && parrot.sponsorship?.status !== 'sponsored') return false
    }

    // Nime filter
    if (nameFilter !== 'all' && parrot.name !== nameFilter) {
      return false
    }

    // Liigi filter
    if (speciesFilter !== 'all' && parrot.species !== speciesFilter) {
      return false
    }

    return true
  })

  // Scroll to detail view when parrot is selected
  useEffect(() => {
    if (selectedParrot) {
      const element = document.getElementById('parrot-detail')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [selectedParrot])

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Meie papagoid</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Tutvuge meie värvilise perekonnaga! Kui mõtlete, kus saab papagoid näha Eestis, siis siin kohtute tõeliste
            papagoidega Tartus. Iga papagoi on ainulaadne isiksuseomaduste ja loo poolest. Nad kõik ootavad kannatamatult
            võimalust teiega tutvuda.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Filter */}
            <div>
              <select
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
              >
                <option value="all">Kõik nimed</option>
                {allNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Species Filter */}
            <div>
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
              >
                <option value="all">Kõik liigid</option>
                {allSpecies.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => {
              setFilter('all')
              setNameFilter('all')
              setSpeciesFilter('all')
              setSelectedParrot(null)
            }}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Kõik papagoid ({allParrots.length})
          </button>
          <button
            onClick={() => {
              setFilter('available')
              setNameFilter('all')
              setSpeciesFilter('all')
              setSelectedParrot(null)
            }}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              filter === 'available' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Otsivad ristiisa ({allParrots.filter(p => p.sponsorship.status === 'available').length})
          </button>
          <button
            onClick={() => {
              setFilter('sponsored')
              setNameFilter('all')
              setSpeciesFilter('all')
              setSelectedParrot(null)
            }}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              filter === 'sponsored' 
                ? 'bg-gray-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            On ristiisa ({allParrots.filter(p => p.sponsorship.status === 'sponsored').length})
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">{allParrots.length}+</div>
            <p className="text-gray-600">Papagoid</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
            <p className="text-gray-600">Erinevat liiki</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-red-600 mb-2">{allParrots.filter(p => p.sponsorship.status === 'available').length}</div>
            <p className="text-gray-600">Otsib ristiisa</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-yellow-600 mb-2">100%</div>
            <p className="text-gray-600">Armastust</p>
          </div>
        </div>

        {/* Results Count */}
        {(nameFilter !== 'all' || speciesFilter !== 'all' || filter !== 'all') && (
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Leitud <span className="font-bold text-green-600">{filteredParrots.length}</span> papagoid
            </p>
          </div>
        )}

        {/* Detail View - Inline */}
        {selectedParrot && (
          <div 
            id="parrot-detail"
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
          >
            {/* Detail Header */}
            <div className="relative">
              <div className="relative h-64 md:h-96">
                {selectedParrot.image ? (
                  <Image
                    src={selectedParrot.image}
                    alt={`${selectedParrot.name} - ${selectedParrot.species}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                    <span className="text-8xl">🦜</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedParrot(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-800" />
                </button>
                <div className="absolute top-4 left-4">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedParrot.sponsorship?.status).bg} ${getStatusColor(selectedParrot.sponsorship?.status).text} ${getStatusColor(selectedParrot.sponsorship?.status).border} border backdrop-blur-sm`}>
                    {getStatusText(selectedParrot.sponsorship?.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Content */}
            <div className="p-6 md:p-8">
              {/* Name and Basic Info */}
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{selectedParrot.name}</h2>
                <p className="text-lg text-gray-600 italic mb-4">{selectedParrot.species}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {selectedParrot.birthday && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Sünnipäev:</span>{' '}
                        {formatDate(selectedParrot.birthday)}
                        {calculateAge(selectedParrot.birthday) !== null && (
                          <span className="ml-2 text-gray-500">
                            ({calculateAge(selectedParrot.birthday)} aastat)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedParrot.gender && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Sugu:</span> {selectedParrot.gender}
                      </div>
                    </div>
                  )}
                  
                  {selectedParrot.age && !selectedParrot.birthday && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Vanus:</span> {selectedParrot.age}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Story */}
              {selectedParrot.story && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Lugu</h3>
                  {(() => {
                    const storyId = selectedParrot.id || selectedParrot.name
                    const isExpanded = expandedStories[storyId] || false
                    const maxLength = 200
                    const shouldTruncate = selectedParrot.story.length > maxLength
                    const displayText = shouldTruncate && !isExpanded 
                      ? selectedParrot.story.substring(0, maxLength) + '...'
                      : selectedParrot.story
                    
                    return (
                      <>
                        <p className="text-gray-700 leading-relaxed">{displayText}</p>
                        {shouldTruncate && (
                          <button
                            onClick={() => setExpandedStories(prev => ({
                              ...prev,
                              [storyId]: !isExpanded
                            }))}
                            className="mt-3 text-green-600 hover:text-green-700 font-semibold transition-colors"
                          >
                            {isExpanded ? 'Näita vähem' : 'Loe rohkem'}
                          </button>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Personality */}
              {selectedParrot.personality && selectedParrot.personality.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Iseloom</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedParrot.personality.map((trait: string, i: number) => (
                      <span 
                        key={i}
                        className="bg-gradient-to-r from-green-100 to-blue-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites */}
              {selectedParrot.favorites && selectedParrot.favorites.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Lemmikud</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedParrot.favorites.map((fav: string, i: number) => (
                      <li key={i}>{fav}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sponsorship Info */}
              {selectedParrot.sponsorship && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Ristiisa programm</h3>
                  {selectedParrot.sponsorship.status === 'sponsored' ? (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-gray-800">{selectedParrot.sponsorship.monthlyAmount}/kuus</span>
                        <span className="text-green-600 font-medium flex items-center">
                          <Check className="w-5 h-5 mr-2" />
                          Toetatav
                        </span>
                      </div>
                      {selectedParrot.sponsorship.sponsorName && (
                        <p className="text-gray-700 mb-4">
                          Ristiisa: <strong className="text-gray-900">{selectedParrot.sponsorship.sponsorName}</strong>
                        </p>
                      )}
                      {selectedParrot.sponsorship.needs && (
                        <p className="text-gray-600 text-sm mb-4">{selectedParrot.sponsorship.needs}</p>
                      )}
                      <a
                        href={`/ristiisa-programm?parrot=${encodeURIComponent(selectedParrot.name)}`}
                        className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Vaata programmi
                      </a>
                    </div>
                  ) : selectedParrot.sponsorship.status === 'pending' ? (
                    <div className="bg-yellow-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-gray-800">{selectedParrot.sponsorship.monthlyAmount}/kuus</span>
                        <span className="text-yellow-600 font-medium">Ootel</span>
                      </div>
                      {selectedParrot.sponsorship.needs && (
                        <p className="text-gray-600 text-sm mb-4">{selectedParrot.sponsorship.needs}</p>
                      )}
                      <a
                        href={`/ristiisa-programm?parrot=${encodeURIComponent(selectedParrot.name)}`}
                        className="block w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-center"
                      >
                        Liigu järjekorda
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-green-600">{selectedParrot.sponsorship.monthlyAmount}/kuus</span>
                        <span className="text-green-600 font-medium flex items-center">
                          <Heart className="w-5 h-5 mr-2 fill-current" />
                          Vaba
                        </span>
                      </div>
                      {selectedParrot.sponsorship.needs && (
                        <p className="text-gray-600 text-sm mb-4">{selectedParrot.sponsorship.needs}</p>
                      )}
                      <a
                        href={`/ristiisa-programm?parrot=${encodeURIComponent(selectedParrot.name)}`}
                        className="block w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-center"
                      >
                        Hakka ristiisaks
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured Parrots - Kompaktne grid */}
        {filteredParrots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredParrots.map((parrot, index) => (
            <div key={parrot.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              
              {/* Image - väiksem */}
              <div className="relative h-48">
                {parrot.image ? (
                  <Image
                    src={parrot.image}
                    alt={`${parrot.name} - ${parrot.species}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                    <span className="text-4xl">🦜</span>
                  </div>
                )}
                
                {/* Sponsorship Status Badge */}
                <div className="absolute bottom-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(parrot.sponsorship.status).bg} ${getStatusColor(parrot.sponsorship.status).text} ${getStatusColor(parrot.sponsorship.status).border} border backdrop-blur-sm`}>
                    {getStatusText(parrot.sponsorship.status)}
                  </div>
                </div>
              </div>

              {/* Content - kompaktne */}
              <div className="p-4">
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-gray-800 mb-1 truncate">{parrot.name}</h2>
                  <p className="text-xs text-gray-500 italic truncate">{parrot.species}</p>
                  {parrot.age && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{parrot.age}</span>
                    </div>
                  )}
                </div>

                {/* Personality - kompaktne */}
                {parrot.personality && parrot.personality.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {parrot.personality.slice(0, 3).map((trait: string, i: number) => (
                        <span 
                          key={i}
                          className="bg-gradient-to-r from-green-100 to-blue-100 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                        >
                          {trait}
                        </span>
                      ))}
                      {parrot.personality.length > 3 && (
                        <span className="text-xs text-gray-500">+{parrot.personality.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Detail View Button */}
                <div className="mb-3">
                  <button
                    onClick={() => setSelectedParrot(parrot)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Vaata detailsemalt
                  </button>
                </div>

                {/* Sponsorship Info - kompaktne */}
                {parrot.sponsorship.status === 'pending' && (
                  <div className="border-t pt-3">
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-800">{parrot.sponsorship.monthlyAmount}/kuus</span>
                        <span className="text-yellow-600 font-medium text-xs">Ootel</span>
                      </div>
                      <a
                        href={`/ristiisa-programm?parrot=${encodeURIComponent(parrot.name)}`}
                        className="block w-full bg-yellow-500 text-white py-1.5 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-center text-xs"
                      >
                        Liigu järjekorda
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-lg">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Tulemusi ei leitud</h3>
              <p className="text-gray-600 mb-6">
                Proovi muuta otsingut või filtreid, et leida otsitavat papagoid.
              </p>
              <button
                onClick={() => {
                  setNameFilter('all')
                  setSpeciesFilter('all')
                  setFilter('all')
                }}
                className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
              >
                Tühjenda filtrid
              </button>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Meie keskuses elab palju rohkem!
          </h2>
          <div className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            <p className="font-medium text-gray-700">
              🐾 Lisaks papagoidele elab meie keskuses üle 50 merisiga erinevatest tõugudest. 
              Külastuse ajal saate neid toita ja paitada - see on unustamatu kogemus kõigile vanuseastmetele!
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-red-500 fill-current mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Soovite aidata kaasa?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Ristivanema programm võimaldab teil luua erilise side mõne meie papagaiga ja aidata kaasa tema heaolule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/ristiisa-programm"
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Tutvu programmiga
              </a>
              <a
                href="/broneeri"
                className="text-green-600 border-2 border-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Broneeri külastus
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
