import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/cloudflare-workers'

const messagesRouter = new Hono()

messagesRouter.get('/', async (c) => {
  return c.json({ message: 'Hello, world!' })
})

messagesRouter.get(
  '/ws',
  upgradeWebSocket(() => ({
    onMessage() {},
    onClose() {},
    onError() {},
  }))
)

export default messagesRouter