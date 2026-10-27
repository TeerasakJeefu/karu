import mongoose from 'mongoose'
import { OPTIONS } from './catalog.js'

const bookingSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['hair', 'nail', 'beauty'], required: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true }, // เก็บชื่อ ณ วันที่จองไว้ด้วย
    date: { type: String, required: true }, // YYYY-MM-DD (เวลาไทย)
    slotStart: { type: String, required: true },
    slotEnd: { type: String, required: true },
    durationMin: { type: Number, required: true },

    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true },
    email: { type: String, trim: true, maxlength: 120 },
    note: { type: String, trim: true, maxlength: 500 },
    gender: { type: String, enum: OPTIONS.gender, required: true },
    ageRange: { type: String, enum: OPTIONS.age, required: true },
    status: { type: String, enum: OPTIONS.status, required: true }, // สถานภาพลูกค้า
    consent: { type: Boolean, required: true },

    state: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }, // สถานะการจอง
  },
  { timestamps: true }
)

// กันจองซ้ำ: หมวดเดียวกัน + วัน + เวลาเริ่ม ต้องไม่ซ้ำ (เฉพาะรายการที่ยังไม่ยกเลิก)
bookingSchema.index(
  { category: 1, date: 1, slotStart: 1 },
  { unique: true, partialFilterExpression: { state: 'confirmed' } }
)

export const Booking = mongoose.model('Booking', bookingSchema)
