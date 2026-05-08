import { cloudflare } from '@cloudflare/vite-plugin'
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '../..')

/** 先读 monorepo 根目录 `.env`，再读 `apps/api/.env`（后者覆盖同名变量） */
dotenv.config({ path: resolve(repoRoot, '.env'), quiet: true })
dotenv.config({ path: resolve(__dirname, '.env'), quiet: true, override: true })

/** Cloudflare Worker 内 process.env 需由 Vite 在打包时注入（勿使用 process.env[name] 动态读取） */
const WORKER_ENV_KEYS = [
  'ROOT_USERNAME',
  'ROOT_PASSWORD',
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
] as const

function workerEnvDefine(): Record<string, string> {
  const def: Record<string, string> = {}
  for (const key of WORKER_ENV_KEYS) {
    const v = process.env[key]
    def[`process.env.${key}`] = JSON.stringify(v ?? '')
  }
  return def
}

export default defineConfig({
  define: workerEnvDefine(),
  plugins: [cloudflare(), ssrPlugin()],
})
