<script setup>
import { ref, reactive } from 'vue'
import { Calendar, User, Lock, LogIn, UserPlus } from 'lucide-vue-next'
import { login, register } from './auth'

const emit = defineEmits(['login'])
const mode = ref('login')
const error = ref('')
const form = reactive({ username: '', password: '', confirm: '', name: '' })

function switchMode(m) {
  mode.value = m
  error.value = ''
}

function submit() {
  error.value = ''
  if (mode.value === 'login') {
    const r = login(form.username, form.password)
    if (!r.ok) { error.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'; return }
    emit('login', r.user)
    return
  }
  if (!form.username.trim() || !form.password) { error.value = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'; return }
  if (form.password !== form.confirm) { error.value = 'รหัสผ่านไม่ตรงกัน'; return }
  const r = register(form.username, form.password, form.name)
  if (!r.ok) {
    error.value = r.error === 'exists' ? 'ชื่อผู้ใช้นี้มีอยู่แล้ว' : 'กรุณากรอกข้อมูลให้ครบ'
    return
  }
  const l = login(form.username, form.password)
  emit('login', l.user)
}
</script>

<template>
  <div class="login-page">
    <div class="card">
      <div class="brand">
        <span class="logo"><Calendar :size="26" /></span>
        <div>
          <h1>BTT Beauty Space</h1>
          <p class="muted">{{ mode === 'login' ? 'เข้าสู่ระบบเพื่อจองบริการ' : 'สร้างบัญชีใหม่' }}</p>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button type="button" :class="{ on: mode === 'login' }" @click="switchMode('login')">เข้าสู่ระบบ</button>
        <button type="button" :class="{ on: mode === 'register' }" @click="switchMode('register')">สมัครสมาชิก</button>
      </div>

      <form novalidate @submit.prevent="submit">
        <label v-if="mode === 'register'" class="field">
          <span class="label">ชื่อที่แสดง</span>
          <span class="input"><User :size="18" /><input v-model="form.name" placeholder="เช่น สมชาย" /></span>
        </label>

        <label class="field">
          <span class="label">ชื่อผู้ใช้</span>
          <span class="input"><User :size="18" /><input v-model="form.username" autocomplete="username" placeholder="กรอกชื่อผู้ใช้" /></span>
        </label>

        <label class="field">
          <span class="label">รหัสผ่าน</span>
          <span class="input"><Lock :size="18" /><input v-model="form.password" type="password" autocomplete="current-password" placeholder="กรอกรหัสผ่าน" /></span>
        </label>

        <label v-if="mode === 'register'" class="field">
          <span class="label">ยืนยันรหัสผ่าน</span>
          <span class="input"><Lock :size="18" /><input v-model="form.confirm" type="password" autocomplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง" /></span>
        </label>

        <p v-if="error" class="err">{{ error }}</p>

        <button class="btn" type="submit">
          <LogIn v-if="mode === 'login'" :size="18" />
          <UserPlus v-else :size="18" />
          {{ mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครและเข้าสู่ระบบ' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  --brand: #ff1493; --brand-dark: #d10a77; --brand-soft: #fdecf4; --ink: #2b1a26; --muted: #8f7b88;
  --line: #f0dbe6; --danger: #d92d20;
  min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; padding: 24px 16px;
  box-sizing: border-box; color: var(--ink); font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif;
  line-height: 1.55; text-align: left;
}
.card {
  width: 100%; max-width: 420px; background: #fff; border-radius: 16px; padding: 28px 28px 24px; box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(43, 26, 38, .05), 0 8px 24px rgba(43, 26, 38, .08);
}
.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.brand h1 { margin: 0; font-size: 1.3rem; font-weight: 700; }
.muted { margin: 0; color: var(--muted); font-size: .9rem; }
.logo { display: grid; place-items: center; width: 48px; height: 48px; flex: none; border-radius: 14px; color: #fff; background: linear-gradient(135deg, #ff5cad, var(--brand)); }

.tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; margin-bottom: 20px; border-radius: 12px; background: #fbeaf2; }
.tabs button { min-height: 40px; border: 0; border-radius: 9px; background: transparent; color: var(--muted); font: inherit; font-weight: 600; cursor: pointer; }
.tabs button.on { background: #fff; color: var(--brand-dark); box-shadow: 0 1px 3px rgba(43, 26, 38, .15); }

.field { display: grid; gap: 8px; margin-bottom: 16px; }
.label { font-weight: 600; font-size: .92rem; }
.input {
  display: flex; align-items: center; gap: 12px; padding: 0 14px; min-height: 48px; box-sizing: border-box;
  border: 1px solid var(--line); border-radius: 12px; color: var(--muted); background: #fff;
}
.input:focus-within { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(255, 20, 147, .15); color: var(--brand); }
.input input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 16px; color: var(--ink); }
.input input::placeholder { color: #b9a6b1; }

.err { margin: 0 0 12px; color: var(--danger); font-size: .88rem; }
.btn {
  width: 100%; min-height: 50px; border: 0; border-radius: 12px; cursor: pointer; color: #fff;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  font: inherit; font-size: 1.02rem; font-weight: 600; background: linear-gradient(135deg, #ff1493, #ec0f85);
  box-shadow: 0 6px 16px rgba(255, 20, 147, .28);
}
.btn:hover { background: linear-gradient(135deg, #e5107f, var(--brand-dark)); }
</style>