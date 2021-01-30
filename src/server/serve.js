import express from 'express'

function setupServer(app, root) {
  app.use(express.static(root))
}

function serve(port, root) {
  port = port || 8000
  root = root || '.'

  const app = express()
  setupServer(app, root)

  app.listen(port, () => {
    console.log(`pdftest: Serving '${root}' at http://locatlhost:${port}`)
  })
}

export default serve
