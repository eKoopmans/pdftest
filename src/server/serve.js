import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

function writeFile(path, data) {
  fs.writeFileSync(path, data)
}

function handlePostPut(root) {
  return (req, res, next) => {
    const requestedFile = path.join(root, req.url)

    switch (req.method) {
      case 'POST':
        if (fs.existsSync(requestedFile)) { req.method = 'GET'; break }
      case 'PUT':
        writeFile(requestedFile, req.body)
        req.method = 'GET'
    }

    next()
  }
}

function handleHandshake(req, res, next) {
  if (req.method === 'GET' && req.url === '/') {
    return res.status(200).send('OK')
  }
  next()
}

function setupServer(app, root) {
  app.use(cors())
  app.use(express.raw({ type: 'application/pdf' }))
  app.use(handlePostPut(root))
  app.use(handleHandshake)
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
