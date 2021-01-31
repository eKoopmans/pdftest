// TODO: Remove this file entirely. Imports should be done directly via
// 'src/client' and 'src/server'. Client requires browser and server requires
// node - there should be no occasion where a single consumer uses both.

import { client, api } from './client'
import * as server from './server'

export {
  client,
  server,
  api,
}
