/* global chai */

chai.Assertion.addMethod('matchPdfSnapshot', async function (refname, settings) {
  const obj = this._obj
  const result = await pdftest.compareToSnapshot(obj, refname, settings)
  this.assert(result.match === true, `PDF does not match stored snapshot ${refname}.`, `PDF matches stored snapshot ${refname}.`)
})
