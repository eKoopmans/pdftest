import * as pixelmatch from 'pixelmatch'
import { getPdfObjects, getPageImages } from './util/read-pdf'
import { showDiff } from './ui'
import { getSnapshot } from '../shared/api'

async function comparePage(pdfObjects, page, settings) {
  // Initialise the page match results.
  let match = false
  let numDiffPixels = null
  let diffImg = null

  // Get an image of the current page for both PDFs.
  const [ pageImg1, pageImg2, error ] = await getPageImages(pdfObjects, page)

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
  return {
    match: match,
    pageImg: [pageImg1, pageImg2],
    diffImg: diffImg,
    numDiffPixels: numDiffPixels,
  }
}

export async function compare(pdf1, pdf2, settings) {
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
    source: [ pdf1, pdf2 ],
  }

  // Compare all pages asynchronously and wait for all to finish.
  const pagePromises = [...Array(result.nPages)].map(async (_val, i) => {
    result.pageResults[i] = await comparePage(pdfObjects, i, settings)
    result.match = result.match && result.pageResults[i].match
  })
  await Promise.all(pagePromises)

  return result
}

export async function compareToSnapshot(pdf, snapshotName, settings) {
  const snapshot = await getSnapshot(snapshotName, pdf)
  const comparison = await compare(pdf, snapshot, settings)
  return comparison.match ? comparison : await showDiff(comparison, snapshotName)
}
