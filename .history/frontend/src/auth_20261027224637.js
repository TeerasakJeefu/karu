const USERS_KEY = 'btt_users'
const SESSION_KEY = 'btt_session'

// บัญชีตั้งต้น (รหัสผ่านอยู่ในโค้ด จึงไม่ปลอดภัยสำหรับข้อมูลจริง)
const SEED_USERS = [
  { username: 'user', password: '1234', role: 'user', name: 'ผู้ใช้งาน' },
  { username: 'admin', password: '1234', role: 'admin', name: 'ผู้ดูแลระบบ' },
]

function loadCustom() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function loadAll() {
  return [...SEED_USERS, ...loadCustom()]
}

export function login(username, password) {
  const u = loadAll().find((x) => x.username === username.trim() && x.password === password)
  if (!u) return { ok: false }
  const user = { username: u.username, role: u.role, name: u.name }
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)) } catch { /* ignore */ }
  return { ok: true, user }
}

export function register(username, password, name) {
  const uname = username.trim()
  if (!uname || !password) return { ok: false, error: 'empty' }
  if (loadAll().some((x) => x.username === uname)) return { ok: false, error: 'exists' }
  const list = [...loadCustom(), { username: uname, password, role: 'user', name: name.trim() || uname }]
  try { localStorage.setItem(USERS_KEY, JSON.stringify(list)) } catch { /* ignore */ }
  return { ok: true }
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

export function logout() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
}