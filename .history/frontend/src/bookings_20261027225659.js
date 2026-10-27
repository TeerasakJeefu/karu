const KEY = 'btt_bookings'

export function listBookings() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

export function addBooking(data) {
  const item = {
    ...data,
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    bookingStatus: 'confirmed',
    createdAt: new Date().toISOString(),
  }
  save([item, ...listBookings()])
  return item
}

export function setBookingStatus(id, status) {
  save(listBookings().map((b) => (b.id === id ? { ...b, bookingStatus: status } : b)))
}

export function removeBooking(id) {
  save(listBookings().filter((b) => b.id !== id))
}

// ช่วงเวลาหนึ่งของกลุ่มหนึ่ง รับได้ 1 คน (ที่ยังไม่ถูกยกเลิก)
export function isSlotTaken(group, date, start) {
  return listBookings().some(
    (b) => b.bookingStatus === 'confirmed' && b.group === group && b.date === date && b.start === start
  )
}