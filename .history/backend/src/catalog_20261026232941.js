// รายการบริการและช่วงเวลา (id ต้องตรงกับฝั่งหน้าเว็บ)
export const SLOT_SETS = {
  standard: [['13:00', '14:30'], ['14:30', '16:00'], ['16:00', '17:30'], ['17:30', '19:00']], // Hair & Nail
  pca: [['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00'], ['17:00', '18:00'], ['18:00', '19:00']],
}

export const SERVICES = {
  'shampoo-dry': { category: 'hair', name: 'Shampoo & Styling', durationMin: 90, slotSet: 'standard' },
  'hair-treatment': { category: 'hair', name: 'Hair Treatment & Styling', durationMin: 90, slotSet: 'standard' },
  'scalp-scrub': { category: 'hair', name: 'Scalp Scrub Massage & Styling', durationMin: 90, slotSet: 'standard' },
  'gel-polish': { category: 'nail', name: 'Gel Polish (Solid Color)', durationMin: 90, slotSet: 'standard' },
  'nail-spa': { category: 'nail', name: 'Nail Spa & Shine', durationMin: 90, slotSet: 'standard' },
  pca: { category: 'beauty', name: 'Personal Color Analysis', durationMin: 60, slotSet: 'pca' },
}

export const OPTIONS = {
  gender: ['female', 'male', 'lgbtq'],
  age: ['under-18', '18-24', '25-34', '35-44', '45-54', '55-59'],
  status: ['student', 'staff', 'general'],
}
