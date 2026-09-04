import { formatInTimeZone } from 'date-fns-tz'

/** Kohe pärast /api/sync-gmb-reviews (16:00 UTC). */
export const GMB_REPLY_GENERATE_CRON_UTC = '5 16 * * *'

export function tallinnHour(now: Date = new Date()): string {
  return formatInTimeZone(now, 'Europe/Tallinn', 'HH')
}
