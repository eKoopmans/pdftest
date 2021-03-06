import fetch from 'cross-fetch'

const state = {
  connection: null,
}

export async function connect(url, options = {}) {
  state.connection = url
  await handshake()
  options.verbose && console.log(`pdftest: Successfully connected to ${getConnection()}.`)
}

export function getConnection() {
  return state.connection
}

function handshake() {
  try {
    return get('', 'text')
  } catch (e) {
    throw new Error(`Failed to connect to ${getConnection()}: ${e.message}`)
  }
}

function verifyConnection() {
  if (!getConnection()) {
    throw new Error('Not connected to a server. Use api.connect(url) first.')
  }
}

async function handleResponse(response, returnType) {
  if (!response.ok) {
    throw new Error(`Server returned a status of ${response.status}.`)
  }
  return await response[returnType]()
}

/**
 * Get a PDF file from the server.
 * @param {string} filepath Path of the target file.
 * @param {string} [returnType='arrayBuffer'] One of 'arrayBuffer' or 'blob' (see fetch API).
 */
export async function get(filepath, returnType='arrayBuffer') {
  verifyConnection()
  const response = await fetch(`${getConnection()}/${filepath}`)
  return await handleResponse(response, returnType)
}

/**
 * Get a PDF file from the server, or create it with the given data if it doesn't exist.
 * @param {string} filepath Path of the target file.
 * @param {File} defaultValue The value to save if no snapshot exists.
 * @param {string} [returnType='arrayBuffer'] One of 'arrayBuffer' or 'blob' (see fetch API).
 */
export async function getSnapshot(filepath, defaultValue, returnType='arrayBuffer') {
  verifyConnection()
  const response = await fetch(`${getConnection()}/${filepath}`, {
    method: 'POST',
    body: defaultValue,
    headers: { 'Content-Type': 'application/octet-stream' },
  })
  return await handleResponse(response, returnType)
}

/**
 * Save a PDF file to the server and return it.
 * @param {string} filepath Path of the target file.
 * @param {File} data The value to save.
 * @param {string} [returnType='arrayBuffer'] One of 'arrayBuffer' or 'blob' (see fetch API).
 */
export async function put(filepath, data, returnType='arrayBuffer') {
  verifyConnection()
  const response = await fetch(`${getConnection()}/${filepath}`, {
    method: 'PUT',
    body: data,
    headers: { 'Content-Type': 'application/octet-stream' },
  })
  return await handleResponse(response, returnType)
}
