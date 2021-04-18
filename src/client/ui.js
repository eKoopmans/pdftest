import { put } from '../shared/api'

export async function showDiff(comparison, snapshotName) {
  // TODO:
  // - fix this to show all diff pages (rather than just page 0)
  // - handle comparison errors (e.g. mismatched # of pages or page sizes)

  const popupWindow = window.open('', '_blank', 'width=400,height=700')
  const popupDocument = popupWindow.document
  popupDocument.body.innerHTML = `
    <h3>Visual change detected</h3>
    <p>How would you like to treat the new PDF?</p>
    <div>
      <img id="diffImg" style="width: 100%; border: 1px solid black;">
    </div>
    <div>
      <button id="ignore">Ignore (Skip)</button>
      <button id="reject">Reject (Fail test)</button>
      <button id="accept">Accept (Overwrite)</button>
    </div>
  `

  const canvas = document.createElement('canvas')
  const diffImg = comparison.pageResults[0].diffImg
  canvas.width = diffImg.width
  canvas.height = diffImg.height
  canvas.getContext('2d').putImageData(diffImg, 0, 0)

  const targetImg = popupDocument.body.querySelector('#diffImg')
  targetImg.src = canvas.toDataURL('image/png')

  return new Promise((resolve, reject) => {
    const resolveAndClose = (value) => {
      resolve({ ...comparison, match: value })
      popupWindow.close()
    }
    popupWindow.addEventListener('unload', () => resolveAndClose(false))
    popupDocument.querySelector('#ignore').addEventListener('click', () => resolveAndClose(true))
    popupDocument.querySelector('#reject').addEventListener('click', () => resolveAndClose(false))
    popupDocument.querySelector('#accept').addEventListener('click', async () => {
      await put(snapshotName, comparison.source[0])
      resolveAndClose(true)
    })
  })
}
