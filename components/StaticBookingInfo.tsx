
'use client'
import { useEffect, useMemo, useState } from 'react'
import { addMinutes, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, isToday, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { et } from 'date-fns/locale'
import { toast } from 'sonner'
import { Phone, Mail, Calendar, Users, Clock, Euro, AlertCircle } from 'lucide-react'

export default function StaticBookingInfo() {
  const currentMonth = startOfMonth(new Date())
  const [monthDate, setMonthDate] = useState(() => currentMonth)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [hasConsent, setHasConsent] = useState(false)
  const [bookingsByDate, setBookingsByDate] = useState<
    Record<string, { time: string; guests: number | null }[]>
  >({})
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    groupSize: '',
    groupType: '',
    message: '',
    website: '',
  })
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthDate, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 }),
  })
  const canGoBack = isAfter(monthDate, currentMonth)
  const timeSlots = Array.from({ length: 9 }, (_, index) => `${String(10 + index).padStart(2, '0')}:00`)
  const selectedDateValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const getVisibleBookingsForDate = (date: Date, entries: { time: string; guests: number | null }[]) => {
    const now = new Date()
    if (!isSameDay(date, now)) return entries
    return entries.filter((entry) => {
      if (!/^\d{2}:\d{2}$/.test(entry.time)) return true
      const [hour, minute] = entry.time.split(':').map(Number)
      const slotStart = new Date(date)
      slotStart.setHours(hour, minute, 0, 0)
      const cutoff = addMinutes(slotStart, -30)
      return isBefore(now, cutoff)
    })
  }

  const isTodayClosedForBooking = () => {
    const now = new Date()
    const lastSlot = new Date(now)
    lastSlot.setHours(18, 0, 0, 0)
    const cutoff = addMinutes(lastSlot, -30)
    return !isBefore(now, cutoff)
  }

  const bookedEntriesForSelectedDate = useMemo(() => {
    if (!selectedDateValue || !selectedDate) return []
    const entries = bookingsByDate[selectedDateValue] || []
    return getVisibleBookingsForDate(selectedDate, entries)
  }, [bookingsByDate, selectedDate, selectedDateValue])

  useEffect(() => {
    if (!selectedDate) return
    if (isSameDay(selectedDate, new Date()) && isTodayClosedForBooking()) {
      setSelectedDate(null)
      setSelectedTime(null)
    }
  }, [selectedDate])
  const bookedTimesForSelectedDate = useMemo(
    () => bookedEntriesForSelectedDate.map((entry) => entry.time),
    [bookedEntriesForSelectedDate]
  )
  const selectedBookingEntry = useMemo(
    () => bookedEntriesForSelectedDate.find((entry) => entry.time === selectedTime) || null,
    [bookedEntriesForSelectedDate, selectedTime]
  )
  const minGroupSize = selectedBookingEntry ? 1 : 3
  const remainingSeats = useMemo(() => {
    if (!selectedTime) return 20
    if (!selectedBookingEntry) return 20
    if (selectedBookingEntry.guests === null) return null
    return Math.max(0, 20 - selectedBookingEntry.guests)
  }, [selectedBookingEntry, selectedTime])
  const restBlockedTimes = useMemo(() => {
    return bookedTimesForSelectedDate
      .filter((time) => /^\d{2}:\d{2}$/.test(time))
      .flatMap((time) => {
        const [hour] = time.split(':')
        const currentHour = Number(hour)
        const nextHour = currentHour + 1
        const prevHour = currentHour - 1
        return [
          `${String(prevHour).padStart(2, '0')}:00`,
          `${String(nextHour).padStart(2, '0')}:00`,
        ]
      })
      .filter((time) => timeSlots.includes(time))
  }, [bookedTimesForSelectedDate, timeSlots])
  const visibleTimeSlots = useMemo(() => {
    if (!selectedDate) return []
    const now = new Date()
    const isSelectedToday = isSameDay(selectedDate, now)
    return timeSlots.filter((time) => {
      if (restBlockedTimes.includes(time)) return false
      const [hour, minute] = time.split(':').map(Number)
      const slotStart = new Date(selectedDate)
      slotStart.setHours(hour, minute, 0, 0)
      if (isBefore(slotStart, now)) return false
      if (!isSelectedToday) return true
      const cutoff = addMinutes(slotStart, -30)
      return isBefore(now, cutoff)
    })
  }, [restBlockedTimes, selectedDate, timeSlots])

  const isJoinableTime = (time: string) => {
    if (!selectedDate) return false
    if (!/^\d{2}:\d{2}$/.test(time)) return false
    const now = new Date()
    const [hour, minute] = time.split(':').map(Number)
    const slotStart = new Date(selectedDate)
    slotStart.setHours(hour, minute, 0, 0)
    if (isBefore(slotStart, now)) return false
    if (!isSameDay(selectedDate, now)) return true
    const cutoff = addMinutes(slotStart, -30)
    return isBefore(now, cutoff)
  }
  const handleTimeClick = (time: string) => {
    if (!selectedDate) return
    setSelectedTime(time)
  }
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const normalizeEstonianPhone = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return ''
    if (trimmed === '+') return '+'
    const digits = trimmed.replace(/\D/g, '')
    if (!digits) return '+372'
    if (digits.startsWith('372')) {
      return `+${digits}`
    }
    return `+372${digits}`
  }
  useEffect(() => {
    let isMounted = true
    const loadBookings = async () => {
      setIsLoadingBookings(true)
      try {
        const response = await fetch('/api/notion/visits')
        const data = await response.json()
        if (!isMounted) return
        const grouped: Record<string, Record<string, number | null>> = {}
        const bookings = Array.isArray(data?.bookings) ? data.bookings : []
        bookings.forEach((booking: { date?: string; time?: string | null; guests?: number | null }) => {
          if (!booking?.date) return
          const key = booking.date.split('T')[0]
          if (!grouped[key]) grouped[key] = {}
          const timeKey = booking.time || 'Määramata'
          const guestsValue = Number.isFinite(booking.guests) ? Number(booking.guests) : null
          if (!(timeKey in grouped[key])) {
            grouped[key][timeKey] = guestsValue
          } else if (grouped[key][timeKey] !== null && guestsValue !== null) {
            grouped[key][timeKey] = (grouped[key][timeKey] || 0) + guestsValue
          } else {
            grouped[key][timeKey] = null
          }
        })
        const normalized: Record<string, { time: string; guests: number | null }[]> = {}
        Object.keys(grouped).forEach((key) => {
          normalized[key] = Object.entries(grouped[key])
            .map(([time, guests]) => ({ time, guests }))
            .sort((a, b) => {
              if (a.time === 'Määramata') return 1
              if (b.time === 'Määramata') return -1
              return a.time.localeCompare(b.time)
            })
        })
        setBookingsByDate(normalized)
      } catch (error) {
        console.error('Broneeringute laadimine ebaõnnestus', error)
      } finally {
        if (isMounted) setIsLoadingBookings(false)
      }
    }
    loadBookings()
    return () => {
      isMounted = false
    }
  }, [])
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedDate || !selectedTime) return
    const groupSizeNum = Number(formData.groupSize)
    if (!Number.isFinite(groupSizeNum) || groupSizeNum <= 0) {
      toast.error('Palun sisestage inimeste arv')
      return
    }
    if (remainingSeats !== null && groupSizeNum > remainingSeats) {
      toast.error(`Vabu kohti on ainult ${remainingSeats} inimest`)
      return
    }
    if (!hasConsent) {
      setSubmitMessage('Palun kinnitage nõusolek andmete kasutamiseks.')
      return
    }
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: selectedDateValue,
          timeSlot: selectedTime,
          joinExisting: Boolean(selectedBookingEntry),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitMessage(result.message || 'Broneering edukalt esitatud!')
        setFormData({
          name: '',
          email: '',
          phone: '',
          groupSize: '',
          groupType: '',
          message: '',
          website: '',
        })
        setHasConsent(false)
        setSelectedTime(null)
      } else {
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : result?.error?.message || 'Broneeringu saatmisel tekkis viga'
        setSubmitMessage(errorMessage)
      }
    } catch (error) {
      setSubmitMessage('Võrguühenduse viga. Palun proovige uuesti.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-papagoi-green/10">
      <h2 className="text-2xl font-bold text-deep-anthracite mb-8">Broneerimine</h2>
      
      {/* Important Notice */}
      <div className="bg-papagoi-yellow-100 border-l-4 border-papagoi-yellow-500 rounded-r-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <AlertCircle className="w-6 h-6 text-papagoi-yellow-600" />
          <h3 className="text-lg font-semibold text-papagoi-yellow-800">⚠️ OLULINE!</h3>
        </div>
        <div className="text-papagoi-yellow-700 space-y-2">
          <p><strong>Külastused toimuvad AINULT eelneval kokkuleppel!</strong></p>
          <p>Ilma broneeringuta ei saa meid külastada.</p>
        </div>
      </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl p-6 border border-papagoi-green/20 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-deep-anthracite">Kalender</h3>
              <p className="text-sm text-warm-gray-600">
                {format(monthDate, 'MMMM yyyy', { locale: et })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canGoBack && (
                <button
                  type="button"
                  onClick={() => setMonthDate(currentMonth)}
                  className="px-4 py-2 rounded-full border border-papagoi-green text-papagoi-green text-sm font-semibold hover:bg-papagoi-green/10 transition-colors"
                >
                  Tagasi jooksva kuu juurde
                </button>
              )}
              <button
                type="button"
                onClick={() => setMonthDate((current) => addMonths(current, 1))}
                className="px-4 py-2 rounded-full bg-papagoi-green text-white text-sm font-semibold hover:bg-papagoi-green/90 transition-colors"
              >
                Järgmine kuu
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-warm-gray-500 mb-2">
            {['E', 'T', 'K', 'N', 'R', 'L', 'P'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, monthDate)
              const isTodayDate = isToday(day)
              const isSelected = selectedDate ? format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') : false
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayBookings = bookingsByDate[dateKey] || []
              const hasBookings = Boolean(getVisibleBookingsForDate(day, dayBookings).length)
              const isPastDate = isBefore(startOfDay(day), startOfDay(new Date()))
              const isTodayClosed = isSameDay(day, new Date()) && isTodayClosedForBooking()

              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => {
                    if (isPastDate || isTodayClosed) return
                    setSelectedDate(day)
                    setSelectedTime(null)
                  }}
                  disabled={isPastDate || isTodayClosed}
                  className={[
                    'h-10 rounded-lg flex items-center justify-center text-sm border transition-colors',
                    isPastDate || isTodayClosed
                      ? 'text-warm-gray-300 border-warm-gray-200 cursor-not-allowed'
                      : isCurrentMonth
                        ? 'text-deep-anthracite border-papagoi-green/20 hover:bg-papagoi-green/10'
                        : 'text-warm-gray-400 border-papagoi-green/10 hover:bg-papagoi-green/5',
                    isTodayDate ? 'bg-papagoi-green text-white border-papagoi-green' : 'bg-white',
                    isSelected && !isTodayDate ? 'bg-papagoi-green/20 border-papagoi-green text-deep-anthracite' : '',
                  ].join(' ')}
                >
                  <span className="relative">
                    {format(day, 'd')}
                    {hasBookings && (
                      <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-papagoi-orange" />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-6 border-t border-warm-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-deep-anthracite">Valitud kuupäev</h4>
                  <p className="text-sm text-warm-gray-600">
                    {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: et })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-sm text-warm-gray-500 hover:text-warm-gray-700"
                >
                  Sulge
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-papagoi-blue/20 bg-papagoi-blue/10 p-3 text-sm text-deep-anthracite">
                <span className="font-semibold">NB!</span> Tavakülastused iga päev 12:00-18:00.
                Varasemad kellaajad ainult eelneval kokkuleppel!
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {visibleTimeSlots.map((time) => {
                  const isActive = selectedTime === time
                  const isBooked = bookedTimesForSelectedDate.includes(time)
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeClick(time)}
                      disabled={isBooked}
                      className={[
                        'px-4 py-2 rounded-lg border font-semibold transition-colors',
                        isBooked ? 'border-warm-gray-200 text-warm-gray-400 bg-warm-gray-50 cursor-not-allowed' : '',
                        isActive
                          ? 'bg-papagoi-green text-white border-papagoi-green'
                          : 'border-papagoi-green/30 text-papagoi-green hover:bg-papagoi-green hover:text-white',
                      ].join(' ')}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>

              {bookedEntriesForSelectedDate.length > 0 && (
                <div className="mt-4 rounded-lg border border-papagoi-orange/30 bg-papagoi-orange/10 p-4">
                  <p className="text-sm font-semibold text-deep-anthracite mb-2">Broneeritud ajad</p>
                  <div className="space-y-2">
                    {bookedEntriesForSelectedDate.map((entry) => {
                      const remaining = entry.guests === null ? null : Math.max(0, 20 - entry.guests)
                      const canJoin =
                        entry.time !== 'Määramata' &&
                        remaining !== null &&
                        remaining > 0 &&
                        isJoinableTime(entry.time)
                      return (
                        <div
                          key={entry.time}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2"
                        >
                          <span className="text-sm font-semibold text-deep-anthracite">{entry.time}</span>
                          <span className="text-xs text-warm-gray-600">
                            {remaining === null
                              ? 'Külaliste arv pole määratud'
                              : `Veel saab liituda: ${remaining} inimest`}
                          </span>
                          {canJoin && (
                            <button
                              type="button"
                              onClick={() => setSelectedTime(entry.time)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-papagoi-green text-white hover:bg-papagoi-green/90 transition-colors"
                            >
                              Liitu
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {isLoadingBookings && (
                <p className="mt-4 text-sm text-warm-gray-500">Laen broneeringuid...</p>
              )}

              {selectedTime && (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="booking-name" className="text-sm font-semibold text-deep-anthracite">
                        Nimi *
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        value={formData.name}
                        onChange={(event) => handleInputChange('name', event.target.value)}
                        placeholder="Teie nimi"
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="booking-email" className="text-sm font-semibold text-deep-anthracite">
                        E-post *
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        value={formData.email}
                        onChange={(event) => handleInputChange('email', event.target.value)}
                        placeholder="teie@email.ee"
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="booking-phone" className="text-sm font-semibold text-deep-anthracite">
                        Telefon *
                      </label>
                      <input
                        id="booking-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => handleInputChange('phone', normalizeEstonianPhone(event.target.value))}
                        onFocus={(event) => {
                          if (!event.target.value) {
                            handleInputChange('phone', '+372')
                          }
                        }}
                        placeholder="+372 ..."
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                      <p className="text-xs text-warm-gray-500">Telefon peab algama suunakoodiga +372</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="booking-group-size" className="text-sm font-semibold text-deep-anthracite">
                        Inimeste arv{minGroupSize === 3 ? ' (min 3 inimest)' : ' (min 1 inimene)'} *
                      </label>
                      <input
                        id="booking-group-size"
                        type="number"
                        min={minGroupSize}
                        max={remainingSeats ?? 50}
                        value={formData.groupSize}
                        onChange={(event) => handleInputChange('groupSize', event.target.value)}
                        placeholder="Mitu inimest?"
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                      <p className="text-xs text-warm-gray-500">
                        Minimaalne grupi suurus: {minGroupSize} {minGroupSize === 1 ? 'inimene' : 'inimest'}
                        {remainingSeats !== null ? ` • Vabu kohti: ${remainingSeats}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-deep-anthracite">Kuupäev</label>
                      <div className="rounded-lg border border-warm-gray-200 px-3 py-2 bg-warm-gray-50 text-sm text-deep-anthracite">
                        {selectedDateValue}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-deep-anthracite">Kellaaeg</label>
                      <div className="rounded-lg border border-warm-gray-200 px-3 py-2 bg-warm-gray-50 text-sm text-deep-anthracite">
                        {selectedTime}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="booking-group-type" className="text-sm font-semibold text-deep-anthracite">
                      Grupi tüüp
                    </label>
                    <select
                      id="booking-group-type"
                      value={formData.groupType}
                      onChange={(event) => handleInputChange('groupType', event.target.value)}
                      className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                    >
                      <option value="">Valige tüüp</option>
                      <option value="perevisit">Perevisit</option>
                      <option value="kool">Kool/Lasteaed</option>
                      <option value="ettevote">Ettevõte</option>
                      <option value="muu">Muu</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="booking-message" className="text-sm font-semibold text-deep-anthracite">
                      Lisainfo või soovid
                    </label>
                    <textarea
                      id="booking-message"
                      value={formData.message}
                      onChange={(event) => handleInputChange('message', event.target.value)}
                      placeholder="Kirjutage siia oma soovid, küsimused või lisainfo..."
                      rows={4}
                      className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                    />
                  </div>

                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label htmlFor="booking-website">Veebileht</label>
                    <input
                      id="booking-website"
                      type="text"
                      value={formData.website}
                      onChange={(event) => handleInputChange('website', event.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <label className="flex items-start gap-3 text-sm text-warm-gray-700">
                    <input
                      type="checkbox"
                      checked={hasConsent}
                      onChange={(event) => setHasConsent(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-warm-gray-300"
                    />
                    <span>Nõustun, et minu andmeid kasutatakse päringule vastamiseks. *</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-papagoi-green text-white font-semibold py-3 hover:bg-papagoi-green/90 transition-colors"
                  >
                    {isSubmitting ? 'Saadan...' : 'Saada broneering'}
                  </button>

                </form>
              )}

              {submitMessage && (
                <div className="mt-4 rounded-lg border border-papagoi-green/30 bg-papagoi-green/10 p-3 text-sm text-deep-anthracite">
                  {submitMessage}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  )
}
