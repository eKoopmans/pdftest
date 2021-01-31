import { compare, compareToSnapshot } from './compare'
import * as api from '../shared/api'

const client = {
  compare,
  compareToSnapshot,
}

export {
  client,
  api
}
