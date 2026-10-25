<script setup>
import { reactive, computed, ref, watch } from 'vue'
import {
  Calendar, Clock, FileText, User, Phone, Mail, MapPin,
  ChevronDown, Check, Info,
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
const minutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const todayISO = toISO(new Date())

/* ---------- state ---------- */
const form = reactive({ name: '', phone: '', email: '', address: '', serviceId: '', date: todayISO, slotId: '' })
const errors = reactive({})
const submitting = ref(false)
const done = ref(false)

const slots = computed(() => fetchSlots(form.date, form.serviceId))
const selectedSlot = computed(() => slots.value.find((s) => s.id === form.slotId))
const duration = computed(() =>
  selectedSlot.value ? minutes(selectedSlot.value.end) - minutes(selectedSlot.value.start) : null
)
const dateText = computed(() =>
  form.date
    ? fromISO(form.date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''
)
watch(() => form.date, () => { form.slotId = '' })

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
    // TODO: await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, durationMin: duration.value }) })
    await new Promise((r) => setTimeout(r, 600))
    done.value = true
  } finally { submitting.value = false }
}
function reset() {
  Object.assign(form, { name: '', phone: '', email: '', address: '', serviceId: '', date: todayISO, slotId: '' })
  done.value = false
}
</script>

<template>
  <div class="page">
    <header class="card header">
      <span class="logo"><Calendar :size="28" /></span>
      <div>
        <h1>แพลตฟอร์มจองบริการ</h1>
        <p class="muted">กรอกข้อมูลของคุณเพื่อทำการจองบริการ</p>
      </div>
    </header>

    <main class="layout">
      <section class="card">
        <div v-if="done" class="success" role="status">
          <span class="tick"><Check :size="34" /></span>
          <h2>จองบริการเรียบร้อยแล้ว</h2>
          <p class="muted">
            {{ services.find((s) => s.id === form.serviceId)?.name }}<br />
            {{ dateText }} เวลา {{ selectedSlot?.start }} - {{ selectedSlot?.end }} น.
          </p>
          <button class="btn inline" type="button" @click="reset">จองรายการใหม่</button>
        </div>

        <form v-else novalidate @submit.prevent="submit">
          <h2 class="section-title">ข้อมูลส่วนตัว</h2>
          <div class="row2">
            <label class="field">
              <span class="label">ชื่อ - สกุล <b>*</b></span>
              <span class="input" :class="{ bad: errors.name }">
                <User :size="18" /><input v-model="form.name" placeholder="กรอกชื่อ-นามสกุล" autocomplete="name" />
              </span>
              <small v-if="errors.name" class="err">{{ errors.name }}</small>
            </label>
            <label class="field">
              <span class="label">เบอร์โทรศัพท์ <b>*</b></span>
              <span class="input" :class="{ bad: errors.phone }">
                <Phone :size="18" /><input v-model="form.phone" inputmode="tel" placeholder="กรอกเบอร์โทรศัพท์" autocomplete="tel" />
              </span>
              <small v-if="errors.phone" class="err">{{ errors.phone }}</small>
            </label>
          </div>

          <label class="field">
            <span class="label">อีเมล</span>
            <span class="input" :class="{ bad: errors.email }">
              <Mail :size="18" /><input v-model="form.email" type="email" placeholder="กรอกอีเมล (ถ้ามี)" autocomplete="email" />
            </span>
            <small v-if="errors.email" class="err">{{ errors.email }}</small>
          </label>

          <label class="field">
            <span class="label">ที่อยู่/ที่ติดต่อ <b>*</b></span>
            <span class="input area" :class="{ bad: errors.address }">
              <MapPin :size="18" /><textarea v-model="form.address" rows="3" placeholder="กรอกที่อยู่หรือที่ติดต่อ" />
            </span>
            <small v-if="errors.address" class="err">{{ errors.address }}</small>
          </label>

          <h2 class="section-title gap">บริการและเวลา</h2>
          <label class="field">
            <span class="label">เลือกบริการ <b>*</b></span>
            <span class="input select" :class="{ bad: errors.serviceId }">
              <FileText :size="18" />
              <select v-model="form.serviceId">
                <option value="" disabled>กรุณาเลือกบริการ</option>
                <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
              <ChevronDown :size="18" />
            </span>
            <small v-if="errors.serviceId" class="err">{{ errors.serviceId }}</small>
          </label>

          <div class="row2">
            <label class="field">
              <span class="label">เลือกวันที่ <b>*</b></span>
              <span class="input" :class="{ bad: errors.date }">
                <Calendar :size="18" /><input v-model="form.date" type="date" :min="todayISO" />
              </span>
              <small v-if="errors.date" class="err">{{ errors.date }}</small>
              <small v-else class="hint">{{ dateText }}</small>
            </label>
            <label class="field">
              <span class="label">เลือกช่วงเวลา <b>*</b></span>
              <span class="input select" :class="{ bad: errors.slotId }">
                <Clock :size="18" />
                <select v-model="form.slotId">
                  <option value="" disabled>กรุณาเลือกช่วงเวลา</option>
                  <option v-for="s in slots" :key="s.id" :value="s.id">{{ s.start }} - {{ s.end }}</option>
                </select>
                <ChevronDown :size="18" />
              </span>
              <small v-if="errors.slotId" class="err">{{ errors.slotId }}</small>
            </label>
          </div>

          <div class="duration" :class="{ on: duration }" aria-live="polite">
            <span class="d-label"><Clock :size="20" /> ระยะเวลาในการใช้บริการ</span>
            <span class="d-value"><strong>{{ duration ?? '-' }}</strong> นาที</span>
          </div>

          <button class="btn" type="submit" :disabled="submitting">
            {{ submitting ? 'กำลังบันทึก...' : 'ยืนยันการจอง' }}
          </button>
        </form>
      </section>

      <aside class="card info">
        <h2 class="side-title"><span class="tile"><Info :size="18" /></span> รายละเอียดการจอง</h2>
        <ul>
          <li>กรุณากรอกข้อมูลให้ครบถ้วน</li>
          <li>เลือกบริการที่ต้องการ</li>
          <li>เลือกวันที่และช่วงเวลาที่สะดวก</li>
          <li>ระบบจะแสดงระยะเวลาที่ใช้บริการโดยอัตโนมัติ</li>
          <li>หลังยืนยันการจอง คุณจะได้รับการยืนยันทางอีเมล/เบอร์โทรศัพท์</li>
        </ul>
      </aside>
    </main>
  </div>
</template>

<style>
/* รีเซ็ตสไตล์เริ่มต้นของ Vite ที่ทำให้ข้อความอยู่กลางจอ */
body { margin: 0; display: block; min-width: 320px; }
#app { width: 100%; max-width: none; margin: 0; padding: 0; border: 0; text-align: left; display: block; min-height: 0; }
</style>

<style scoped>
.page {
  --blue: #2f6fed; --blue-dark: #1f56c4; --blue-soft: #eef3ff; --ink: #172033; --muted: #7a879c;
  --line: #dfe6f1; --danger: #d92d20;
  min-height: 100vh; padding: 32px 20px 56px; color: var(--ink); text-align: left;
  background: radial-gradient(900px 400px at 85% -10%, #dfe9ff 0%, transparent 70%), #f5f8fd;
  font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif; line-height: 1.55;
}
.header, .layout { max-width: 1080px; margin-inline: auto; }
.card { background: #fff; border-radius: 16px; padding: 28px 32px; box-shadow: 0 1px 2px rgba(23, 32, 51, .05), 0 8px 24px rgba(23, 32, 51, .05); }
.muted, .hint { margin: 0; color: var(--muted); font-size: .9rem; }

.header { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; padding-block: 22px; }
.header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: -.01em; }
.logo { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 14px; color: #fff; background: linear-gradient(135deg, #5b94ff, var(--blue)); }

.layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start; }
.info { position: sticky; top: 24px; background: var(--blue-soft); box-shadow: none; }

.section-title { margin: 0 0 20px; font-size: 1.15rem; font-weight: 700; }
.section-title.gap { margin-top: 12px; padding-top: 24px; border-top: 1px solid var(--line); }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.field { display: grid; gap: 8px; margin-bottom: 18px; align-content: start; }
.label { font-weight: 600; font-size: .95rem; }
.label b { color: var(--danger); margin-left: 2px; }

.input {
  display: flex; align-items: center; gap: 12px; padding: 0 16px; min-height: 50px;
  border: 1px solid var(--line); border-radius: 12px; background: #fff; color: var(--muted);
  transition: border-color .15s, box-shadow .15s;
}
.input:hover { border-color: #c3cfe3; }
.input:focus-within { border-color: var(--blue); box-shadow: 0 0 0 4px rgba(47, 111, 237, .15); color: var(--blue); }
.input.bad { border-color: var(--danger); }
.input.area { align-items: flex-start; padding-top: 15px; }
.input input, .input select, .input textarea {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; color: var(--ink);
}
.input input[type='date'] { color-scheme: light; cursor: pointer; }
.input textarea { resize: vertical; min-height: 64px; }
.input select { appearance: none; cursor: pointer; min-height: 48px; }
.input input::placeholder, .input textarea::placeholder { color: #a3aec0; }
.err { color: var(--danger); font-size: .85rem; }

.duration {
  display: flex; justify-content: space-between; align-items: center; margin: 4px 0 24px;
  padding: 16px 20px; border-radius: 12px; background: #f5f8fd; border: 1px dashed var(--line); color: var(--muted);
}
.duration.on { background: var(--blue-soft); border: 1px solid #c9d9ff; color: var(--ink); }
.d-label { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.d-value strong { font-size: 1.5rem; color: var(--blue); margin-right: 4px; }

.btn {
  width: 100%; min-height: 52px; border: 0; border-radius: 12px; cursor: pointer; color: #fff;
  font-family: inherit; font-size: 1.05rem; font-weight: 600; background: var(--blue);
  box-shadow: 0 6px 16px rgba(47, 111, 237, .28); transition: background .15s, transform .1s;
}
.btn:hover:not(:disabled) { background: var(--blue-dark); }
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: .65; cursor: wait; }
.btn.inline { width: auto; padding: 0 32px; margin-top: 12px; }
.btn:focus-visible { outline: 3px solid rgba(47, 111, 237, .45); outline-offset: 3px; }

.side-title { display: flex; align-items: center; gap: 12px; margin: 0 0 16px; font-size: 1.05rem; font-weight: 700; }
.tile { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--blue); color: #fff; }
.info ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; color: #43506a; font-size: .95rem; }
.info li { position: relative; padding-left: 22px; }
.info li::before { content: ''; position: absolute; left: 4px; top: .6em; width: 7px; height: 7px; border-radius: 50%; background: var(--blue); }

.success { display: grid; justify-items: center; gap: 10px; padding: 56px 0; text-align: center; }
.success h2 { margin: 8px 0 0; }
.tick { display: grid; place-items: center; width: 68px; height: 68px; border-radius: 50%; background: var(--blue-soft); color: var(--blue); }

@media (max-width: 860px) {
  .layout { grid-template-columns: 1fr; }
  .info { position: static; order: -1; }
  .row2 { grid-template-columns: 1fr; }
  .card { padding: 22px 20px; }
}
</style>