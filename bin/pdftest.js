#!/usr/bin/env node

const { program } = require('commander')
const esrequire = require('esm')(module)
const fs = require('fs')

const pkg = require('../package.json')
const pdftest = esrequire('../src/index')

program.version(pkg.version, '-v, --version')
program
  .command('serve [port] [root]')
  .description('Serve PDF files')
  .action(pdftest.serve)
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
  const res = await pdftest.compare(data[0], data[1])
  console.log(res)
}
