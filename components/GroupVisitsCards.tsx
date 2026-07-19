import { Clock, Euro, Users, GraduationCap, Building, Heart } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

/** Neli grupikülastuse kaarti (koolid, ettevõtted, perekonnad, erivajadused). */
export default async function GroupVisitsCards() {
  const t = await getTranslations('KulastajatelePage')
  const schoolProgramLi = t.raw('schoolProgramLi') as string[]
  const companyProgramLi = t.raw('companyProgramLi') as string[]
  const familiesProgramLi = t.raw('familiesProgramLi') as string[]
  const specialProgramLi = t.raw('specialProgramLi') as string[]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card text-card-foreground border rounded-2xl shadow-xl overflow-hidden border border-papagoi-green/10">
        <div className="bg-papagoi-green p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">{t('schoolTitle')}</h3>
              <p className="text-lg opacity-90">{t('schoolSubtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('groupSizeLabel')}</p>
              <p className="text-sm font-semibold">{t('schoolSize')}</p>
            </div>
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('durationLabel')}</p>
              <p className="text-sm font-semibold">{t('schoolDuration')}</p>
            </div>
            <div className="text-center">
              <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('priceLabel')}</p>
              <p className="text-sm font-semibold">{t('schoolPrice')}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h4 className="font-bold text-deep-anthracite mb-4">{t('programContains')}</h4>
          <ul className="space-y-2">
            {schoolProgramLi.map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-papagoi-green rounded-full mt-2 flex-shrink-0" />
                <span className="text-deep-anthracite/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-card text-card-foreground border rounded-2xl shadow-xl overflow-hidden border border-papagoi-blue/10">
        <div className="bg-papagoi-blue p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <Building className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">{t('companyTitle')}</h3>
              <p className="text-lg opacity-90">{t('companySubtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('groupSizeLabel')}</p>
              <p className="text-sm font-semibold">{t('companySize')}</p>
            </div>
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('durationLabel')}</p>
              <p className="text-sm font-semibold">{t('companyDuration')}</p>
            </div>
            <div className="text-center">
              <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('priceLabel')}</p>
              <p className="text-sm font-semibold">{t('companyPrice')}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h4 className="font-bold text-deep-anthracite mb-4">{t('programContains')}</h4>
          <ul className="space-y-2">
            {companyProgramLi.map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-papagoi-blue rounded-full mt-2 flex-shrink-0" />
                <span className="text-deep-anthracite/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-card text-card-foreground border rounded-2xl shadow-xl overflow-hidden border border-papagoi-orange/10">
        <div className="bg-papagoi-orange p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <Users className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">{t('familiesTitle')}</h3>
              <p className="text-lg opacity-90">{t('familiesSubtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('groupSizeLabel')}</p>
              <p className="text-sm font-semibold">{t('familiesSize')}</p>
            </div>
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('durationLabel')}</p>
              <p className="text-sm font-semibold">{t('familiesDuration')}</p>
            </div>
            <div className="text-center">
              <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('priceLabel')}</p>
              <p className="text-sm font-semibold">{t('familiesPrice')}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h4 className="font-bold text-deep-anthracite mb-4">{t('programContains')}</h4>
          <ul className="space-y-2">
            {familiesProgramLi.map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-papagoi-orange rounded-full mt-2 flex-shrink-0" />
                <span className="text-deep-anthracite/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-card text-card-foreground border rounded-2xl shadow-xl overflow-hidden border border-papagoi-red/10">
        <div className="bg-papagoi-red p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <Heart className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">{t('specialTitle')}</h3>
              <p className="text-lg opacity-90">{t('specialSubtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('groupSizeLabel')}</p>
              <p className="text-sm font-semibold">{t('specialSize')}</p>
            </div>
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('durationLabel')}</p>
              <p className="text-sm font-semibold">{t('specialDuration')}</p>
            </div>
            <div className="text-center">
              <Euro className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xs opacity-80">{t('priceLabel')}</p>
              <p className="text-sm font-semibold">{t('specialPrice')}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h4 className="font-bold text-deep-anthracite mb-4">{t('programContains')}</h4>
          <ul className="space-y-2">
            {specialProgramLi.map((item, i) => (
              <li key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-papagoi-red rounded-full mt-2 flex-shrink-0" />
                <span className="text-deep-anthracite/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
