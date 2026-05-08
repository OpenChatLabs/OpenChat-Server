<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  apiFetch,
  apiUrl,
  decodeJwtPayload,
  getToken,
  setToken,
} from '@/lib/api'

type AccountRow = { id: string; username: string; role: string }

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const token = ref<string | null>(null)
const accounts = ref<AccountRow[] | null>(null)
const accountsLoading = ref(false)

const sessionPayload = computed(() => {
  const t = token.value
  if (!t) return null
  return decodeJwtPayload(t)
})

const sessionRole = computed(() => {
  const p = sessionPayload.value
  const r = p?.role
  return typeof r === 'string' ? r : null
})

const createUsername = ref('')
const createPassword = ref('')
const createEmail = ref('')
const createRole = ref<'admin' | 'user'>('user')

watch(
  sessionRole,
  (role) => {
    if (role === 'root') createRole.value = 'admin'
    else if (role === 'admin') createRole.value = 'user'
    else createRole.value = 'user'
  },
  { immediate: true },
)
const createBusy = ref(false)

async function login() {
  errorMsg.value = null
  loading.value = true
  try {
    const res = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value.trim(),
        password: password.value,
      }),
    })
    const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string }
    if (!res.ok) {
      errorMsg.value = data.error ?? `登录失败 (${res.status})`
      return
    }
    if (!data.token) {
      errorMsg.value = '响应缺少 token'
      return
    }
    setToken(data.token)
    token.value = data.token
    password.value = ''
    await loadAccounts()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '网络错误'
  } finally {
    loading.value = false
  }
}

function logout() {
  setToken(null)
  token.value = null
  accounts.value = null
}

async function loadAccounts() {
  accountsLoading.value = true
  errorMsg.value = null
  try {
    const res = await apiFetch('/accounts')
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      errorMsg.value = (data as { error?: string })?.error ?? `加载失败 (${res.status})`
      accounts.value = null
      return
    }
    accounts.value = data as AccountRow[]
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '网络错误'
  } finally {
    accountsLoading.value = false
  }
}

async function createAccount() {
  createBusy.value = true
  errorMsg.value = null
  try {
    const body: Record<string, string> = {
      username: createUsername.value.trim(),
      password: createPassword.value,
      role: createRole.value,
    }
    const em = createEmail.value.trim()
    if (em) body.email = em

    const res = await apiFetch('/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    if (!res.ok) {
      errorMsg.value = data.error ?? `创建失败 (${res.status})`
      return
    }
    createUsername.value = ''
    createPassword.value = ''
    createEmail.value = ''
    await loadAccounts()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '网络错误'
  } finally {
    createBusy.value = false
  }
}

onMounted(async () => {
  token.value = getToken()
  if (token.value) await loadAccounts()
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10">
    <header class="mb-10 border-b border-slate-800 pb-6">
      <h1 class="text-2xl font-semibold tracking-tight text-white">OpenChat</h1>
      <p class="mt-1 text-sm text-slate-400">简易控制台 · Tailwind CSS</p>
    </header>

    <div
      v-if="errorMsg"
      class="mb-6 rounded-lg border border-rose-900/50 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
    >
      {{ errorMsg }}
    </div>

    <section
      v-if="!token"
      class="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl"
    >
      <h2 class="text-lg font-medium text-slate-200">登录</h2>
      <p class="mt-1 text-sm text-slate-500">使用 root 或 Supabase Auth 账号</p>
      <form class="mt-5 space-y-4" @submit.prevent="login">
        <div>
          <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">用户名</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-teal-500/0 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            required
          />
        </div>
        <div>
          <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">密码</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 disabled:opacity-50"
        >
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>
    </section>

    <template v-else>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm text-slate-400">
            已登录
            <span v-if="sessionRole" class="ml-2 rounded bg-slate-800 px-2 py-0.5 text-xs text-teal-300">
              {{ sessionRole }}
            </span>
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          @click="logout"
        >
          退出
        </button>
      </div>

      <section class="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-medium text-slate-200">账号列表</h2>
          <button
            type="button"
            :disabled="accountsLoading"
            class="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            @click="loadAccounts"
          >
            {{ accountsLoading ? '加载中…' : '刷新' }}
          </button>
        </div>

        <div v-if="accounts === null && !accountsLoading" class="mt-4 text-sm text-slate-500">
          点击「刷新」加载
        </div>

        <ul
          v-else-if="accounts?.length"
          class="mt-4 divide-y divide-slate-800 rounded-lg border border-slate-800"
        >
          <li
            v-for="a in accounts"
            :key="a.id"
            class="flex items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <span class="font-medium text-slate-200">{{ a.username }}</span>
            <span class="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{{ a.role }}</span>
          </li>
        </ul>

        <p v-else-if="!accountsLoading" class="mt-4 text-sm text-slate-500">暂无账号</p>
      </section>

      <section class="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
        <h2 class="text-lg font-medium text-slate-200">创建账号</h2>
        <p class="mt-1 text-sm text-slate-500">
          <span v-if="sessionRole === 'root'">root 可创建「管理员」或「普通用户」。</span>
          <span v-else-if="sessionRole === 'admin'">管理员可创建「管理员」或「普通用户」。</span>
          <span v-else>
            若当前为管理员/root 登录但此处未显示角色，以服务端校验为准；普通用户无法创建账号。
          </span>
        </p>
        <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="createAccount">
          <div class="sm:col-span-2">
            <label class="text-xs font-medium uppercase text-slate-500">用户名</label>
            <input
              v-model="createUsername"
              required
              class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-medium uppercase text-slate-500">密码</label>
            <input
              v-model="createPassword"
              type="password"
              required
              class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
          <div>
            <label class="text-xs font-medium uppercase text-slate-500">角色</label>
            <select
              v-model="createRole"
              class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="user">user（普通用户）</option>
              <option value="admin">admin（管理员）</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium uppercase text-slate-500">邮箱（可选）</label>
            <input
              v-model="createEmail"
              type="email"
              placeholder="默认生成 *@users.openchat.local"
              class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
          <div class="sm:col-span-2">
            <button
              type="submit"
              :disabled="createBusy"
              class="w-full rounded-lg border border-teal-700/50 bg-teal-950/50 py-2.5 text-sm font-medium text-teal-200 hover:bg-teal-900/40 disabled:opacity-50"
            >
              {{ createBusy ? '提交中…' : '创建' }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </div>
</template>
