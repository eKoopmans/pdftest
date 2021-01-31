const state = {
  connection: null,
}

export function connect(url) {
  state.connection = url
}

export function getConnection() {
  return state.connection
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
 * @param {} defaultValue The value to save if no snapshot exists.
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
