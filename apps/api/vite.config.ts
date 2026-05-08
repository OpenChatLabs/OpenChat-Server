import { cloudflare } from '@cloudflare/vite-plugin'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'

/** 在 Node 侧加载 `.env`；Worker 运行时请使用 Wrangler 的 `.dev.vars` 或面板环境变量 */
dotenv.config({ quiet: true })

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin()],
})
