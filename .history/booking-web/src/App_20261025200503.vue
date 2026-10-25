<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  Calendar, Clock, FileText, User, Phone, Mail, MapPin, Zap,
  ChevronLeft, ChevronRight, ChevronDown, Check,
} from 'lucide-vue-next'

/* ---------- mock data (เปลี่ยนเป็นเรียก API ภายหลัง) ---------- */
const services = [
  { id: 'consult', name: 'ปรึกษาเบื้องต้น' },
  { id: 'repair', name: 'ซ่อมบำรุง' },
  { id: 'install', name: 'ติดตั้ง' },
]
// TODO: แทนที่ด้วย GET /api/slots?date=YYYY-MM-DD&service=...
const fetchSlots = (/* iso, serviceId */) => [
  { id: 's1', start: '09:00', end: '10:30' },
  { id: 's2', start: '10:45', end: '11:15' },
  { id: 's3', start: '13:00', end: '14:30' },
  { id: 's4', start: '14:45', end: '15:20' },
]

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const thDate = (d, opt) => d.toLocaleDateString('th-TH', opt) // ปี พ.ศ. อัตโนมัติ
const minutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

const today = new Date()
const todayISO = toISO(today)

/* ---------- state ---------- */
const form = reactive({
  name: '', phone: '', email: '', address: '',
  serviceId: '', date: todayISO, slotId: '',
})
const errors = reactive({})
const viewMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const submitting = ref(false)
const done = ref(false)

const slots = computed(() => fetchSlots(form.date, form.serviceId))
const selectedSlot = computed(() => slots.value.find((s) => s.id === form.slotId))
const duration = computed(() =>
  selectedSlot.value ? minutes(selectedSlot.value.end) - minutes(selectedSlot.value.start) : null
)

// เปลี่ยนวัน -> ล้างช่วงเวลาที่เลือก + พาปฏิทินไปเดือนนั้น
watch(() => form.date, (iso) => {
  form.slotId = ''
  if (!iso) return
  const d = fromISO(iso)
  viewMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
})

/* ---------- calendar ---------- */
const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const monthLabel = computed(() => thDate(viewMonth.value, { month: 'long', year: 'numeric' }))
const cells = computed(() => {
  const y = viewMonth.value.getFullYear(), m = viewMonth.value.getMonth()
  const lead = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => toISO(new Date(y, m, i + 1)))]
})
const moveMonth = (n) => {
  const v = viewMonth.value
  viewMonth.value = new Date(v.getFullYear(), v.getMonth() + n, 1)
}
const pickDate = (iso) => { if (iso >= todayISO) form.date = iso }
const slotHeading = computed(() =>
  form.date ? thDate(fromISO(form.date), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''
)

/* ---------- submit ---------- */
function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = 'กรุณากรอกชื่อ-สกุล'
  if (!/^0\d{8,9}$/.test(form.phone.replace(/[-\s]/g, ''))) errors.phone = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
  if (!form.address.trim()) errors.address = 'กรุณากรอกที่อยู่หรือที่ติดต่อ'
  if (!form.serviceId) errors.serviceId = 'กรุณาเลือกบริการ'
  if (!form.date) errors.date = 'กรุณาเลือกวันที่'
  if (!form.slotId) errors.slotId = 'กรุณาเลือกช่วงเวลา'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    // TODO: เชื่อม backend
    // await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, durationMin: duration.value }) })
    await new Promise((r) => setTimeout(r, 600))
    done.value = true
  } finally {
    submitting.value = false
  }
}
function reset() {
  Object.assign(form, { name: '', phone: '', email: '', address: '', serviceId: '', date: todayISO, slotId: '' })
  done.value = false
}
</script>

<template>
  <div class="page">
    <header class="card header">
      <Calendar class="logo" :size="44" />
      <div class="grow">
        <h1>แพลตฟอร์มจองบริการ</h1>
        <p class="muted">กรอกข้อมูลของคุณเพื่อทำการจองบริการ</p>
      </div>
      <span class="pill"><Zap :size="16" /> จองง่าย สะดวก รวดเร็ว</span>
    </header>

    <main class="layout">
      <!-- ซ้าย: ฟอร์ม -->
      <section class="card form-card">
        <div v-if="done" class="success" role="status">
          <span class="tick"><Check :size="32" /></span>
          <h2>จองบริการเรียบร้อยแล้ว</h2>
          <p class="muted">
            {{ services.find((s) => s.id === form.serviceId)?.name }} · {{ slotHeading }}<br />
            เวลา {{ selectedSlot?.start }} - {{ selectedSlot?.end }} น.
          </p>
          <button class="btn" type="button" @click="reset">จองรายการใหม่</button>
        </div>

        <form v-else novalidate @submit.prevent="submit">
          <h2 class="section-title">ข้อมูลส่วนตัว</h2>

          <label class="field">
            <span class="label"><User :size="16" /> ชื่อ - สกุล <b>*</b></span>
            <span class="input" :class="{ bad: errors.name }">
              <User :size="16" /><input v-model="form.name" placeholder="กรอกชื่อ-นามสกุล" autocomplete="name" />
            </span>
            <small v-if="errors.name" class="err">{{ errors.name }}</small>
          </label>

          <label class="field">
            <span class="label"><Phone :size="16" /> เบอร์โทรศัพท์ <b>*</b></span>
            <span class="input" :class="{ bad: errors.phone }">
              <Phone :size="16" /><input v-model="form.phone" inputmode="tel" placeholder="กรอกเบอร์โทรศัพท์" autocomplete="tel" />
            </span>
            <small v-if="errors.phone" class="err">{{ errors.phone }}</small>
          </label>

          <label class="field">
            <span class="label"><Mail :size="16" /> อีเมล</span>
            <span class="input" :class="{ bad: errors.email }">
              <Mail :size="16" /><input v-model="form.email" type="email" placeholder="กรอกอีเมล (ถ้ามี)" autocomplete="email" />
            </span>
            <small v-if="errors.email" class="err">{{ errors.email }}</small>
          </label>

          <label class="field">
            <span class="label"><MapPin :size="16" /> ที่อยู่/ที่ติดต่อ <b>*</b></span>
            <span class="input area" :class="{ bad: errors.address }">
              <MapPin :size="16" /><textarea v-model="form.address" rows="2" placeholder="กรอกที่อยู่หรือที่ติดต่อ" />
            </span>
            <small v-if="errors.address" class="err">{{ errors.address }}</small>
          </label>

          <label class="field">
            <span class="section-sub">เลือกบริการ</span>
            <span class="input select" :class="{ bad: errors.serviceId }">
              <FileText :size="16" />
              <select v-model="form.serviceId">
                <option value="" disabled>กรุณาเลือกบริการ</option>
                <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
              <ChevronDown :size="16" />
            </span>
            <small v-if="errors.serviceId" class="err">{{ errors.serviceId }}</small>
          </label>

          <label class="field">
            <span class="section-sub">เลือกวันที่</span>
            <span class="input" :class="{ bad: errors.date }">
              <Calendar :size="16" /><input v-model="form.date" type="date" :min="todayISO" />
            </span>
            <small v-if="form.date" class="muted">{{ slotHeading }}</small>
            <small v-if="errors.date" class="err">{{ errors.date }}</small>
          </label>

          <label class="field">
            <span class="section-sub">เลือกช่วงเวลา</span>
            <span class="input select" :class="{ bad: errors.slotId }">
              <Clock :size="16" />
              <select v-model="form.slotId">
                <option value="" disabled>กรุณาเลือกช่วงเวลา</option>
                <option v-for="s in slots" :key="s.id" :value="s.id">{{ s.start }} - {{ s.end }}</option>
              </select>
              <ChevronDown :size="16" />
            </span>
            <small v-if="errors.slotId" class="err">{{ errors.slotId }}</small>
          </label>

          <div class="duration" aria-live="polite">
            <span class="label blue"><Clock :size="18" /> ระยะเวลาในการใช้บริการ</span>
            <div class="duration-row">
              <strong>{{ duration ?? '-' }}</strong><span class="muted">นาที</span>
            </div>
          </div>

          <button class="btn" type="submit" :disabled="submitting">
            {{ submitting ? 'กำลังบันทึก...' : 'ยืนยันการจอง' }}
          </button>
        </form>
      </section>

      <!-- ขวา: ข้อมูลช่วยเหลือ -->
      <aside class="side">
        <section class="card info">
          <h2 class="side-title"><span class="icon-tile"><FileText :size="18" /></span> รายละเอียดการจอง</h2>
          <ul>
            <li>กรุณากรอกข้อมูลให้ครบถ้วน</li>
            <li>เลือกบริการที่ต้องการ</li>
            <li>เลือกวันที่จากปฏิทิน</li>
            <li>เลือกช่วงเวลาที่สะดวก</li>
            <li>ระบบจะแสดงระยะเวลาที่ใช้บริการโดยอัตโนมัติ</li>
            <li>หลังจากยืนยันการจอง คุณจะได้รับการยืนยันทางอีเมล/เบอร์โทรศัพท์</li>
          </ul>
        </section>

        <section class="card">
          <h2 class="side-title"><Calendar :size="26" class="logo" /> ปฏิทิน</h2>
          <div class="cal-head">
            <button type="button" class="nav" aria-label="เดือนก่อนหน้า" @click="moveMonth(-1)"><ChevronLeft :size="18" /></button>
            <strong>{{ monthLabel }}</strong>
            <button type="button" class="nav" aria-label="เดือนถัดไป" @click="moveMonth(1)"><ChevronRight :size="18" /></button>
          </div>
          <div class="grid weekdays"><span v-for="w in weekdays" :key="w">{{ w }}</span></div>
          <div class="grid">
            <template v-for="(c, i) in cells" :key="i">
              <span v-if="!c" />
              <button
                v-else type="button" class="day"
                :class="{ selected: c === form.date, today: c === todayISO }"
                :disabled="c < todayISO"
                @click="pickDate(c)"
              >{{ Number(c.slice(8)) }}</button>
            </template>
          </div>
        </section>

        <section class="card">
          <h2 class="side-title"><Clock :size="24" /> ช่วงเวลา</h2>
          <div class="slot-box">
            <p class="slot-date"><Clock :size="14" /> {{ slotHeading }}</p>
            <label v-for="s in slots" :key="s.id" class="slot" :class="{ on: form.slotId === s.id }">
              <input v-model="form.slotId" type="radio" name="slot" :value="s.id" />
              <span class="radio" />{{ s.start }} - {{ s.end }}
            </label>
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.page {
  --blue: #3b82f6; --blue-soft: #eaf1fe; --ink: #1e293b; --muted: #8492a6;
  --line: #dbe3ef; --bg: #f4f7fc; --danger: #dc2626;
  min-height: 100vh; padding: 24px 20px 48px; background: var(--bg); color: var(--ink);
  font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif; line-height: 1.5;
}
.page > *, .layout { max-width: 1160px; margin-inline: auto; }
.card { background: #fff; border-radius: 14px; padding: 24px 28px; box-shadow: 0 1px 3px rgba(30, 41, 59, .06); }
.muted { color: var(--muted); font-size: .9rem; margin: 0; }
.grow { flex: 1; }
.logo { color: var(--blue); }

.header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.header h1 { margin: 0; font-size: 1.5rem; }
.pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px; background: var(--bg); font-size: .9rem; }

.layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.side { display: grid; gap: 20px; }

.section-title { margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid var(--line); font-size: 1.25rem; }
.section-sub { font-weight: 600; font-size: 1.05rem; }
.field { display: grid; gap: 8px; margin-bottom: 20px; }
.label { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: .95rem; }
.label b { color: var(--danger); }
.label.blue { color: var(--ink); } .label.blue svg { color: var(--blue); }

.input {
  display: flex; align-items: center; gap: 12px; padding: 0 16px; min-height: 48px;
  border: 1px solid var(--line); border-radius: 12px; background: #fff; color: var(--muted);
}
.input:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59, 130, 246, .2); }
.input.bad { border-color: var(--danger); }
.input.area { align-items: flex-start; padding-top: 14px; }
.input input, .input select, .input textarea {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; color: var(--ink);
}
.input textarea { resize: vertical; }
.input select { appearance: none; cursor: pointer; }
.err { color: var(--danger); font-size: .85rem; }

.duration { margin: 4px 0 24px; padding: 16px 20px; border-radius: 12px; background: var(--blue-soft); }
.duration-row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 4px 0; font-size: 1.15rem; }
.duration-row strong { flex: 1; text-align: center; color: var(--blue); }

.btn {
  width: 100%; min-height: 50px; border: 0; border-radius: 10px; background: var(--blue);
  color: #fff; font: 600 1rem inherit; font-family: inherit; cursor: pointer;
}
.btn:hover:not(:disabled) { background: #2563eb; }
.btn:disabled { opacity: .6; cursor: wait; }
.btn:focus-visible, .nav:focus-visible, .day:focus-visible { outline: 3px solid rgba(59, 130, 246, .5); outline-offset: 2px; }

.success { display: grid; justify-items: center; gap: 12px; padding: 48px 0; text-align: center; }
.success h2 { margin: 0; }
.success .btn { width: auto; padding: 0 28px; margin-top: 12px; }
.tick { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--blue-soft); color: var(--blue); }

.side-title { display: flex; align-items: center; gap: 12px; margin: 0 0 16px; font-size: 1.1rem; }
.icon-tile { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; background: var(--blue); color: #fff; }
.info { background: var(--blue-soft); }
.info ul { margin: 0; padding-left: 22px; display: grid; gap: 6px; color: #475569; }

.cal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-top: 1px solid var(--line); padding-top: 12px; }
.nav { display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; cursor: pointer; color: var(--ink); }
.nav:hover { background: var(--bg); }
.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; justify-items: center; }
.weekdays { margin-bottom: 6px; color: var(--muted); font-size: .85rem; }
.day { width: 38px; height: 38px; border: 0; border-radius: 50%; background: transparent; font: inherit; color: var(--ink); cursor: pointer; }
.day:hover:not(:disabled) { background: var(--blue-soft); }
.day:disabled { color: #c3ccd9; cursor: not-allowed; }
.day.today { background: var(--blue-soft); color: var(--blue); font-weight: 600; }
.day.selected { background: var(--blue); color: #fff; font-weight: 600; }

.slot-box { display: grid; gap: 8px; padding: 12px; border-radius: 12px; background: var(--blue-soft); }
.slot-date { display: flex; align-items: center; gap: 8px; margin: 0 0 4px; font-size: .9rem; color: var(--blue); }
.slot { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 8px; background: #fff; cursor: pointer; }
.slot input { position: absolute; opacity: 0; }
.radio { width: 18px; height: 18px; border: 1.5px solid #94a3b8; border-radius: 50%; }
.slot.on .radio { border: 5px solid var(--blue); }
.slot:has(input:focus-visible) { outline: 3px solid rgba(59, 130, 246, .5); }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .pill { display: none; }
}
</style>