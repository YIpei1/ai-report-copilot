import { authHandlers } from '../login'
import { baseDataHandlers } from '../baseData'
import { reportHandlers } from '../report'
import { userHandlers } from '../user'

export const handlers = [...authHandlers, ...userHandlers, ...baseDataHandlers, ...reportHandlers]
