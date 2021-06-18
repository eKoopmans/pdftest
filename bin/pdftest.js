#!/usr/bin/env node

const { program } = require('commander')
const fs = require('fs')
const path = require('path')
const pdftest = require('../dist/pdftest.cjs.js')
const pkg = require('../package.json')

const datastore = path.resolve(__dirname, 'data.json');

program.version(pkg.version, '-v, --version')
program
  .command('serve [port] [root]')
  .description('Serve PDF files')
  .option('--limit <file-size>', 'File size limit (default="100mb")')
  .action(serve)
program
  .command('start [port] [root]')
  .description('Start a PDF server (non-blocking)')
  .action(start)
program
  .command('stop [port]')
  .description('Stop a PDF server created by pdftest start')
  .action(stop)
program
  .command('compare <file1> <file2>')
  .description('Compare two PDF files')
  .action(compare)
program.parse(process.argv)

async function compare(file1, file2) {
  // TODO: Update pdftest.compare for Node compatibility:
  //    - avoid reference to File
  //    - use `npm install --save canvas`
  //    - see example:
  //      https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.js
  const data = [file1, file2].map(filename => {
    return new Uint8Array(fs.readFileSync(filename))
  })
  const res = await pdftest.client.compare(data[0], data[1])
  console.log(res)
}

function serve(port, root, options) {
  const cleanedOptions = { limit: options.limit };
  return pdftest.server.serve(port, root, cleanedOptions).catch(console.error)
}

function start(port, root) {
  const { spawn } = require('child_process')
  const args = root ? [port, root] : port ? [port] : []

  stop(port)

  console.log(`pdftest: Starting server${port ? ` on port ${port}` : ''}`)
  const serverProcess = spawn('node', [__filename, 'serve', ...args], {
    stdio: [process.stdin, process.stdout, process.stderr],
    detached: true,
  })
  serverProcess.unref()

  const data = fs.existsSync(datastore) ? JSON.parse(fs.readFileSync(datastore) || '{}') : {}
  data[port] = { pid: serverProcess.pid }
  fs.writeFileSync(datastore, JSON.stringify(data))
}

function stop(port) {
  const data = fs.existsSync(datastore) ? JSON.parse(fs.readFileSync(datastore) || '{}') : {}

  if (data[port]) {
    console.log(`pdftest: Stopping server${port ? ` on port ${port}` : ''}`)
    try { process.kill(data[port].pid) } catch {}
    delete data[port]
  }

  fs.writeFileSync(datastore, JSON.stringify(data))
}
