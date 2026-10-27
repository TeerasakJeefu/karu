<script setup>
import { ref, computed } from 'vue'
import { listBookings, setBookingStatus } from './bookings'
import { GROUPS, SLOT_SETS } from './schedule'

const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }

const date = ref(toISO(new Date()))
const all = ref(listBookings())
function refresh() { all.value = listBookings() }

function shift(n) {
  const d = fromISO(date.value)
  d.setDate(d.getDate() + n)
  date.value = toISO(d)
}

const dateLabel = computed(() =>
  fromISO(date.value).toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
)

// ตารางตามกลุ่ม: แต่ละช่วงเวลามีคนจองไหม (เฉพาะที่ยังไม่ยกเลิก)
const grid = computed(() =>
  GROUPS.map((g) => ({
    ...g,
    cells: SLOT_SETS[g.slots].map(([start, end]) => {
      const booking = all.value.find(
        (b) => b.bookingStatus === 'confirmed' && b.group === g.id && b.date === date.value && b.start === start
      )
      return { start, end, booking: booking || null }
    }),
  }))
)

// รายการของวันที่เลือก (รวมที่ยกเลิกแล้ว)
const dayList = computed(() =>
  all.value
    .filter((b) => b.date === date.value)
    .sort((a, b) => a.start.localeCompare(b.start))
)

const groupNames = Object.fromEntries(GROUPS.map((g) => [g.id, g.name]))

function toggle(b) {
  setBookingStatus(b.id, b.bookingStatus === 'confirmed' ? 'cancelled' : 'confirmed')
  refresh()
}
</script>

<template>
  <section class="admin">
    <div class="card">
      <div class="head">
        <button type="button" class="nav" aria-label="วันก่อนหน้า" @click="shift(-1)">‹</button>
        <div class="day">
          <h2>{{ dateLabel }}</h2>
          <input v-model="date" type="date" aria-label="เลือกวันที่" />
        </div>
        <button type="button" class="nav" aria-label="วันถัดไป" @click="shift(1)">›</button>
      </div>

      <div class="legend">
        <span class="chip free">ว่าง</span>
        <span class="chip reserved">จองแล้ว</span>
      </div>

      <div v-for="g in grid" :key="g.id" class="room">
        <div class="bar">{{ g.name }}</div>
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th>เวลา</th>
                <th v-for="c in g.cells" :key="c.start">{{ c.start }}-{{ c.end }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>สถานะ</th>
                <td v-for="c in g.cells" :key="c.start" :class="c.booking ? 'reserved' : 'free'">
                  <template v-if="c.booking">
                    <strong>{{ c.booking.name }}</strong>
                    <small>{{ c.booking.phone }}</small>
                  </template>
                  <template v-else>ว่าง</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 class="list-title">รายการของวันนี้</h3>
      <p v-if="!dayList.length" class="empty">ยังไม่มีการจองในวันนี้</p>
      <ul v-else class="list">
        <li v-for="b in dayList" :key="b.id" :class="{ off: b.bookingStatus === 'cancelled' }">
          <div class="row">
            <span class="time">{{ b.start }}-{{ b.end }}น.</span>
            <strong>{{ b.name }}</strong>
            <span class="badge" :class="b.bookingStatus">{{ b.bookingStatus === 'confirmed' ? 'ยืนยัน' : 'ยกเลิก' }}</span>
          </div>
          <p class="meta">{{ groupNames[b.group] }} · {{ b.serviceName }} · {{ b.phone }}<span v-if="b.email"> · {{ b.email }}</span></p>
          <p v-if="b.note" class="meta">หมายเหตุ: {{ b.note }}</p>
          <button type="button" class="ghost" @click="toggle(b)">
            {{ b.bookingStatus === 'confirmed' ? 'ยกเลิกการจอง (ปล่อยช่วงนี้ว่าง)' : 'คืนสถานะยืนยัน' }}
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.admin {
  --brand: #ff1493; --brand-dark: #d10a77; --brand-soft: #fdecf4; --ink: #2b1a26; --muted: #8f7b88;
  --line: #e5e5e5; --free: #e8f7ec; --reserved: #fff6c2;
  max-width: 1080px; margin: 0 auto 56px; box-sizing: border-box; width: 100%;
  color: var(--ink); font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif; line-height: 1.5; text-align: left;
}
.card {
  background: #fff; border-radius: 16px; padding: 24px 28px; box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(43, 26, 38, .05), 0 8px 24px rgba(43, 26, 38, .05);
}

.head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.day { display: grid; justify-items: center; gap: 6px; min-width: 0; }
.day h2 { margin: 0; font-size: 1.1rem; font-weight: 700; text-align: center; }
.day input {
  min-height: 36px; padding: 0 10px; border: 1px solid var(--line); border-radius: 10px;
  font: inherit; font-size: 16px; color: var(--ink); background: #fff;
}
.nav {
  width: 40px; height: 40px; flex: none; border: 1px solid var(--line); border-radius: 10px; background: #fff;
  color: var(--brand-dark); font-size: 1.4rem; line-height: 1; cursor: pointer;
}
.nav:hover { border-color: var(--brand); }

.legend { display: flex; gap: 8px; margin-bottom: 14px; }
.chip { padding: 3px 12px; border-radius: 6px; font-size: .8rem; border: 1px solid var(--line); }
.chip.free, td.free { background: var(--free); }
.chip.reserved, td.reserved { background: var(--reserved); }

.room { margin-bottom: 18px; }
.bar {
  padding: 8px 12px; border-radius: 8px 8px 0 0; background: var(--brand); color: #fff;
  font-size: .9rem; font-weight: 600; text-align: center;
}
.scroll { overflow-x: auto; border: 1px solid var(--line); border-top: 0; border-radius: 0 0 8px 8px; }
table { width: 100%; border-collapse: collapse; font-size: .85rem; }
th, td { border: 1px solid var(--line); padding: 8px 6px; text-align: center; vertical-align: middle; min-width: 104px; }
thead th { background: #faf5f8; color: var(--brand-dark); font-weight: 600; }
tbody th { background: #faf5f8; font-weight: 600; min-width: 64px; }
td strong, td small { display: block; overflow-wrap: anywhere; }
td small { color: #5b4553; font-size: .75rem; }

.list-title { margin: 22px 0 10px; font-size: 1rem; font-weight: 700; }
.empty { color: var(--muted); text-align: center; padding: 20px 0; }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.list li { padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; }
.list li.off { opacity: .55; }
.row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
.time { color: var(--brand-dark); font-weight: 600; font-size: .9rem; }
.meta { margin: 2px 0; color: #5b4553; font-size: .86rem; overflow-wrap: anywhere; }
.badge { padding: 2px 10px; border-radius: 999px; font-size: .72rem; font-weight: 600; background: var(--brand-soft); color: var(--brand-dark); }
.badge.cancelled { background: #f1f1f1; color: #6b6b6b; }
.ghost {
  margin-top: 8px; min-height: 34px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px;
  background: #fff; color: var(--muted); font: inherit; font-size: .85rem; cursor: pointer;
}
.ghost:hover { color: var(--brand-dark); border-color: var(--brand); }

@media (max-width: 860px) { .card { padding: 20px 18px; } }
@media (max-width: 560px) {
  .admin { padding: 0 12px; }
  .card { padding: 16px 12px; border-radius: 14px; }
}
</style>