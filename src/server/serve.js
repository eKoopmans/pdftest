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
  if (['GET', 'HEAD'].includes(req.method) && req.url === '/') {
    return res.status(200).end()
  }
  next()
}

function setupServer(root) {
  const app = express()
  app.use(cors())
  app.use(express.raw({ type: ['application/octet-stream', 'application/pdf'] }))
  app.use(handlePostPut(root))
  app.use(handleHandshake)
  app.use(express.static(root))

  return app
}

function serve(port = 8000, root = '.') {
  let promiseHandler
  const serverPromise = new Promise((resolve, reject) => { promiseHandler = { resolve, reject } })
  const app = setupServer(root)

  app.listen(port, () => {
    console.log(`pdftest: Serving '${root}' at http://localhost:${port}`)
    promiseHandler.resolve()
  })
  process.on('uncaughtException', promiseHandler.reject)

  return serverPromise
}

export default serve
