
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-papagoi-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Logo Row with Papagoi [LOGO] Keskus */}
        <div className="flex justify-center items-center py-4 relative">
          <Link href="/" className="flex items-center space-x-4 hover:scale-105 transition-transform duration-300 group">
            {/* Papagoi text */}
            <div className="text-right">
              <h1 className="text-2xl md:text-3xl font-bold papagoi-text-gradient">Papagoi</h1>
            </div>
            
            {/* Logo with integrated slogan */}
            <Image
              src="https://cdn.abacus.ai/images/2dd96a54-c671-447e-a717-998d5712858f.png"
              alt="Papagoi Keskus - kolm kaunist papagoid oksal - Elu täis värve ja hääli"
              width={90}
              height={90}
              className="drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Keskus text */}
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold papagoi-text-gradient">Keskus</h1>
            </div>
          </Link>

          {/* Blog Link - Vertical Stack Left Side */}
          <div className="hidden md:flex absolute left-0 top-2 flex-col space-y-2">
            <Link 
              href="/blogi" 
              className="group hover:scale-110 transition-transform duration-300"
              title="Blogi"
            >
              <div className="bg-gradient-to-b from-green-600 to-blue-600 rounded-full px-2 py-3 shadow-sm group-hover:shadow-md flex flex-col items-center justify-center">
                <div className="text-white text-xs font-bold leading-none space-y-0.5">
                  <div className="text-center">B</div>
                  <div className="text-center">L</div>
                  <div className="text-center">O</div>
                  <div className="text-center">G</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Social Media Icons - Vertical Stack Right Side */}
          <div className="hidden md:flex absolute right-0 top-2 flex-col space-y-2">
            <a 
              href="https://www.facebook.com/PapagoiKeskus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group hover:scale-110 transition-transform duration-300"
              title="Facebook"
            >
              <div className="w-6 h-6 bg-[#1877F2] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
            </a>
            <a 
              href="https://www.instagram.com/papagoikeskus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group hover:scale-110 transition-transform duration-300"
              title="Instagram"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.7 13.6 3.7 12.017c0-1.584.498-2.879 1.426-3.706.927-.827 2.078-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.928.827 1.426 2.122 1.426 3.706 0 1.583-.498 2.878-1.426 3.705-.875.807-2.026 1.266-3.323 1.266zm7.54 0c-1.297 0-2.448-.49-3.323-1.297-.928-.827-1.426-2.122-1.426-3.705 0-1.584.498-2.879 1.426-3.706.875-.807 2.026-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.928.827 1.426 2.122 1.426 3.706 0 1.583-.498 2.878-1.426 3.705-.875.807-2.026 1.266-3.323 1.266z"/>
                </svg>
              </div>
            </a>
            <a 
              href="https://www.youtube.com/@PetsVillaTartu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group hover:scale-110 transition-transform duration-300"
              title="YouTube"
            >
              <div className="w-6 h-6 bg-[#FF0000] rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
            </a>
          </div>

          {/* Mobile menu button - positioned absolute to top-right */}
          <div className="md:hidden absolute right-0 top-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-deep-anthracite hover:text-papagoi-green focus:outline-none transition-colors duration-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Menu Row - centered below logo - UUS LIHTSUSTATUD VERSIOON */}
        <div className="hidden md:flex justify-center items-center space-x-6 lg:space-x-8 pb-4 border-t border-papagoi-green/10 pt-4">
          <Link href="/" className="text-deep-anthracite hover:text-papagoi-green font-medium transition-all duration-300 hover:scale-105 hover:font-semibold">
            Avaleht
          </Link>
          <Link href="/teenused" className="text-deep-anthracite hover:text-papagoi-green font-medium transition-all duration-300 hover:scale-105 hover:font-semibold">
            Teenused
          </Link>
          <Link href="/meist" className="text-deep-anthracite hover:text-papagoi-blue font-medium transition-all duration-300 hover:scale-105 hover:font-semibold">
            Meist
          </Link>
          <Link href="/papagoid" className="text-deep-anthracite hover:text-papagoi-green font-medium transition-all duration-300 hover:scale-105 hover:font-semibold">
            Meie papagoid
          </Link>
          <Link href="/kulastajatele" className="text-deep-anthracite hover:text-papagoi-orange font-medium transition-all duration-300 hover:scale-105 hover:font-semibold">
            Külastajatele
          </Link>
          <Link href="/broneeri" className="text-deep-anthracite hover:text-papagoi-orange font-medium transition-all duration-300 hover:scale-105 hover:font-semibold">
            Broneeri
          </Link>
          <Link href="/kontakt" className="text-deep-anthracite hover:text-papagoi-green font-medium transition-all duration-300 hover:scale-105 hover:font-semibold">
            Kontakt
          </Link>
        </div>

        {/* Mobile Navigation - UUS LIHTSUSTATUD VERSIOON */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 bg-white/80 backdrop-blur-md rounded-b-lg border-t border-papagoi-green/20">
            <Link 
              href="/" 
              className="block px-3 py-2 text-deep-anthracite hover:text-papagoi-green font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Avaleht
            </Link>
            <Link 
              href="/teenused" 
              className="block px-3 py-2 text-deep-anthracite hover:text-papagoi-green font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Teenused
            </Link>
            <Link 
              href="/meist" 
              className="block px-3 py-2 text-deep-anthracite hover:text-papagoi-blue font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Meist
            </Link>
            <Link 
              href="/papagoid" 
              className="block px-3 py-2 text-deep-anthracite hover:text-papagoi-green font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Meie papagoid
            </Link>
            <Link 
              href="/kulastajatele" 
              className="block px-3 py-2 text-deep-anthracite hover:text-papagoi-orange font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Külastajatele
            </Link>
            <Link 
              href="/broneeri" 
              className="block px-3 py-2 text-deep-anthracite hover:text-papagoi-orange font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Broneeri
            </Link>
            <Link 
              href="/kontakt" 
              className="block px-3 py-2 text-deep-anthracite hover:text-papagoi-green font-medium transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Kontakt
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
