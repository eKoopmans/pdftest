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
  .option('--silent', 'Silent mode')
  .option('--debug', 'Debug mode')
  .action(serve)
program
  .command('start [port] [root]')
  .description('Start a PDF server (non-blocking)')
  .option('--limit <file-size>', 'File size limit (default="100mb")')
  .option('--silent', 'Silent mode')
  .option('--debug', 'Debug mode')
  .action(start)
program
  .command('stop [port]')
  .description('Stop a PDF server created by pdftest start')
  .option('--silent', 'Silent mode')
  .action(stop)
program
  .command('compare <file1> <file2>')
  .description('Compare two PDF files')
  .option('--silent', 'Silent mode')
  .action(compare)
program.parse(process.argv)

async function compare(file1, file2, options) {
  // TODO: Update pdftest.compare for Node compatibility:
  //    - avoid reference to File
  //    - use `npm install --save canvas`
  //    - see example:
  //      https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.js
  const cleanedOptions = { verbose: !options.silent }
  const data = [file1, file2].map(filename => {
    return new Uint8Array(fs.readFileSync(filename))
  })

  const res = await pdftest.client.compare(data[0], data[1], cleanedOptions)
  console.log(res)
}

function serve(port, root, options) {
  const cleanedOptions = { limit: options.limit, verbose: !options.silent };
  return pdftest.server.serve(port, root, cleanedOptions).catch(console.error)
}

function start(port = 'default (8000)', root, options) {
  const { spawn } = require('child_process')

  stop(port, options)

  // Pass command-line arguments through to 'serve'.
  const args = process.argv.slice(process.argv.indexOf('start') + 1);

  !options.silent && console.log(`pdftest: Starting server on port ${port}`)
  const serverProcess = spawn('node', [__filename, 'serve', ...args], {
    stdio: options.debug ? 'pipe' : 'ignore',
    detached: true,
  })
  serverProcess.unref()

  if (options.debug) {
    serverProcess.stdin.pipe(process.stdin)
    serverProcess.stdout.pipe(process.stdout)
    serverProcess.stderr.pipe(process.stderr)
  }

  const data = fs.existsSync(datastore) ? JSON.parse(fs.readFileSync(datastore) || '{}') : {}
  data[port] = { pid: serverProcess.pid }
  fs.writeFileSync(datastore, JSON.stringify(data))
}

function stop(port = 'all', options) {
  const data = fs.existsSync(datastore) ? JSON.parse(fs.readFileSync(datastore) || '{}') : {}
  const ports = port === 'all' ? Object.keys(data) : [ port ];
  let anyChange = false;

  ports.forEach(port => {
    if (data[port]) {
      !options.silent && console.log(`pdftest: Stopping server on port ${port}`)
      try { process.kill(data[port].pid) } catch {}
      delete data[port]
      anyChange = true
    }
  });

  anyChange && fs.writeFileSync(datastore, JSON.stringify(data))
}
