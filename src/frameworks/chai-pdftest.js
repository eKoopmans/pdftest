/* global window */

if (typeof window === 'undefined' || !window.Mocha || !window.chai) {
  throw new Error('chai-pdftest requires access to window.Mocha and window.chai.')
}

// Slimmed-down version of lodash/kebabcase, without toString or unicode logic.
function kebabCase(string) {
  const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g
  const words = (string) => string.match(reAsciiWord) || []

  return words(string.replace(/['\u2019]/g, '')).reduce((result, word, index) => (
    result + (index ? '-' : '') + word.toLowerCase()
  ), '')
}

function createSnapshotIdentifier(node, index) {
  const recurseNode = (node) => `${node.parent ? recurseNode(node.parent) : ''} ${node.title}`
  return `${kebabCase(recurseNode(node))}-${index + 1}.pdf`
}

const mochaContext = {
  context: null,
  index: 0,
}

const run_original = window.Mocha.Runnable.prototype.run
window.Mocha.Runnable.prototype.run = function () {
  mochaContext.context = this.ctx
  mochaContext.index = 0
  return run_original.apply(this, arguments)
}

window.chai.Assertion.addMethod('matchPdfSnapshot', async function (options = {}) {
  const { customSnapshotIdentifier } = options

  // Remove timeouts so the PDF snapshot GUI can wait on user feedback.
  mochaContext.context.timeout(0)

  const mochaTest = mochaContext.context.currentTest || mochaContext.context.test
  const snapshotIdentifier = customSnapshotIdentifier || createSnapshotIdentifier(mochaTest, mochaContext.index++)

  const obj = this._obj
  const result = await pdftest.compareToSnapshot(obj, snapshotIdentifier, options)
  this.assert(result.match === true, `PDF does not match stored snapshot ${snapshotIdentifier}.`, `PDF matches stored snapshot ${snapshotIdentifier}.`)
})
