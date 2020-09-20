import pdfjs from 'pdfjs-dist'
import pixelmatch from 'pixelmatch'

function readFileAsync(file) {
  // Create a promise that resolves when the file is loaded.
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
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
  await page.render({canvasContext: context, viewport: viewport}).promise

  // Return the canvas' imageData with scale info attached.
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  return Object.assign(imageData, {
    scale: scale,
  })
}

async function compare(pdf1, pdf2, settings) {
  // Set up default settings for pixelmatch.
  settings = {
    failureThreshold: 0,
    failureThresholdType: 'pixel',
    pixelmatch: { threshold: 0.1 },
    ...settings
  }

  // Load the PDF objects.
  const pdfObjects = await Promise.all([pdf1, pdf2].map(async src => {
    if (src instanceof File) {
      src = await readFileAsync(src)
    }
    return await pdfjs.getDocument(src).promise
  }))

  // Pre-allocate result object.
  const result = {
    match: true,
    nPages: Math.max(pdfObjects[0].numPages, pdfObjects[1].numPages),
    pageResults: [],
  }

  for (var i=0; i<result.nPages; i++) {
    // Initialise the page match results.
    let match = false
    let numDiffPixels = null
    let diffImg = null

    // Get the current page for both PDFs.
    const pageImg1 = await getPageImage(pdfObjects[0], i)
    const pageImg2 = await getPageImage(pdfObjects[1], i, pageImg1 && pageImg1.width)

    // Handle incompatible pages.
    if (!pageImg1 || !pageImg2) {
      console.error('missing page!', pageImg1, pageImg2)
    }
    else if (pageImg1.width !== pageImg2.width || pageImg1.height !== pageImg2.height) {
      console.error('different sizes!', pageImg1, pageImg2)
    }
    else {
      // Create a canvas and run pixelmatch.
      const diffCanvas = document.createElement('canvas')
      diffImg = diffCanvas.getContext('2d').createImageData(pageImg1.width, pageImg1.height)
      numDiffPixels = pixelmatch(pageImg1.data, pageImg2.data, diffImg.data, diffImg.width, diffImg.height, settings.pixelmatch)

      // Determine whether the page matches according to failureThreshold.
      if (settings.failureThresholdType === 'percent') {
        const numPixels = pageImg1.width * pageImg1.height
        const proportionDifferent = numDiffPixels / numPixels
        match = proportionDifferent <= settings.failureThreshold
      } else {
        match = numDiffPixels <= settings.failureThreshold
      }
    }

    // Build results for the current page.
    result.pageResults[i] = {
      match: match,
      pageImg: [pageImg1, pageImg2],
      diffImg: diffImg,
      numDiffPixels: numDiffPixels,
    }
    result.match = result.match && match
  }

  return result
}

export default compare
