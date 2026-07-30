import { authHandlers } from '../login'
import { userHandlers } from '../user'

export const handlers = [...authHandlers, ...userHandlers]
