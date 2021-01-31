import express from 'express'
import cors from 'cors'

function setupServer(app, root) {
  app.use(cors())
  app.use(express.static(root))
}

function serve(port, root) {
  port = port || 8000
  root = root || '.'

  const app = express()
  setupServer(app, root)

  app.listen(port, () => {
    console.log(`pdftest: Serving '${root}' at http://localhost:${port}`)
  })
}

export default serve
