import { put } from '../shared/api'

export async function showDiff(comparison, snapshotName) {
  // TODO:
  // - fix this to show all diff pages (rather than just page 0)
  // - handle comparison errors (e.g. mismatched # of pages or page sizes)
  // - allow showDiff to be skipped (e.g. on CI/CD)

  // showDiff fails in IE due to a TypeMismatchError: the ImageData type is
  // modified in the base window, but not in the popup window, which causes
  // issues on putImageData.
  const isIE = /*@cc_on!@*/false || !!document.documentMode
  if (isIE) {
    console.error('showDiff is not available on Internet Explorer.')
    return comparison
  }

  const popupWindow = window.open('', '_blank', 'width=400,height=700')
  const popupDocument = popupWindow.document
  popupDocument.body.innerHTML = `
    <h3>Visual change detected</h3>
    <p>How would you like to treat the new PDF?</p>
    <div>
      <canvas id="diffCanvas" style="width: 100%; border: 1px solid black;"></canvas>
    </div>
    <div>
      <button id="ignore">Ignore (Skip)</button>
      <button id="reject">Reject (Fail test)</button>
      <button id="accept">Accept (Overwrite)</button>
    </div>
  `

  const canvas = popupDocument.body.querySelector('#diffCanvas')
  const diffImg = comparison.pageResults[0].diffImg
  canvas.width = diffImg.width
  canvas.height = diffImg.height
  canvas.getContext('2d').putImageData(diffImg, 0, 0)

  return new Promise((resolve, reject) => {
    const resolveAndClose = (value) => {
      resolve({ ...comparison, match: value })
      popupWindow.close()
    }
    popupDocument.querySelector('#ignore').addEventListener('click', () => resolveAndClose(true))
    popupDocument.querySelector('#reject').addEventListener('click', () => resolveAndClose(false))
    popupDocument.querySelector('#accept').addEventListener('click', async () => {
      await put(snapshotName, comparison.source[0])
      resolveAndClose(true)
    })
  })
}
