import { Hono } from 'hono'
import { MessagePayload, MessageSignature } from '../types/message'

const messagesRouter = new Hono()

messagesRouter.post('/', async (c) => {
  return c.json({ message: 'Hello, world!' })
})

export default messagesRouter