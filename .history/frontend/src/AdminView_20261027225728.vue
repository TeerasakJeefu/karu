<script setup>
import { ref, computed, onMounted } from 'vue'
import { listBookings, setBookingStatus, removeBooking } from './bookings'

const all = ref([])
const filterDate = ref('')
const filterGroup = ref('')
const filterStatus = ref('')

const groupNames = { hair: 'บริการผม', nail: 'บริการเล็บ', beauty: 'บริการความงาม' }
const genderTh = { female: 'ผู้หญิง', male: 'ผู้ชาย', lgbtq: 'LGBTQ+' }
const ageTh = {
  'under-18': 'ต่ำกว่า 18 ปี', '18-24': '18–24 ปี', '25-34': '25–34 ปี',
  '35-44': '35–44 ปี', '45-54': '45–54 ปี', 'over-55': 'มากกว่า 55 ปี',
}
const occTh = { student: 'นักศึกษา', staff: 'บุคลากรในมหาวิทยาลัย', general: 'บุคคลทั่วไป' }

function refresh() { all.value = listBookings() }
onMounted(refresh)

const stats = computed(() => ({
  total: all.value.length,
  confirmed: all.value.filter((b) => b.bookingStatus === 'confirmed').length,
  cancelled: all.value.filter((b) => b.bookingStatus === 'cancelled').length,
}))

const filtered = computed(() =>
  all.value
    .filter((b) =>
      (!filterDate.value || b.date === filterDate.value) &&
      (!filterGroup.value || b.group === filterGroup.value) &&
      (!filterStatus.value || b.bookingStatus === filterStatus.value)
    )
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
)

function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function toggle(b) {
  setBookingStatus(b.id, b.bookingStatus === 'confirmed' ? 'cancelled' : 'confirmed')
  refresh()
}

function remove(b) {
  if (!window.confirm(`ลบการจองของ ${b.name} ใช่หรือไม่?`)) return
  removeBooking(b.id)
  refresh()
}

function clearFilters() {
  filterDate.value = ''
  filterGroup.value = ''
  filterStatus.value = ''
}
</script>

<template>
  <section class="admin">
    <div class="card">
      <h2 class="title">รายการจองทั้งหมด</h2>
      <p class="note">ข้อมูลเก็บในเบราว์เซอร์เครื่องนี้เท่านั้น จะเห็นเฉพาะการจองที่ทำจากเครื่องนี้</p>

      <div class="stats">
        <div><strong>{{ stats.total }}</strong><span>ทั้งหมด</span></div>
        <div><strong>{{ stats.confirmed }}</strong><span>ยืนยันแล้ว</span></div>
        <div><strong>{{ stats.cancelled }}</strong><span>ยกเลิก</span></div>
      </div>

      <div class="filters">
        <input v-model="filterDate" type="date" aria-label="วันที่" />
        <select v-model="filterGroup" aria-label="กลุ่มบริการ">
          <option value="">ทุกกลุ่ม</option>
          <option v-for="(name, key) in groupNames" :key="key" :value="key">{{ name }}</option>
        </select>
        <select v-model="filterStatus" aria-label="สถานะ">
          <option value="">ทุกสถานะ</option>
          <option value="confirmed">ยืนยันแล้ว</option>
          <option value="cancelled">ยกเลิก</option>
        </select>
        <button type="button" class="ghost" @click="clearFilters">ล้างตัวกรอง</button>
      </div>

      <p v-if="!filtered.length" class="empty">ไม่มีรายการจอง</p>

      <ul v-else class="list">
        <li v-for="b in filtered" :key="b.id" :class="{ off: b.bookingStatus === 'cancelled' }">
          <div class="top">
            <strong>{{ b.serviceName }}</strong>
            <span class="badge" :class="b.bookingStatus">
              {{ b.bookingStatus === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิก' }}
            </span>
          </div>
          <p class="meta">
            {{ fmtDate(b.date) }} · {{ b.start }}-{{ b.end }}น. · {{ b.durationMin }} นาที · {{ groupNames[b.group] }}
          </p>
          <p class="meta">
            {{ b.name }} · {{ b.phone }}<span v-if="b.email"> · {{ b.email }}</span>
          </p>
          <p class="meta">
            {{ genderTh[b.gender] }} · {{ ageTh[b.age] }} · {{ occTh[b.occupation] }}
          </p>
          <p v-if="b.note" class="meta">หมายเหตุ: {{ b.note }}</p>
          <div class="actions">
            <button type="button" class="ghost" @click="toggle(b)">
              {{ b.bookingStatus === 'confirmed' ? 'ยกเลิกการจอง' : 'คืนสถานะยืนยัน' }}
            </button>
            <button type="button" class="danger" @click="remove(b)">ลบ</button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.admin {
  --brand: #ff1493; --brand-dark: #d10a77; --brand-soft: #fdecf4; --ink: #2b1a26; --muted: #8f7b88;
  --line: #f0dbe6; --danger: #d92d20;
  max-width: 1080px; margin: 0 auto 56px; box-sizing: border-box; width: 100%;
  color: var(--ink); font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif; line-height: 1.55; text-align: left;
}
.card {
  background: #fff; border-radius: 16px; padding: 28px 32px; box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(43, 26, 38, .05), 0 8px 24px rgba(43, 26, 38, .05);
}
.title { margin: 0 0 4px; font-size: 1.15rem; font-weight: 700; }
.note { margin: 0 0 20px; color: var(--muted); font-size: .85rem; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.stats div { display: grid; gap: 2px; padding: 14px; border-radius: 12px; background: var(--brand-soft); }
.stats strong { font-size: 1.4rem; color: var(--brand-dark); }
.stats span { color: var(--muted); font-size: .85rem; }

.filters { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select {
  min-height: 42px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px;
  background: #fff; color: var(--ink); font: inherit; font-size: 16px; min-width: 0; box-sizing: border-box;
}
.filters input:focus, .filters select:focus { outline: 0; border-color: var(--brand); box-shadow: 0 0 0 3px rgba(255, 20, 147, .15); }

.empty { color: var(--muted); text-align: center; padding: 32px 0; }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.list li { padding: 16px; border: 1px solid var(--line); border-radius: 12px; }
.list li.off { opacity: .6; }
.top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 6px; }
.top strong { font-size: .95rem; }
.meta { margin: 2px 0; color: #5b4553; font-size: .88rem; overflow-wrap: anywhere; }

.badge { padding: 2px 10px; border-radius: 999px; font-size: .75rem; font-weight: 600; white-space: nowrap; }
.badge.confirmed { background: var(--brand-soft); color: var(--brand-dark); }
.badge.cancelled { background: #f1f1f1; color: #6b6b6b; }

.actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.actions button, .ghost, .danger {
  min-height: 36px; padding: 0 14px; border-radius: 10px; font: inherit; font-size: .88rem; cursor: pointer; box-sizing: border-box;
}
.ghost { border: 1px solid var(--line); background: #fff; color: var(--muted); }
.ghost:hover { color: var(--brand-dark); border-color: var(--brand); }
.danger { border: 1px solid #f5c2bd; background: #fff; color: var(--danger); }
.danger:hover { background: #fdeceb; }

@media (max-width: 860px) {
  .card { padding: 24px 22px; }
}
@media (max-width: 560px) {
  .admin { padding: 0 14px; }
  .card { padding: 20px 16px; border-radius: 14px; }
  .stats { grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .stats strong { font-size: 1.15rem; }
  .filters { grid-template-columns: 1fr; }
}
</style>