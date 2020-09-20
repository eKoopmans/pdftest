import pixelmatch from 'pixelmatch'
import { getPdfObjects, getPageImages } from './read-pdf'

async function compare(pdf1, pdf2, settings) {
  // Set up default settings for pixelmatch.
  settings = {
    failureThreshold: 0,
    failureThresholdType: 'pixel',
    pixelmatch: { threshold: 0.1 },
    ...settings
  }

  // Load the PDF objects.
  const pdfObjects = await getPdfObjects(pdf1, pdf2)

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

    // Get an image of the current page for both PDFs.
    const [ pageImg1, pageImg2, error ] = await getPageImages(pdfObjects, i)

    if (error) {
      console.error(error)
    } else {
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
