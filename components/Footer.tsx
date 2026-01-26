
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-deep-anthracite text-white border-t-4 border-papagoi-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/logo.png"
                alt="Papagoi Keskus"
                width={50}
                height={50}
                className="rounded-lg shadow-lg border-2 border-papagoi-green/20"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Papagoi Keskus</h3>
                <p className="papagoi-text-gradient font-medium">Elu täis värve ja hääli</p>
              </div>
            </div>
            <p className="text-warm-gray-300 mb-6 max-w-md leading-relaxed">
              Eesti esimene Papagoi Keskus, mis tegutseb aastast 2015.
              Tule tutvuge meie värvilise perekonnaga ja koge midagi erilist!
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a 
                href="https://www.facebook.com/PapagoiKeskus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group hover:scale-110 transition-transform duration-300"
              >
                <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </a>
              <a 
                href="https://www.instagram.com/papagoikeskus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group hover:scale-110 transition-transform duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
              <a 
                href="https://www.youtube.com/@PetsVillaTartu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group hover:scale-110 transition-transform duration-300"
              >
                <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-papagoi-green">Kiirlingid</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-warm-gray-300 hover:text-papagoi-green transition-colors duration-300">
                  Avaleht
                </Link>
              </li>
              <li>
                <Link href="/teenused" className="text-warm-gray-300 hover:text-papagoi-green transition-colors duration-300">
                  Teenused
                </Link>
              </li>
              <li>
                <Link href="/meist" className="text-warm-gray-300 hover:text-papagoi-blue transition-colors duration-300">
                  Meist
                </Link>
              </li>
              <li>
                <Link href="/papagoid" className="text-warm-gray-300 hover:text-papagoi-green transition-colors duration-300">
                  Meie papagoid
                </Link>
              </li>
              <li>
                <Link href="/kulastajatele" className="text-warm-gray-300 hover:text-papagoi-orange transition-colors duration-300">
                  Külastajatele
                </Link>
              </li>
              <li>
                <Link href="/broneeri" className="text-warm-gray-300 hover:text-papagoi-orange transition-colors duration-300">
                  Broneeri
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-warm-gray-300 hover:text-papagoi-green transition-colors duration-300">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-papagoi-blue">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-papagoi-green mt-0.5 flex-shrink-0" />
                <div className="text-warm-gray-300">
                  <div>Tartu mnt 80, Soinaste</div>
                  <div>Kambja vald, Tartumaa</div>
                  <div>61709, Eesti</div>
                  <a 
                    href="https://maps.google.com/?q=Tartu+mnt+80,+Soinaste,+Kambja+vald,+Tartumaa+61709,+Eesti"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-papagoi-green hover:text-papagoi-blue transition-colors duration-300 mt-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Vaata kaardil
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-papagoi-blue" />
                <a 
                  href="tel:+37251279338" 
                  className="text-warm-gray-300 hover:text-papagoi-blue transition-colors duration-300"
                >
                  +372 51 27 938
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-papagoi-yellow" />
                <a 
                  href="mailto:keskus@papagoi.ee" 
                  className="text-warm-gray-300 hover:text-papagoi-yellow transition-colors duration-300"
                >
                  keskus@papagoi.ee
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-5 h-5 text-papagoi-orange mt-0.5" />
                <div className="text-warm-gray-300">
                  <div>Ainult eelneval kokkuleppel</div>
                  <div className="text-sm text-warm-gray-400">Broneerimine vajalik</div>
                </div>
              </li>
            </ul>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="border-t border-papagoi-green/20 pt-6">
          <p className="text-warm-gray-400 text-sm text-center">
            © 2015 - {new Date().getFullYear()} Papagoi Keskus. Kõik õigused kaitstud.
          </p>
        </div>
      </div>
    </footer>
  )
}
