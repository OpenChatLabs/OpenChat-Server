import { Hono } from 'hono'
import { renderer } from './renderer'
import { accountsRouter } from './router/accounts'
import messagesRouter from './router/mesages'
import { loginRouter } from './router/login'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.route('/auth/login', loginRouter)
app.route('/accounts', accountsRouter)
app.route('/messages', messagesRouter)

export default app
