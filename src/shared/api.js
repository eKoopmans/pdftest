const state = {
  connection: null,
}

export async function connect(url) {
  state.connection = url
  return await handshake()
}

export function getConnection() {
  return state.connection
}

async function handshake() {
  if (await get('', 'text')) {
    return console.log(`pdftest: Successfully connected to ${getConnection()}.`)
  }
  return console.error(`pdftest: Failed to connect to ${getConnection()}.`)
}

/**
 * Get a PDF file from the server.
 * @param {string} filepath Path of the target file.
 * @param {string} [returnType='arrayBuffer'] One of 'arrayBuffer' or 'blob' (see fetch API).
 */
export async function get(filepath, returnType='arrayBuffer') {
  if (!state.connection) {
    return console.error('pdftest.api.get: Not connected to a server. Use api.connect(url) first.')
  }

  try {
    const response = await fetch(`${state.connection}/${filepath}`)
    return response.ok ? await response[returnType]() : undefined
  } catch (e) {
    return undefined
  }
}

/**
 * Get a PDF file from the server, or create it with the given data if it doesn't exist.
 * @param {string} filepath Path of the target file.
 * @param {File} defaultValue The value to save if no snapshot exists.
 * @param {string} [returnType='arrayBuffer'] One of 'arrayBuffer' or 'blob' (see fetch API).
 */
export async function getSnapshot(filepath, defaultValue, returnType='arrayBuffer') {
  if (!state.connection) {
    return console.error('pdftest.api.getSnapshot: Not connected to a server. Use api.connect(url) first.')
  }

  try {
    const response = await fetch(`${state.connection}/${filepath}`, {
      method: 'POST',
      body: defaultValue,
    })
    return response.ok ? await response[returnType]() : undefined
  } catch (e) {
    return undefined
  }
}

/**
 * Save a PDF file to the server and return it.
 * @param {string} filepath Path of the target file.
 * @param {File} data The value to save.
 * @param {string} [returnType='arrayBuffer'] One of 'arrayBuffer' or 'blob' (see fetch API).
 */
export async function put(filepath, data, returnType='arrayBuffer') {
  if (!state.connection) {
    return console.error('pdftest.api.put: Not connected to a server. Use api.connect(url) first.')
  }

  try {
    const response = await fetch(`${state.connection}/${filepath}`, {
      method: 'PUT',
      body: data,
    })
    return response.ok ? await response[returnType]() : undefined
  } catch (e) {
    return undefined
  }
}
