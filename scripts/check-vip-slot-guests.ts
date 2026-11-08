/**
 * Kontrollib, et „Külalised“/„Külastajad“ (ü) leiab extractGuestCount
 * ja VIP samasse täis slotti annab SLOT_OCCUPIED.
 * Käivitus: npx tsx scripts/check-vip-slot-guests.ts
 */
import {
  extractGuestCount,
  normalizeKey,
  visitSlotConflict,
} from '../lib/notion-booking'

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message)
}

const occupiedVisit = {
  properties: {
    Kuupäev: { type: 'date', date: { start: '2026-11-10T10:00:00+02:00' } },
    Kellaaeg: { type: 'select', select: { name: '10:00' } },
    Külalised: { type: 'rollup', rollup: { type: 'number', number: 5 } },
    'VIP külastus': { type: 'checkbox', checkbox: false },
  },
}

assert(normalizeKey('Kuupäev') === 'kuupaev', 'Kuupäev peab jääma kuupaev')
assert(normalizeKey('Kellaaeg') === 'kellaaeg', 'Kellaaeg peab jääma kellaaeg')
assert(normalizeKey('Külastused').includes('kulastus'), 'Külastused peab sisaldama kulastus')
assert(normalizeKey('Külalised') === 'kulalised', 'Külalised → kulalised')
assert(normalizeKey('Külastajad') === 'kulastajad', 'Külastajad → kulastajad')
assert(normalizeKey('õhtu') === 'ohtu', 'õ → o')

const guests = extractGuestCount(occupiedVisit.properties)
assert(guests === 5, `Külalised rollup=5 → extractGuestCount pidi olema 5, oli ${guests}`)

const vipIntoOccupied = visitSlotConflict([occupiedVisit], true)
assert(
  vipIntoOccupied === 'SLOT_OCCUPIED',
  `VIP samasse slotti pidi olema SLOT_OCCUPIED, oli ${vipIntoOccupied}`
)

const regularJoin = visitSlotConflict([occupiedVisit], false)
assert(regularJoin === null, `Tavagrupp tohib liituda, oli ${regularJoin}`)

const emptyVisit = {
  properties: {
    Külalised: { type: 'rollup', rollup: { type: 'number', number: 0 } },
    'VIP külastus': { type: 'checkbox', checkbox: false },
  },
}
assert(extractGuestCount(emptyVisit.properties) === 0, 'Tühi slot peab olema 0')
assert(visitSlotConflict([emptyVisit], true) === null, 'Tühi slot on VIP-ile lubatud')

const vipVisit = {
  properties: {
    Külalised: { type: 'rollup', rollup: { type: 'number', number: 2 } },
    'VIP külastus': { type: 'checkbox', checkbox: true },
  },
}
assert(visitSlotConflict([vipVisit], false) === 'SLOT_VIP', 'VIP slot on tavale suletud')
assert(visitSlotConflict([vipVisit], true) === 'SLOT_VIP', 'VIP slot on ka uuele VIP-ile suletud')

console.log('OK: Külalised=5 → 5; VIP samasse slotti → SLOT_OCCUPIED')
