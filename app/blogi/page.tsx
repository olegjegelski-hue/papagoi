
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blogi | Papagoi Keskus',
  description: 'Loe meie blogi papagoidest, nende hooldamisest ja igapäevaelust Papagoi Keskuses',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold papagoi-text-gradient mb-6">
            Meie Blogi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Loe huvitavaid lugusid meie papagoidest, nende igapäevaelust ja hooldamisest. 
            Jagame ka kasulikke nõuandeid ja põnevaid seiklusi Papagoi Keskusest.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Blogi tuleb varsti!
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Meie blogi on hetkel ettevalmistamisel. Varsti saate siin lugeda:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-2">Papagoi lood</h3>
                <p className="text-sm text-gray-600">Huvitavad seiklused ja lood meie papagoidest</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-2">Hooldussoovitused</h3>
                <p className="text-sm text-gray-600">Kasulikud nõuanded papagoidega suhtlemiseks</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-2">Keskuse uudised</h3>
                <p className="text-sm text-gray-600">Värske info meie tegevustest ja sündmustest</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-2">Külastajate lood</h3>
                <p className="text-sm text-gray-600">Meeldejäävad kogemused ja tagasiside</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-500 mb-6">
                Jälgige meie sotsiaalmeedia kanaleid värskete uudiste jaoks!
              </p>
              
              <div className="flex justify-center space-x-4">
                <a 
                  href="https://www.facebook.com/PapagoiKeskus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1877F2] text-white px-6 py-3 rounded-full hover:scale-105 transition-transform duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
                
                <a 
                  href="https://www.instagram.com/papagoikeskus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.7 13.6 3.7 12.017c0-1.584.498-2.879 1.426-3.706.927-.827 2.078-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.928.827 1.426 2.122 1.426 3.706 0 1.583-.498 2.878-1.426 3.705-.875.807-2.026 1.266-3.323 1.266zm7.54 0c-1.297 0-2.448-.49-3.323-1.297-.928-.827-1.426-2.122-1.426-3.705 0-1.584.498-2.879 1.426-3.706.875-.807 2.026-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.928.827 1.426 2.122 1.426 3.706 0 1.583-.498 2.878-1.426 3.705-.875.807-2.026 1.266-3.323 1.266z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
