import pdfjs from 'pdfjs-dist'

function readFileAsync(file) {
  // Create a promise that resolves when the file is loaded.
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

async function getPdfObject(src) {
  if (typeof File !== 'undefined' && src instanceof File) {
    src = await readFileAsync(src)
  }
  return await pdfjs.getDocument(src).promise
}

function getPdfObjects(pdf1, pdf2) {
  return Promise.all([pdf1, pdf2].map(getPdfObject))
}

async function getPageImage(pdfObject, i, targetWidth) {
  // Fail for invalid pages.
  if (0 > i || i >= pdfObject.numPages) {
    return null
  }

  // Get the PDF page and scale it to the target width.
  const page = await pdfObject.getPage(i + 1)
  const scale = targetWidth ? targetWidth / Math.floor(page.view[2]) : 1;
  const viewport = page.getViewport({scale: scale})

  // Render the PDF page to a canvas.
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')
  // Note: page.render can take a long time (e.g. 2+ min for an 80MB PDF).
  // Performance could be improved by loading pdf.js with a worker-loader - see:
  // https://github.com/mozilla/pdf.js/tree/master/examples/webpack#worker-loading
  await page.render({ canvasContext: context, viewport: viewport }).promise

  // Return the canvas' imageData with scale info attached.
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  return Object.assign(imageData, { scale: scale })
}

async function getPageImages(pdfObjects, page) {
  const pageImg1 = await getPageImage(pdfObjects[0], page)
  const pageImg2 = await getPageImage(pdfObjects[1], page, pageImg1 && pageImg1.width)
  let error

  // Handle incompatible pages.
  if (!pageImg1 || !pageImg2) {
    error = { type: 'missing_page', data: [pageImg1, pageImg2] }
  }
  else if (pageImg1.width !== pageImg2.width || pageImg1.height !== pageImg2.height) {
    error = { type: 'mismatched_size', data: [pageImg1, pageImg2] }
  }

  return [ pageImg1, pageImg2, error ]
}

export { getPdfObject, getPdfObjects, getPageImage, getPageImages }
