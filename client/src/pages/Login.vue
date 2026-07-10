<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="material-symbols-rounded logo-icon">music_note</span>
        <h1 class="login-title">WebMusic</h1>
        <p class="login-subtitle">{{ isSetup ? '初始化管理员账号' : '登录以管理设置' }}</p>
      </div>

      <div v-if="loading" class="login-loading">
        <span class="material-symbols-rounded spinning">sync</span>
        <span>加载中...</span>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="login-form">
        <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>

        <div class="field">
          <label>用户名</label>
          <input v-model="form.username" type="text" class="login-input" placeholder="输入用户名" autocomplete="username" />
        </div>

        <div class="field">
          <label>密码</label>
          <input v-model="form.password" type="password" class="login-input" placeholder="输入密码" autocomplete="current-password" />
        </div>

        <div v-if="isSetup" class="field">
          <label>确认密码</label>
          <input v-model="form.confirmPassword" type="password" class="login-input" placeholder="再次输入密码" autocomplete="new-password" />
        </div>

        <button type="submit" class="login-btn" :disabled="submitting">
          <span class="material-symbols-rounded">{{ submitting ? 'sync' : isSetup ? 'person_add' : 'login' }}</span>
          {{ submitting ? '处理中...' : isSetup ? '创建管理员' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ username: '', password: '', confirmPassword: '' })
const errorMsg = ref('')
const submitting = ref(false)
const loading = ref(true)

const isSetup = computed(() => auth.setupRequired)

onMounted(async () => {
  if (!auth.initialized) await auth.checkStatus()
  if (auth.loggedIn) {
    router.replace(route.query.redirect || '/')
    return
  }
  loading.value = false
})

async function handleSubmit() {
  errorMsg.value = ''

  if (!form.username.trim() || !form.password) {
    errorMsg.value = '请填写用户名和密码'
    return
  }

  if (isSetup.value) {
    if (form.password.length < 6) {
      errorMsg.value = '密码长度不能少于6位'
      return
    }
    if (form.password !== form.confirmPassword) {
      errorMsg.value = '两次密码输入不一致'
      return
    }
  }

  submitting.value = true
  try {
    if (isSetup.value) {
      await auth.setup(form.username.trim(), form.password)
    } else {
      await auth.login(form.username.trim(), form.password)
    }
    router.replace(route.query.redirect || '/')
  } catch (e) {
    errorMsg.value = e.message
  }
  submitting.value = false
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--md-surface-container);
  border-radius: 20px;
  padding: 40px 32px;
  border: 1px solid var(--md-outline-variant);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  color: var(--md-primary);
  margin-bottom: 8px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--md-on-surface);
  margin: 0 0 6px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--md-on-surface-variant);
  margin: 0;
}

.login-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: var(--md-on-surface-variant);
  font-size: 14px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
}

.login-error {
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--md-error-container);
  color: var(--md-on-error-container);
  font-size: 13px;
  margin-bottom: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--md-on-surface-variant);
  margin-bottom: 6px;
}

.login-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--md-outline);
  border-radius: 10px;
  background: var(--md-surface);
  color: var(--md-on-surface);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.login-input:focus {
  border-color: var(--md-primary);
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: var(--md-primary);
  color: var(--md-on-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.15s;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 28px 20px;
  }
}
</style>
