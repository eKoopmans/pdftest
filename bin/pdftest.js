#!/usr/bin/env node

const { program } = require('commander')

program
  .command('serve [port]')
  .description('Serve PDF files')
  .action(port => {
    console.log(`serving on port ${port}`)
  })

program
  .command('compare <file1> <file2>')
  .description('Compare two PDF files')
  .action((file1, file2) => {
    console.log(file1, file2)
  })

program.parse(process.argv)
