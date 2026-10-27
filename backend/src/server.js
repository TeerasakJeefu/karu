import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { SLOT_SETS, SERVICES, OPTIONS } from './catalog.js'
import { Booking } from './Booking.js'

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }))
app.use(express.json({ limit: '10kb' }))

/* ---------- เวลาไทย ---------- */
const todayBKK = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date()) // YYYY-MM-DD
const nowBKK = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()) // HH:MM
const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s
const isPast = (date, start) => date < todayBKK() || (date === todayBKK() && start <= nowBKK())

/* ---------- GET /api/slots?date=2026-10-28&serviceId=pca ---------- */
app.get('/api/slots', async (req, res, next) => {
  try {
    const { date, serviceId } = req.query
    const svc = SERVICES[serviceId]
    if (!svc) return res.status(400).json({ error: 'invalid serviceId' })
    if (!validDate(date) || date < todayBKK()) return res.status(400).json({ error: 'invalid date' })

    const taken = new Set(
      (await Booking.find({ category: svc.category, date, state: 'confirmed' }, 'slotStart').lean()).map((b) => b.slotStart)
    )
    const slots = SLOT_SETS[svc.slotSet].map(([start, end]) => ({
      id: start, start, end,
      available: !taken.has(start) && !isPast(date, start),
    }))
    res.json({ slots })
  } catch (e) { next(e) }
})

/* ---------- POST /api/bookings ---------- */
app.post('/api/bookings', async (req, res, next) => {
  try {
    const b = req.body ?? {}
    const svc = SERVICES[b.serviceId]
    const slot = svc && SLOT_SETS[svc.slotSet].find(([start]) => start === b.slotStart)
    const phone = String(b.phone ?? '').replace(/[-\s]/g, '')
    const f = {}
    if (!svc) f.serviceId = 'invalid'
    if (!validDate(b.date) || b.date < todayBKK()) f.date = 'invalid'
    if (svc && !slot) f.slotStart = 'invalid'
    if (typeof b.name !== 'string' || !b.name.trim()) f.name = 'required'
    if (!/^0\d{8,9}$/.test(phone)) f.phone = 'invalid'
    if (b.email && !/^\S+@\S+\.\S+$/.test(String(b.email))) f.email = 'invalid'
    if (!OPTIONS.gender.includes(b.gender)) f.gender = 'invalid'
    if (!OPTIONS.age.includes(b.age)) f.age = 'invalid'
    if (!OPTIONS.status.includes(b.status)) f.status = 'invalid'
    if (b.consent !== 'yes') f.consent = 'required'
    if (Object.keys(f).length) return res.status(400).json({ error: 'validation', fields: f })

    if (isPast(b.date, slot[0])) return res.status(409).json({ error: 'slot_taken' })

    const doc = await Booking.create({
      category: svc.category, serviceId: b.serviceId, serviceName: svc.name,
      date: b.date, slotStart: slot[0], slotEnd: slot[1], durationMin: svc.durationMin,
      name: b.name, phone, email: b.email || undefined, note: b.note || undefined,
      gender: b.gender, ageRange: b.age, status: b.status, consent: true,
    })
    res.status(201).json({ id: doc._id, date: doc.date, slotStart: doc.slotStart, slotEnd: doc.slotEnd })
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'slot_taken' }) // ชน unique index = ถูกจองไปแล้ว
    next(e)
  }
})

app.get('/api/health', (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'server' })
})

const { MONGODB_URI = 'mongodb://127.0.0.1:27017/btt_beauty', PORT = 3000 } = process.env
await mongoose.connect(MONGODB_URI)
await Booking.init() // สร้าง index กันจองซ้ำ
app.listen(PORT, () => console.log(`API ready: http://localhost:${PORT}  (db: ${mongoose.connection.name})`))
