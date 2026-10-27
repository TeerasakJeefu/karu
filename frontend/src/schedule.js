// กลุ่มบริการและช่วงเวลา (ต้องตรงกับ services และ slotSets ใน BookingForm.vue)
export const GROUPS = [
  { id: 'hair', name: 'บริการผม', slots: 'standard' },
  { id: 'nail', name: 'บริการเล็บ', slots: 'standard' },
  { id: 'beauty', name: 'วิเคราะห์สีส่วนบุคคล', slots: 'pca' },
]

export const SLOT_SETS = {
  standard: [['13:00', '14:30'], ['14:30', '16:00'], ['16:00', '17:30'], ['17:30', '19:00']],
  pca: [['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00'], ['17:00', '18:00'], ['18:00', '19:00']],
}   