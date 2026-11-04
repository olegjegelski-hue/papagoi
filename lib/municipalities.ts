/** Vallad, kes toetavad külastust. Tühi massiiv = lehel nimekirja ei ole. Uus vald = üks rida. */

export type MunicipalitySupport = {
  id: string
  name: string
  status: string
  description: string
  url?: string
}

export const MUNICIPALITIES: MunicipalitySupport[] = []
