
'use client'
import { useEffect, useMemo, useState } from 'react'
import { addMinutes, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, isToday, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { et, enUS as en, ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { Phone, Mail, Calendar, Users, Clock, Euro, AlertCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export default function StaticBookingInfo() {
  const t = useTranslations('StaticBookingInfo')
  const locale = useLocale()
  const dateFnsLocale = locale === 'ru' ? ru : locale === 'en' ? en : et
  const weekDayLetters = useMemo(
    () => [1, 2, 3, 4, 5, 6, 7].map((d) => format(new Date(2024, 0, d), 'EEEEE', { locale: dateFnsLocale })),
    [dateFnsLocale]
  )
  const currentMonth = startOfMonth(new Date())
  const [monthDate, setMonthDate] = useState(() => currentMonth)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [hasConsent, setHasConsent] = useState(false)
  const [bookingsLoadError, setBookingsLoadError] = useState<string | null>(null)
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
  /** Kõik broneeringud kuupäeva kohta – blokeerimiseks (1h enne/järele) ja Liitu-nupu kuvamiseks. */
  const getAllBookingsForDate = (date: Date, entries: { time: string; guests: number | null }[]) => {
    return entries
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
    return getAllBookingsForDate(selectedDate, entries)
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
  const fullSlots = useMemo(() => {
    return bookedEntriesForSelectedDate
      .filter((e) => e.guests !== null && e.guests >= 20)
      .map((e) => e.time)
  }, [bookedEntriesForSelectedDate])

  const visibleTimeSlots = useMemo(() => {
    if (!selectedDate) return []
    const now = new Date()
    const isSelectedToday = isSameDay(selectedDate, now)
    const canJoinSlot = (time: string) => {
      if (!/^\d{2}:\d{2}$/.test(time)) return false
      const [h, m] = time.split(':').map(Number)
      const slotStart = new Date(selectedDate)
      slotStart.setHours(h, m, 0, 0)
      if (isBefore(slotStart, now)) return false
      if (!isSelectedToday) return true
      return isBefore(now, addMinutes(slotStart, -30))
    }
    return timeSlots.filter((time) => {
      if (restBlockedTimes.includes(time)) return false
      if (fullSlots.includes(time)) return false
      const bookedEntry = bookedEntriesForSelectedDate.find((e) => e.time === time)
      if (bookedEntry) {
        const remaining = bookedEntry.guests === null ? null : Math.max(0, 20 - bookedEntry.guests)
        if (remaining === 0) return false
        return remaining !== null && remaining > 0 && canJoinSlot(time)
      }
      const [hour, minute] = time.split(':').map(Number)
      const slotStart = new Date(selectedDate)
      slotStart.setHours(hour, minute, 0, 0)
      if (isBefore(slotStart, now)) return false
      if (!isSelectedToday) return true
      const cutoff = addMinutes(slotStart, -30)
      return isBefore(now, cutoff)
    })
  }, [restBlockedTimes, selectedDate, timeSlots, fullSlots, bookedEntriesForSelectedDate])

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
  const loadBookings = async (signal?: AbortSignal, silent = false) => {
    if (!silent) {
      setIsLoadingBookings(true)
      setBookingsLoadError(null)
    }
    try {
      const opts: RequestInit = { cache: 'no-store', headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' } }
      if (signal) opts.signal = signal
      const response = await fetch(`/api/notion/visits?t=${Date.now()}`, opts)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
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
      if (error instanceof DOMException && error.name === 'AbortError') {
        setBookingsLoadError(t('bookingsLoadTimeout'))
      } else {
        setBookingsLoadError(t('bookingsLoadError'))
      }
    } finally {
      if (!silent) setIsLoadingBookings(false)
    }
  }

  useEffect(() => {
    if (selectedDate || selectedTime) {
      loadBookings(undefined, true)
    }
  }, [selectedDate, selectedTime])

  useEffect(() => {
    if (!selectedDate || !selectedTime) return
    const interval = setInterval(() => loadBookings(undefined, true), 30000)
    return () => clearInterval(interval)
  }, [selectedDate, selectedTime])

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000)
    loadBookings(controller.signal)
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedDate || !selectedTime) return
    const groupSizeNum = Number(formData.groupSize)
    if (!Number.isFinite(groupSizeNum) || groupSizeNum <= 0) {
      toast.error(t('errorEnterGroupSize'))
      return
    }
    if (remainingSeats !== null && groupSizeNum > remainingSeats) {
      toast.error(t('errorSeatsLeft', { count: remainingSeats }))
      return
    }
    if (!hasConsent) {
      setSubmitMessage(t('submitConsentError'))
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
        setSubmitMessage(result.message || t('submitSuccess'))
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
        setBookingsByDate((prev) => {
          const key = selectedDateValue
          const entries = prev[key] || []
          const existing = entries.find((e) => e.time === selectedTime)
          const newEntries = existing
            ? entries.map((e) =>
                e.time === selectedTime
                  ? { ...e, guests: (e.guests ?? 0) + groupSizeNum }
                  : e
              )
            : [...entries, { time: selectedTime, guests: groupSizeNum }].sort((a, b) =>
                a.time.localeCompare(b.time)
              )
          return { ...prev, [key]: newEntries }
        })
        loadBookings()
      } else {
        let errorMessage =
          typeof result.error === 'string'
            ? result.error
            : result?.error?.message || t('errorSubmit')
        if (result?.error?.details) {
          errorMessage += ` (${result.error.details})`
        }
        setSubmitMessage(errorMessage)
      }
    } catch (error) {
      setSubmitMessage(t('submitNetworkError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-papagoi-beige-100 rounded-2xl shadow-2xl p-8 border border-papagoi-beige-200">
      <h2 className="text-2xl font-bold text-deep-anthracite mb-8 font-heading">{t('title')}</h2>
      
      {/* Important Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <h3 className="text-xl font-bold text-amber-800 font-heading">{t('importantTitle')}</h3>
        </div>
        <p className="text-amber-800 font-medium mb-1">{t('importantLine1')}</p>
        <p className="text-amber-800">{t('importantLine2')}</p>
      </div>

        {/* Calendar */}
        <div className="bg-papagoi-beige-50 rounded-xl p-6 border border-papagoi-green/20 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-deep-anthracite">{t('calendar')}</h3>
              <p className="text-sm text-warm-gray-600">
                {format(monthDate, 'MMMM yyyy', { locale: dateFnsLocale })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canGoBack && (
                <button
                  type="button"
                  onClick={() => setMonthDate(currentMonth)}
                  className="px-4 py-2 rounded-full border border-papagoi-green text-papagoi-green text-sm font-semibold hover:bg-papagoi-green/10 transition-colors"
                >
                  {t('backToCurrentMonth')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMonthDate((current) => addMonths(current, 1))}
                className="px-4 py-2 rounded-full bg-papagoi-green text-white text-sm font-semibold hover:bg-papagoi-green/90 transition-colors"
              >
                {t('nextMonth')}
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-papagoi-green/20 bg-papagoi-beige-100 p-3 text-sm text-deep-anthracite">
            <p className="font-semibold mb-1">{t('selectDateAndTime')}</p>
            <p className="text-warm-gray-600">{t('typicalTimes')}</p>
            <div className="h-2" />
            <blockquote className="border-l-2 border-papagoi-green/40 pl-3 text-warm-gray-600 italic">
              {t('parrotsRestQuote')}
            </blockquote>
            <div className="h-2" />
            <p className="text-warm-gray-600">{t('morningTip')}</p>
          </div>

          {bookingsLoadError && !isLoadingBookings && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-papagoi-red/30 bg-papagoi-red/5 p-3">
              <p className="text-sm text-papagoi-red flex-1">{bookingsLoadError}</p>
              <button
                type="button"
                onClick={() => {
                  setBookingsLoadError(null)
                  loadBookings()
                }}
                className="text-sm font-semibold text-papagoi-green hover:underline whitespace-nowrap"
              >
                {t('tryAgain')}
              </button>
              <button
                type="button"
                onClick={() => setBookingsLoadError(null)}
                className="text-lg text-warm-gray-500 hover:text-warm-gray-700 leading-none"
                aria-label={t('close')}
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-warm-gray-500 mb-2">
            {weekDayLetters.map((day) => (
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
              const hasBookings = Boolean(getAllBookingsForDate(day, dayBookings).length)
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
                    isTodayDate ? 'bg-papagoi-green text-white border-papagoi-green' : 'bg-papagoi-beige-50',
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
                  <h4 className="text-lg font-semibold text-deep-anthracite">{t('selectedDate')}</h4>
                  <p className="text-sm text-warm-gray-600">
                    {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: dateFnsLocale })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-sm text-warm-gray-500 hover:text-warm-gray-700"
                >
                  {t('close')}
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-papagoi-green/20 bg-papagoi-beige-100 p-3 text-sm text-deep-anthracite">
                {t('nbTimes')}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                  const isActive = selectedTime === time
                  const isBooked = bookedTimesForSelectedDate.includes(time)
                  const isRestBlocked = restBlockedTimes.includes(time)
                  const isAvailable = visibleTimeSlots.includes(time)
                  const disabled = !isAvailable
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeClick(time)}
                      disabled={disabled}
                      title={isBooked ? t('titleBooked') : isRestBlocked ? t('titleRestBlocked') : undefined}
                      className={[
                        'px-4 py-2 rounded-lg border font-semibold transition-colors',
                        disabled ? 'border-warm-gray-200 text-warm-gray-400 bg-warm-gray-50 cursor-not-allowed' : '',
                        isActive
                          ? 'bg-papagoi-green text-white border-papagoi-green'
                          : !disabled ? 'border-papagoi-green/30 text-papagoi-green hover:bg-papagoi-green hover:text-white' : '',
                      ].join(' ')}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>

              {bookedEntriesForSelectedDate.length > 0 && (
                <div className="mt-4 rounded-lg border border-papagoi-orange/30 bg-papagoi-orange/10 p-4">
                  <p className="text-sm font-semibold text-deep-anthracite mb-2">{t('bookedSlots')}</p>
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
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-papagoi-beige-100 px-3 py-2"
                        >
                          <span className="text-sm font-semibold text-deep-anthracite">{entry.time}</span>
                          <span className="text-xs text-warm-gray-600">
                            {remaining === null
                              ? t('guestsNotSet')
                              : t('joinPlaces', { count: remaining })}
                          </span>
                          {canJoin && (
                            <button
                              type="button"
                              onClick={() => setSelectedTime(entry.time)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-papagoi-green text-white hover:bg-papagoi-green/90 transition-colors"
                            >
                              {t('join')}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {isLoadingBookings && (
                <p className="mt-4 text-sm text-warm-gray-500">{t('loadingBookings')}</p>
              )}
              {selectedTime && selectedBookingEntry && remainingSeats === 0 && (
                <div className="mt-6 rounded-lg border border-warm-gray-200 bg-warm-gray-50 p-4 text-center text-warm-gray-600">
                  <p className="font-semibold">{t('groupFull')}</p>
                  <p className="text-sm mt-1">{t('groupFullDesc')}</p>
                </div>
              )}
              {selectedTime && !(selectedBookingEntry && remainingSeats === 0) && (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="booking-name" className="text-sm font-semibold text-deep-anthracite">
                        {t('labelName')}
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        value={formData.name}
                        onChange={(event) => handleInputChange('name', event.target.value)}
                        placeholder={t('placeholderName')}
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="booking-email" className="text-sm font-semibold text-deep-anthracite">
                        {t('labelEmail')}
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        value={formData.email}
                        onChange={(event) => handleInputChange('email', event.target.value)}
                        placeholder={t('placeholderEmail')}
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="booking-phone" className="text-sm font-semibold text-deep-anthracite">
                        {t('labelPhone')}
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
                        placeholder={t('placeholderPhone')}
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                      <p className="text-xs text-warm-gray-500">{t('phoneHint')}</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="booking-group-size" className="text-sm font-semibold text-deep-anthracite">
                        {t('labelGroupSize')}{minGroupSize === 3 ? ` (${t('labelGroupSizeMin', { min: 3 })})` : ` (${t('labelGroupSizeMinOne')})`} *
                      </label>
                      <input
                        id="booking-group-size"
                        type="number"
                        min={minGroupSize}
                        max={remainingSeats ?? 50}
                        value={formData.groupSize}
                        onChange={(event) => handleInputChange('groupSize', event.target.value)}
                        placeholder={t('placeholderGroupSize')}
                        required
                        className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                      />
                      <p className="text-xs text-warm-gray-500">
                        {t('minGroupSize', { min: minGroupSize })}
                        {remainingSeats !== null ? ` • ${t('freePlaces', { count: remainingSeats })}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-deep-anthracite">{t('labelDate')}</label>
                      <div className="rounded-lg border border-warm-gray-200 px-3 py-2 bg-warm-gray-50 text-sm text-deep-anthracite">
                        {selectedDateValue}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-deep-anthracite">{t('labelTime')}</label>
                      <div className="rounded-lg border border-warm-gray-200 px-3 py-2 bg-warm-gray-50 text-sm text-deep-anthracite">
                        {selectedTime}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="booking-group-type" className="text-sm font-semibold text-deep-anthracite">
                      {t('labelGroupType')}
                    </label>
                    <select
                      id="booking-group-type"
                      value={formData.groupType}
                      onChange={(event) => handleInputChange('groupType', event.target.value)}
                      className="w-full rounded-lg border border-warm-gray-200 px-3 py-2"
                    >
                      <option value="">{t('groupTypePlaceholder')}</option>
                      <option value="perevisit">{t('groupTypeFamily')}</option>
                      <option value="kool">{t('groupTypeSchool')}</option>
                      <option value="ettevote">{t('groupTypeBusiness')}</option>
                      <option value="muu">{t('groupTypeOther')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="booking-message" className="text-sm font-semibold text-deep-anthracite">
                      {t('labelMessage')}
                    </label>
                    <textarea
                      id="booking-message"
                      value={formData.message}
                      onChange={(event) => handleInputChange('message', event.target.value)}
                      placeholder={t('placeholderMessage')}
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
                    <span>{t('consent')}</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-papagoi-green text-white font-semibold py-3 hover:bg-papagoi-green/90 transition-colors"
                  >
                    {isSubmitting ? t('submitting') : t('submitButton')}
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
