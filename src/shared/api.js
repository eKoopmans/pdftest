const state = {
  connection: null,
}

export function connect(url) {
  state.connection = url
}

export function getConnection() {
  return state.connection
}

export async function get(filepath) {
  if (!state.connection) {
    return console.error('pdftest.api.get: Not connected to a server. Use api.connect(url) first.')
  }

  try {
    const response = await fetch(`${state.connection}/${filepath}`)
    return response.ok ? await response.arrayBuffer() : undefined
  } catch (e) {
    return undefined
  }
}
