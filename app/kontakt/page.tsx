
import { MapPin, Phone, Mail, Clock, MessageSquare, Calendar, Navigation, ExternalLink } from 'lucide-react'
import ContactForm from './_components/contact-form'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt - Papagoi Keskus Tartus | Broneeri külastus',
  description: 'Võtke Papagoi Keskusega ühendust Tartus. Kontaktandmed, broneerimisinfo ja korduma kippuvad küsimused. Helistage +372 512 7938 või broneerige külastus veebis.',
  keywords: 'Papagoi Keskus kontakt, broneeri külastus Tartus, Papagoi Keskus telefon, Papagoi Keskus aadress',
}

const faqs = [
  {
    question: 'Kus asub Papagoi Keskus?',
    answer: 'Meie keskus asub aadressil Tartu mnt 80, Soinaste, Kambja vald, Tartumaa 61709. See on turvaline ja rahulik eraomanduses asuv keskkond meie papagoidele.'
  },
  {
    question: 'Kas saab tulla ilma broneeringuta?',
    answer: 'Kahjuks ei. Kõik külastused toimuvad AINULT eelneval kokkuleppel. See tagab, et saate parimat teenindust ja meie papagoid on külalisteks valmis.'
  },
  {
    question: 'Kui palju aega külastus kestab?',
    answer: 'Tavaliselt ca 1 tund. Programm on kohandatud teie grupi vajaduste järgi.'
  },
  {
    question: 'Kas saab papagoidele toitu anda?',
    answer: 'Ainult meie loa ja järelevalve all. Igal papagоil on spetsiaalne dieet ja me anname täpsed juhised külastuse ajal.'
  },
  {
    question: 'Kas keskus sobib ka väikestele lastele?',
    answer: 'Jah! Meie keskus on peresõbralik. 0-2 aastased lapsed saavad tasuta külastada ja me hoiame erilist tähelepanu väikeste laste turvalisuse.'
  },
  {
    question: 'Kuidas külastust tühistada?',
    answer: 'Palun teavitage meid vähemalt 24 tundi ette. Nii saame ümber planeerida ja pakkuda teile teist sobivat aega.'
  }
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Kontakt</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Võtke meiega ühendust broneeringu tegemiseks või küsimuste esitamiseks. 
            Vastame teile võimalikult kiiresti!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Contact Information */}
          <div className="space-y-8">
            
            {/* Contact Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Kontaktandmed</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Telefon</h3>
                    <a
                      href="tel:+3725127938" 
                      className="text-gray-600 hover:text-green-600 transition-colors mb-2 block font-medium"
                    >
                      +372 512 7938
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">E-post</h3>
                    <a 
                      href="mailto:keskus@papagoi.ee" 
                      className="text-gray-600 hover:text-blue-600 transition-colors mb-2 block font-medium"
                    >
                      keskus@papagoi.ee
                    </a>
                    <p className="text-sm text-gray-500">Vastame 24 tunni jooksul</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Asukoht</h3>
                    <div className="text-gray-600 mb-2">
                      <div>Tartu mnt 80, Soinaste</div>
                      <div>Kambja vald, Tartumaa</div>
                      <div>61709, Eesti</div>
                    </div>
                    <a 
                      href="https://maps.google.com/?q=Tartu+mnt+80,+Soinaste,+Kambja+vald,+Tartumaa+61709,+Eesti"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 transition-colors font-medium"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Vaata Google Maps'is
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Lahtiolekuajad</h3>
                    <p className="text-gray-600 mb-2">E-P (esmaspäevast pühapäevani) 12-18</p>
                    <p className="text-sm text-gray-500">Igal täistunnil, ainult eelneval kokkuleppel</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>

        {/* Quick Actions - Full Width */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-4 text-center">Kiired toimingud</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/broneeri"
                className="flex items-center justify-center bg-white/20 rounded-2xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="text-center">
                  <p className="font-semibold">Broneeri külastus</p>
                  <p className="text-xs opacity-80">Vali sobiv aeg ja täida vorm</p>
                </div>
              </a>
              
              <a
                href="#faqs"
                className="flex items-center justify-center bg-white/20 rounded-2xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="text-center">
                  <p className="font-semibold">Vaata KKK</p>
                  <p className="text-xs opacity-80">Levinumad küsimused ja vastused</p>
                </div>
              </a>

              <a
                href="/kulastajatele"
                className="flex items-center justify-center bg-white/20 rounded-2xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="text-center">
                  <p className="font-semibold">Külastajate info</p>
                  <p className="text-xs opacity-80">Hinnad, reeglid ja juhised</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Jälgi meid sotsiaalvõrgustikes
          </h2>
          
          <div className="flex justify-center space-x-8">
            <a 
              href="https://www.facebook.com/PapagoiKeskus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-[#1877F2] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">Facebook</h3>
                <p className="text-sm text-gray-500">Uudised ja fotod</p>
              </div>
            </a>
            
            <a 
              href="https://www.instagram.com/papagoikeskus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-gray-50 hover:bg-pink-50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-pink-600">Instagram</h3>
                <p className="text-sm text-gray-500">Igapäevased hetked</p>
              </div>
            </a>
            
            <a 
              href="https://www.youtube.com/@PetsVillaTartu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center space-y-3 p-6 rounded-xl bg-gray-50 hover:bg-red-50 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-red-600">YouTube</h3>
                <p className="text-sm text-gray-500">Videod ja tutvustused</p>
              </div>
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div id="faqs" className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Korduma kippuvad küsimused
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
