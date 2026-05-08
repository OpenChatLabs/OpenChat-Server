import 'hono'
import type { AuthUser } from './auth'

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}
