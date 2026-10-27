<script setup>
import { reactive, computed, ref, watch } from 'vue'
import {
  Calendar, Clock, FileText, User, Phone, Mail, MessageSquare,
  ChevronDown, Check, Info, Globe, Users, Cake, GraduationCap, ShieldCheck,
} from 'lucide-vue-next'

/* ---------- mock data (เปลี่ยนเป็นเรียก API ภายหลัง) ---------- */
const groups = [
  { id: 'hair', name: { th: 'บริการผม', en: 'Hair Services' } },
  { id: 'nail', name: { th: 'บริการเล็บ', en: 'Nail Services' } },
  { id: 'beauty', name: { th: 'บริการความงาม', en: 'Beauty Services' } },
]
// duration = ระยะเวลาใช้บริการ (นาที), slots = ชุดช่วงเวลา (ดู slotSets ด้านล่าง)
const services = [
  { id: 'shampoo-dry', group: 'hair', duration: 90, slots: 'standard', name: { th: 'สระผม + จัดแต่งทรงผม (ไดร์ผม,ลอนผม,หนีบตรง)', en: 'Shampoo & Styling – Shampooing and hairstyling (blow-dry, curling, or straightening)' } },
  { id: 'hair-treatment', group: 'hair', duration: 90, slots: 'standard', name: { th: 'สระผม + ทรีทเมนต์ + นวดศีรษะ + จัดแต่งทรงผม (ไดร์ผม,ลอนผม,หนีบตรง)', en: 'Hair Treatment & Styling – Shampooing, hair treatment, scalp massage, and hairstyling (blow-dry, curling, or straightening)' } },
  { id: 'scalp-scrub', group: 'hair', duration: 90, slots: 'standard', name: { th: 'สระผม + สครับหนังศีรษะ + นวดศีรษะ + จัดแต่งทรงผม (ไดร์ผม,ลอนผม,หนีบตรง)', en: 'Scalp Scrub Massage & Styling – Shampooing, scalp exfoliation, scalp massage, and hairstyling (blow-dry, curling, or straightening)' } },
  { id: 'gel-polish', group: 'nail', duration: 90, slots: 'standard', name: { th: 'ทาสีเจลสีพื้น', en: 'Gel Polish (Solid Color) – Application of solid-color gel nail polish' } },
  { id: 'nail-spa', group: 'nail', duration: 90, slots: 'standard', name: { th: 'สครับ + มาสก์ + นวด + ขัดเงา', en: 'Nail Spa & Shine' } },
  { id: 'pca', group: 'beauty', duration: 60, slots: 'pca', name: { th: 'วิเคราะห์สีส่วนบุคคล', en: 'Personal Color Analysis' } },
]

const picks = [
  { key: 'gender', label: 'gender', ph: 'genderPh', icon: Users, options: [
    { v: 'female', th: 'ผู้หญิง', en: 'Female' },
    { v: 'male', th: 'ผู้ชาย', en: 'Male' },
    { v: 'lgbtq', th: 'LGBTQ+', en: 'LGBTQ+' },
  ] },
  { key: 'age', label: 'age', ph: 'agePh', icon: Cake, options: [
    { v: 'under-18', th: 'ต่ำกว่า 18 ปี', en: 'Under 18' },
    { v: '18-24', th: '18 – 24 ปี', en: '18 – 24' },
    { v: '25-34', th: '25 – 34 ปี', en: '25 – 34' },
    { v: '35-44', th: '35 – 44 ปี', en: '35 – 44' },
    { v: '45-54', th: '45 – 54 ปี', en: '45 – 54' },
    { v: 'over-55', th: 'มากกว่า 55 ปี', en: 'Over 55' },
  ] },
  { key: 'status', label: 'status', ph: 'statusPh', icon: GraduationCap, options: [
    { v: 'student', th: 'นักศึกษา', en: 'Student' },
    { v: 'staff', th: 'บุคลากรในมหาวิทยาลัย', en: 'University staff' },
    { v: 'general', th: 'บุคคลทั่วไป', en: 'General public' },
  ] },
  { key: 'consent', label: 'consent', ph: 'consentPh', icon: ShieldCheck, options: [
    { v: 'yes', th: 'ยินยอม', en: 'I consent' },
    { v: 'no', th: 'ไม่ยินยอม', en: 'I do not consent' },
  ] },
]

/* ---------- ภาษา / i18n (เพิ่มภาษาใหม่ได้โดยเพิ่ม key ใน messages) ---------- */
const messages = {
  th: {
    title: 'BTT Beauty Space', subtitle: 'กรอกข้อมูลของคุณเพื่อทำการจองบริการ',
    personal: 'ข้อมูลส่วนตัว', name: 'ชื่อ - สกุล', namePh: 'กรอกชื่อ-นามสกุล',
    phone: 'เบอร์โทรศัพท์', phonePh: 'กรอกเบอร์โทรศัพท์', email: 'อีเมล', emailPh: 'กรอกอีเมล (ถ้ามี)',
    note: 'รายละเอียดเพิ่มเติม (ถ้ามี)', notePh: 'กรอกรายละเอียดเพิ่มเติม', booking: 'บริการและเวลา',
    service: 'เลือกบริการ', servicePh: 'กรุณาเลือกบริการ', date: 'เลือกวันที่',
    slot: 'เลือกช่วงเวลา', slotPh: 'กรุณาเลือกช่วงเวลา', slotFirst: 'เลือกบริการก่อน',
    duration: 'ระยะเวลาในการใช้บริการ', min: 'นาที', submit: 'ยืนยันการจอง', saving: 'กำลังบันทึก...',
    doneTitle: 'จองบริการเรียบร้อยแล้ว', again: 'จองรายการใหม่', infoTitle: 'รายละเอียดการจอง',
    gender: 'เพศ', age: 'ช่วงอายุ', status: 'สถานภาพ', consent: 'ท่านยินยอมเข้ารับการบริการหรือไม่',
    genderPh: 'กรุณาเลือกเพศ', agePh: 'กรุณาเลือกช่วงอายุ', statusPh: 'กรุณาเลือกสถานภาพ', consentPh: 'กรุณาเลือก',
    errGender: 'กรุณาเลือกเพศ', errAge: 'กรุณาเลือกช่วงอายุ', errStatus: 'กรุณาเลือกสถานภาพ',
    errConsent: 'กรุณาเลือกว่ายินยอมหรือไม่', errConsentNo: 'ไม่สามารถจองได้หากไม่ยินยอมเข้ารับการบริการ',
    timeText: (a, b) => `เวลา ${a}-${b}น.`,
    info: ['กรุณากรอกข้อมูลให้ครบถ้วน', 'เลือกบริการที่ต้องการ', 'เลือกวันที่และช่วงเวลาที่สะดวก',
      'ระบบจะแสดงระยะเวลาที่ใช้บริการโดยอัตโนมัติ', 'หลังยืนยันการจอง คุณจะได้รับการยืนยันทางอีเมล/เบอร์โทรศัพท์', 'แนะนำให้ลูกค้ามาถึงก่อนเวลานัด 5–10 นาที'],
    errName: 'กรุณากรอกชื่อ-สกุล', errPhone: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง', errEmail: 'รูปแบบอีเมลไม่ถูกต้อง',
    errService: 'กรุณาเลือกบริการ', errDate: 'กรุณาเลือกวันที่', errSlot: 'กรุณาเลือกช่วงเวลา',
    cancelTitle: 'การยกเลิกการจอง', cancelText: 'หากต้องการยกเลิก กรุณาโทรแจ้งร้านล่วงหน้าอย่างน้อย 24 ชั่วโมง', contactLabel: 'เบอร์ติดต่อ', arriveTip: 'แนะนำให้ลูกค้ามาถึงก่อนเวลานัด 5–10 นาที',
  },
  en: {
    title: 'BTT Beauty Space', subtitle: 'Fill in your details to book a service',
    personal: 'Your details', name: 'Full name', namePh: 'Enter your full name',
    phone: 'Phone number', phonePh: 'Enter your phone number', email: 'Email', emailPh: 'Enter your email (optional)',
    note: 'Additional details (optional)', notePh: 'Enter any additional details', booking: 'Service and time',
    service: 'Service', servicePh: 'Select a service', date: 'Date',
    slot: 'Time', slotPh: 'Select a time', slotFirst: 'Select a service first',
    duration: 'Service duration', min: 'min', submit: 'Confirm booking', saving: 'Saving...',
    doneTitle: 'Booking confirmed', again: 'Book another', infoTitle: 'Booking info',
    gender: 'Gender', age: 'Age range', status: 'Status', consent: 'Do you consent to receive the service?',
    genderPh: 'Select your gender', agePh: 'Select your age range', statusPh: 'Select your status', consentPh: 'Please choose',
    errGender: 'Please select your gender', errAge: 'Please select your age range', errStatus: 'Please select your status',
    errConsent: 'Please choose whether you consent', errConsentNo: 'Booking cannot proceed without your consent',
    timeText: (a, b) => `${a} - ${b}`,
    info: ['Fill in all required fields', 'Choose the service you want', 'Pick a date and a time that suits you',
      'The service duration is shown automatically', "After you confirm, you'll receive confirmation by email or phone", 'We recommend arriving 5–10 minutes before your appointment'],
    errName: 'Please enter your full name', errPhone: 'Please enter a valid phone number', errEmail: 'Email format is not valid',
    errService: 'Please select a service', errDate: 'Please select a date', errSlot: 'Please select a time',
    cancelTitle: 'Cancellation', cancelText: 'To cancel, please call the shop at least 24 hours in advance.', contactLabel: 'Contact', arriveTip: 'We recommend arriving 5–10 minutes before your appointment',
  },
}
const shopPhone = '099-999-999'
const shopPhoneHref = `tel:${shopPhone.replace(/-/g, '')}`
const savedLang = (() => { try { return localStorage.getItem('lang') } catch { return null } })()
const lang = ref(savedLang in messages ? savedLang : 'th')
const t = (k) => messages[lang.value][k]
const locale = computed(() => (lang.value === 'th' ? 'th-TH' : 'en-GB'))
watch(lang, (l) => {
  document.documentElement.lang = l
  try { localStorage.setItem('lang', l) } catch { /* ignore */ }
}, { immediate: true })

// TODO: แทนที่ด้วย GET /api/slots?date=YYYY-MM-DD&service=... (ดึงเฉพาะช่วงที่ว่างจริง)
const slotSets = {
  standard: [['13:00', '14:30'], ['14:30', '16:00'], ['16:00', '17:30'], ['17:30', '19:00']], // Hair & Nail
  pca: [['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00'], ['17:00', '18:00'], ['18:00', '19:00']], // Personal Color Analysis
}
const fetchSlots = (iso, serviceId) => {
  const svc = services.find((x) => x.id === serviceId)
  return svc ? slotSets[svc.slots].map(([start, end]) => ({ id: start, start, end })) : []
}

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const todayISO = toISO(new Date())

/* ---------- state ---------- */
const form = reactive({ name: '', phone: '', email: '', note: '', gender: '', age: '', status: '', consent: '', serviceId: '', date: todayISO, slotId: '' })
const errors = reactive({})
const submitting = ref(false)
const done = ref(false)
const shaking = ref(false)

const slots = computed(() => fetchSlots(form.date, form.serviceId))
const selectedSlot = computed(() => slots.value.find((s) => s.id === form.slotId))
const slotLabel = (s) => (lang.value === 'th' ? `${s.start}-${s.end}น.` : `${s.start} - ${s.end}`)
const duration = computed(() => services.find((x) => x.id === form.serviceId)?.duration ?? null)
const dateText = computed(() =>
  form.date
    ? fromISO(form.date).toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''
)
watch(() => [form.date, form.serviceId], () => { form.slotId = '' })

/* ---------- submit ---------- */
function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = 'errName'
  if (!/^0\d{8,9}$/.test(form.phone.replace(/[-\s]/g, ''))) errors.phone = 'errPhone'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'errEmail'
  if (!form.gender) errors.gender = 'errGender'
  if (!form.age) errors.age = 'errAge'
  if (!form.status) errors.status = 'errStatus'
  if (!form.consent) errors.consent = 'errConsent'
  else if (form.consent === 'no') errors.consent = 'errConsentNo'
  if (!form.serviceId) errors.serviceId = 'errService'
  if (!form.date) errors.date = 'errDate'
  if (!form.slotId) errors.slotId = 'errSlot'
  return Object.keys(errors).length === 0
}
async function submit() {
  if (!validate()) {
    shaking.value = true
    setTimeout(() => (shaking.value = false), 450)
    return
  }
  submitting.value = true
  try {
    // TODO: await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, durationMin: duration.value }) })
    await new Promise((r) => setTimeout(r, 600))
    done.value = true
  } finally { submitting.value = false }
}
function reset() {
  Object.assign(form, { name: '', phone: '', email: '', note: '', gender: '', age: '', status: '', consent: '', serviceId: '', date: todayISO, slotId: '' })
  done.value = false
}
</script>

<template>
  <div class="page">
    <header class="card header">
      <span class="logo"><Calendar :size="28" /></span>
      <div class="grow">
        <h1>{{ t('title') }}</h1>
        <p class="muted">{{ t('subtitle') }}</p>
      </div>
      <div class="lang" role="group" aria-label="Language">
        <Globe :size="18" />
        <span class="seg">
          <span class="thumb" :class="{ en: lang === 'en' }" />
          <button type="button" :class="{ on: lang === 'th' }" :aria-pressed="lang === 'th'" @click="lang = 'th'">ไทย</button>
          <button type="button" :class="{ on: lang === 'en' }" :aria-pressed="lang === 'en'" @click="lang = 'en'">EN</button>
        </span>
      </div>
    </header>

    <main class="layout">
      <section class="card">
        <Transition name="swap" mode="out-in">
        <div v-if="done" class="success" role="status">
          <span class="tick"><Check :size="34" /></span>
          <h2>{{ t('doneTitle') }}</h2>
          <p class="muted">
            {{ services.find((s) => s.id === form.serviceId)?.name[lang] }}<br />
            {{ dateText }} · {{ t('timeText')(selectedSlot?.start, selectedSlot?.end) }}
          </p>
          <p class="cancel-note">
            {{ t('arriveTip') }}<br />
            {{ t('cancelText') }}<br />
            <a :href="shopPhoneHref">{{ t('contactLabel') }} {{ shopPhone }}</a>
          </p>
          <button class="btn inline" type="button" @click="reset">{{ t('again') }}</button>
        </div>

        <form v-else novalidate :class="{ shaking }" @submit.prevent="submit">
          <h2 class="section-title">{{ t('personal') }}</h2>
          <div class="row2">
            <label class="field">
              <span class="label">{{ t('name') }} <b>*</b></span>
              <span class="input" :class="{ bad: errors.name }">
                <User :size="18" /><input v-model="form.name" :placeholder="t('namePh')" autocomplete="name" />
              </span>
              <small v-if="errors.name" class="err">{{ t(errors.name) }}</small>
            </label>
            <label class="field">
              <span class="label">{{ t('phone') }} <b>*</b></span>
              <span class="input" :class="{ bad: errors.phone }">
                <Phone :size="18" /><input v-model="form.phone" inputmode="tel" :placeholder="t('phonePh')" autocomplete="tel" />
              </span>
              <small v-if="errors.phone" class="err">{{ t(errors.phone) }}</small>
            </label>
          </div>

          <label class="field">
            <span class="label">{{ t('email') }}</span>
            <span class="input" :class="{ bad: errors.email }">
              <Mail :size="18" /><input v-model="form.email" type="email" :placeholder="t('emailPh')" autocomplete="email" />
            </span>
            <small v-if="errors.email" class="err">{{ t(errors.email) }}</small>
          </label>

          <div class="row2">
            <label v-for="g in picks.slice(0, 2)" :key="g.key" class="field">
              <span class="label">{{ t(g.label) }} <b>*</b></span>
              <span class="input select" :class="{ bad: errors[g.key] }">
                <component :is="g.icon" :size="18" />
                <select v-model="form[g.key]">
                  <option value="" disabled>{{ t(g.ph) }}</option>
                  <option v-for="o in g.options" :key="o.v" :value="o.v">{{ o[lang] }}</option>
                </select>
                <ChevronDown :size="18" />
              </span>
              <small v-if="errors[g.key]" class="err">{{ t(errors[g.key]) }}</small>
            </label>
          </div>

          <label v-for="g in picks.slice(2, 3)" :key="g.key" class="field">
            <span class="label">{{ t(g.label) }} <b>*</b></span>
            <span class="input select" :class="{ bad: errors[g.key] }">
              <component :is="g.icon" :size="18" />
              <select v-model="form[g.key]">
                <option value="" disabled>{{ t(g.ph) }}</option>
                <option v-for="o in g.options" :key="o.v" :value="o.v">{{ o[lang] }}</option>
              </select>
              <ChevronDown :size="18" />
            </span>
            <small v-if="errors[g.key]" class="err">{{ t(errors[g.key]) }}</small>
          </label>

          <label class="field">
            <span class="label">{{ t('note') }}</span>
            <span class="input area">
              <MessageSquare :size="18" /><textarea v-model="form.note" rows="3" :placeholder="t('notePh')" />
            </span>
          </label>

          <h2 class="section-title gap">{{ t('booking') }}</h2>
          <label class="field">
            <span class="label">{{ t('service') }} <b>*</b></span>
            <span class="input select" :class="{ bad: errors.serviceId }">
              <FileText :size="18" />
              <select v-model="form.serviceId">
                <option value="" disabled>{{ t('servicePh') }}</option>
                <optgroup v-for="g in groups" :key="g.id" :label="g.name[lang]">
                  <option v-for="s in services.filter((x) => x.group === g.id)" :key="s.id" :value="s.id">{{ s.name[lang] }}</option>
                </optgroup>
              </select>
              <ChevronDown :size="18" />
            </span>
            <small v-if="errors.serviceId" class="err">{{ t(errors.serviceId) }}</small>
          </label>

          <div class="row2">
            <label class="field">
              <span class="label">{{ t('date') }} <b>*</b></span>
              <span class="input" :class="{ bad: errors.date }">
                <Calendar :size="18" /><input v-model="form.date" type="date" :min="todayISO" :lang="lang" />
              </span>
              <small v-if="errors.date" class="err">{{ t(errors.date) }}</small>
              <small v-else class="hint">{{ dateText }}</small>
            </label>
            <label class="field">
              <span class="label">{{ t('slot') }} <b>*</b></span>
              <span class="input select" :class="{ bad: errors.slotId }">
                <Clock :size="18" />
                <select v-model="form.slotId" :disabled="!form.serviceId">
                  <option value="" disabled>{{ form.serviceId ? t('slotPh') : t('slotFirst') }}</option>
                  <option v-for="s in slots" :key="s.id" :value="s.id">{{ slotLabel(s) }}</option>
                </select>
                <ChevronDown :size="18" />
              </span>
              <small v-if="errors.slotId" class="err">{{ t(errors.slotId) }}</small>
            </label>
          </div>

          <div class="duration" :class="{ on: duration }" aria-live="polite">
            <span class="d-label"><Clock :size="20" /> {{ t('duration') }}</span>
            <span class="d-value"><strong :key="duration">{{ duration ?? '-' }}</strong> {{ t('min') }}</span>
          </div>

          <label v-for="g in picks.slice(3)" :key="g.key" class="field">
            <span class="label">{{ t(g.label) }} <b>*</b></span>
            <span class="input select" :class="{ bad: errors[g.key] }">
              <component :is="g.icon" :size="18" />
              <select v-model="form[g.key]">
                <option value="" disabled>{{ t(g.ph) }}</option>
                <option v-for="o in g.options" :key="o.v" :value="o.v">{{ o[lang] }}</option>
              </select>
              <ChevronDown :size="18" />
            </span>
            <small v-if="errors[g.key]" class="err">{{ t(errors[g.key]) }}</small>
          </label>

          <button class="btn" type="submit" :disabled="submitting">
            <span v-if="submitting" class="spin" aria-hidden="true" />
            {{ submitting ? t('saving') : t('submit') }}
          </button>
        </form>
        </Transition>
      </section>

      <aside class="card info">
        <h2 class="side-title"><span class="tile"><Info :size="18" /></span> {{ t('infoTitle') }}</h2>
        <ul>
          <li v-for="(line, i) in t('info')" :key="line" :style="{ '--i': i }">{{ line }}</li>
        </ul>
        <div class="cancel">
          <strong>{{ t('cancelTitle') }}</strong>
          <p>{{ t('cancelText') }}</p>
          <a :href="shopPhoneHref"><Phone :size="16" /> {{ t('contactLabel') }} {{ shopPhone }}</a>
        </div>
      </aside>
    </main>
  </div>
</template>

<style>
/* รีเซ็ตสไตล์เริ่มต้นของ Vite ที่ทำให้ข้อความอยู่กลางจอ */
html {
  overscroll-behavior: none;
  background-color: #fff6fa;
  background-image: radial-gradient(900px 400px at 85% -10%, #fbd3e6 0%, transparent 70%);
  background-repeat: no-repeat;
  background-attachment: fixed;
}
body { margin: 0; padding: 0; display: block; min-width: 320px; }
#app { width: 100%; max-width: none; margin: 0; padding: 0; border: 0; text-align: left; display: block; min-height: 0; }
</style>

<style scoped>
.page {
  --brand: #ff1493; --brand-dark: #d10a77; --brand-soft: #fdecf4; --ink: #2b1a26; --muted: #8f7b88;
  --line: #f0dbe6; --danger: #d92d20;
  min-height: 100vh; padding: 32px 20px 56px; color: var(--ink); text-align: left;
  font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif; line-height: 1.55;
  box-sizing: border-box; overflow-x: clip; /* กันเนื้อหาดันความกว้างหน้าจอ */
}
.header, .layout { max-width: 1080px; margin-inline: auto; box-sizing: border-box; width: 100%; }
.card { background: #fff; border-radius: 16px; padding: 28px 32px; box-shadow: 0 1px 2px rgba(43, 26, 38, .05), 0 8px 24px rgba(43, 26, 38, .05); }
.muted, .hint { margin: 0; color: var(--muted); font-size: .9rem; }

.header { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; padding-block: 22px; }
.header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: -.01em; }
.grow { flex: 1; min-width: 0; }
.lang { display: flex; align-items: center; gap: 4px; padding: 4px 4px 4px 12px; border-radius: 999px; background: #fbeaf2; color: var(--muted); }
.lang button { min-height: 34px; padding: 0 14px; border: 0; border-radius: 999px; background: transparent; color: var(--muted); font: inherit; font-weight: 600; font-size: .9rem; cursor: pointer; }
.lang button.on { background: #fff; color: var(--brand-dark); box-shadow: 0 1px 3px rgba(43, 26, 38, .15); }
.lang button:focus-visible { outline: 3px solid rgba(255, 20, 147, .45); }
.logo { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 14px; color: #fff; background: linear-gradient(135deg, #ff5cad, var(--brand)); }

.layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start; }
.layout > section, .layout > aside { min-width: 0; }
.info { position: sticky; top: 24px; background: var(--brand-soft); box-shadow: none; }

.section-title { margin: 0 0 20px; font-size: 1.15rem; font-weight: 700; }
.section-title.gap { margin-top: 12px; padding-top: 24px; border-top: 1px solid var(--line); }
.row2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 20px; }
.field { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin-bottom: 18px; align-content: start; min-width: 0; }
.label { font-weight: 600; font-size: .95rem; }
.label b { color: var(--danger); margin-left: 2px; }

.input {
  display: flex; align-items: center; gap: 12px; padding: 0 16px; min-height: 50px;
  border: 1px solid var(--line); border-radius: 12px; background: #fff; color: var(--muted);
  transition: border-color .15s, box-shadow .15s; min-width: 0;
}
.input:hover { border-color: #e4c3d3; }
.input:focus-within { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(255, 20, 147, .15); color: var(--brand); }
.input.bad { border-color: var(--danger); }
.input.area { align-items: flex-start; padding-top: 15px; }
.input input, .input select, .input textarea {
  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; color: var(--ink);
}
.input input[type='date'] { color-scheme: light; cursor: pointer; }
.input textarea { resize: vertical; min-height: 64px; }
.input select { appearance: none; cursor: pointer; min-height: 48px; text-overflow: ellipsis; max-width: 100%; }
.input select:disabled { cursor: not-allowed; }
.input input::placeholder, .input textarea::placeholder { color: #b9a6b1; }
.err { color: var(--danger); font-size: .85rem; }

.duration {
  display: flex; justify-content: space-between; align-items: center; margin: 4px 0 24px;
  padding: 16px 20px; border-radius: 12px; background: #fff6fa; border: 1px dashed var(--line); color: var(--muted);
}
.duration.on { background: var(--brand-soft); border: 1px solid #f6bcd8; color: var(--ink); }
.d-label { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.d-value strong { font-size: 1.5rem; color: var(--brand); margin-right: 4px; }

.btn {
  width: 100%; min-height: 52px; border: 0; border-radius: 12px; cursor: pointer; color: #fff;
  font-family: inherit; font-size: 1.05rem; font-weight: 600; background: var(--brand);
  box-shadow: 0 6px 16px rgba(255, 20, 147, .28); transition: background .15s, transform .1s;
}
.btn:hover:not(:disabled) { background: var(--brand-dark); }
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: .65; cursor: wait; }
.btn.inline { width: auto; padding: 0 32px; margin-top: 12px; }
.btn:focus-visible { outline: 3px solid rgba(255, 20, 147, .45); outline-offset: 3px; }

.side-title { display: flex; align-items: center; gap: 12px; margin: 0 0 16px; font-size: 1.05rem; font-weight: 700; }
.tile { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--brand); color: #fff; }
.info ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; color: #5b4553; font-size: .95rem; }
.info li { position: relative; padding-left: 22px; }
.info li::before { content: ''; position: absolute; left: 4px; top: .6em; width: 7px; height: 7px; border-radius: 50%; background: var(--brand); }

.cancel { margin-top: 20px; padding-top: 18px; border-top: 1px dashed #f1b6d3; color: #5b4553; font-size: .92rem; }
.cancel strong { color: var(--ink); }
.cancel p { margin: 6px 0 10px; }
.cancel a, .cancel-note a { display: inline-flex; align-items: center; gap: 6px; color: var(--brand-dark); font-weight: 600; text-decoration: none; }
.cancel a:hover, .cancel-note a:hover { text-decoration: underline; }
.cancel-note { margin: 4px 0 0; padding: 12px 16px; border-radius: 12px; background: var(--brand-soft); color: #5b4553; font-size: .9rem; }

.success { display: grid; justify-items: center; gap: 10px; padding: 56px 0; text-align: center; }
.success h2 { margin: 8px 0 0; }
.tick { display: grid; place-items: center; width: 68px; height: 68px; border-radius: 50%; background: var(--brand-soft); color: var(--brand); }

/* ---------- effects ---------- */
@keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(-70px, 60px) scale(1.18); } }
@keyframes shake { 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
@keyframes errIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes pop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
@keyframes ring { from { transform: scale(1); opacity: .6; } to { transform: scale(1.9); opacity: 0; } }
@keyframes spin { to { transform: rotate(360deg); } }

.page { position: relative; isolation: isolate; }
.page::before {
  content: ''; position: fixed; z-index: -1; top: -180px; right: -140px; width: 560px; height: 560px;
  border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(255, 80, 165, .3), transparent 65%);
  animation: drift 16s ease-in-out infinite alternate;
}
.header { animation: rise .6s cubic-bezier(.2, .7, .2, 1) both; }
.layout > section { animation: rise .6s .12s cubic-bezier(.2, .7, .2, 1) both; }
.layout > aside { animation: rise .6s .24s cubic-bezier(.2, .7, .2, 1) both; }
.info li { animation: rise .5s calc(.45s + var(--i) * .08s) cubic-bezier(.2, .7, .2, 1) both; }
.logo { transition: transform .35s cubic-bezier(.3, 1.4, .5, 1); }
.header:hover .logo { transform: rotate(-6deg) scale(1.06); }

.seg { position: relative; display: flex; }
.thumb {
  position: absolute; inset: 0 auto 0 0; width: 54px; border-radius: 999px; background: #fff;
  box-shadow: 0 1px 4px rgba(43, 26, 38, .18); transition: transform .35s cubic-bezier(.3, 1.3, .5, 1);
}
.thumb.en { transform: translateX(100%); }
.lang button { position: relative; z-index: 1; width: 54px; padding: 0; transition: color .25s; }
.lang button.on { background: transparent; box-shadow: none; }

.field .label { transition: color .2s; }
.field:focus-within .label { color: var(--brand-dark); }
.input { transition: border-color .2s, box-shadow .2s, transform .2s; }
.input:focus-within { transform: translateY(-1px); }
.shaking .input.bad { animation: shake .4s; }
.err { animation: errIn .25s ease-out; }
.duration { transition: background .3s, border-color .3s, color .3s; }
.d-value strong { display: inline-block; animation: pop .35s ease-out; }

.btn { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #ff1493, #ec0f85); }
.btn::after {
  content: ''; position: absolute; inset: 0; transform: translateX(-120%); transition: transform .7s;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, .35) 50%, transparent 70%);
}
.btn:hover:not(:disabled) { background: linear-gradient(135deg, #e5107f, var(--brand-dark)); transform: translateY(-1px); box-shadow: 0 10px 22px rgba(255, 20, 147, .35); }
.btn:hover:not(:disabled)::after { transform: translateX(120%); }
.btn:active:not(:disabled) { transform: translateY(1px); }
.spin { width: 18px; height: 18px; border: 2.5px solid rgba(255, 255, 255, .4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }

.swap-enter-active, .swap-leave-active { transition: opacity .25s, transform .25s; }
.swap-enter-from { opacity: 0; transform: translateY(14px); }
.swap-leave-to { opacity: 0; transform: translateY(-10px); }
.success > * { animation: rise .45s both; }
.success > :nth-child(2) { animation-delay: .25s; }
.success > :nth-child(3) { animation-delay: .32s; }
.success > :nth-child(4) { animation-delay: .4s; }
.success > :nth-child(5) { animation-delay: .48s; }
.tick { position: relative; animation: pop .5s .1s cubic-bezier(.3, 1.4, .5, 1) both; }
.tick::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--brand); animation: ring .9s .45s ease-out both; }

@media (prefers-reduced-motion: reduce) {
  .page, .page *, .page *::before, .page *::after { animation: none !important; transition-duration: .01ms !important; }
}

/* ---------- มือถือ / mobile ---------- */
.input input[type='date'] { appearance: none; -webkit-appearance: none; min-height: 48px; text-align: left; }
.input select, .input input, .input textarea { font-size: 16px; } /* กัน iOS ซูมเองตอนแตะช่องกรอก */
.page button { -webkit-tap-highlight-color: transparent; }

@media (max-width: 860px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .info { position: static; }
  .card { padding: 24px 22px; }
}

@media (max-width: 560px) {
  .page {
    min-height: 100dvh;
    padding: max(16px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
  }
  .page::before { width: 360px; height: 360px; top: -120px; right: -120px; }
  .card { padding: 20px 16px; border-radius: 14px; }
  .header, .layout { gap: 14px; }
  .header { margin-bottom: 14px; padding: 14px 16px; gap: 12px; }
  .header h1 { font-size: 1.2rem; }
  .header .muted { font-size: .8rem; }
  .logo { width: 44px; height: 44px; border-radius: 12px; }
  .lang { padding: 3px; }
  .lang > svg { display: none; }
  .thumb, .lang button { width: 44px; }
  .lang button { min-height: 32px; font-size: .85rem; }
  .row2 { grid-template-columns: minmax(0, 1fr); }
  .section-title { font-size: 1.05rem; margin-bottom: 16px; }
  .section-title.gap { margin-top: 4px; padding-top: 20px; }
  .field { margin-bottom: 16px; }
  .duration { padding: 14px 16px; gap: 12px; margin-bottom: 20px; }
  .d-label { font-size: .92rem; gap: 8px; }
  .d-value { white-space: nowrap; }
  /* เอา sticky ออก: ปุ่มอยู่ท้ายฟอร์ม ไม่บังช่องกรอก */
  .success { padding: 36px 0; }
  .info ul { font-size: .92rem; }
}
</style>