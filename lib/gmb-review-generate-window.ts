import { formatInTimeZone } from 'date-fns-tz'

/** Vercel cron on UTC. 20:00 Tallinn = 17:00 UTC suvel, 18:00 UTC talvel. */
export const GMB_REPLY_GENERATE_CRON_UTC = '0 17,18 * * *'

export function isGmbReplyGenerateWindow(now: Date = new Date()): boolean {
  return formatInTimeZone(now, 'Europe/Tallinn', 'HH') === '20'
}

export function tallinnHour(now: Date = new Date()): string {
  return formatInTimeZone(now, 'Europe/Tallinn', 'HH')
}
