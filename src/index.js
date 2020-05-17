import pdfjs from 'pdfjs-dist';
import pixelmatch from 'pixelmatch';

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

async function getPageImage(pdfObject, i, targetWidth) {
  if (0 > i || i >= pdfObject.numPages) {
    return null
  }
  const page = await pdfObject.getPage(i + 1)
  const scale = targetWidth ? Math.floor(page.view[2]) / targetWidth : 1;

  const viewport = page.getViewport({scale: scale})
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')

  await page.render({canvasContext: context, viewport: viewport}).promise
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  return Object.assign(imageData, {
    scale: scale,
  })
}

async function pdfCompare(pdf1, pdf2, settings) {
  settings = {
    failureThreshold: 0,
    failureThresholdType: 'pixel',
    pixelmatch: { threshold: 0.1 },
    ...settings
  }

  const pdfObjects = await Promise.all([pdf1, pdf2].map(async src => {
    if (src instanceof File) {
      src = await readFileAsync(src)
    }
    return await pdfjs.getDocument(src).promise
  }))
  
  const result = {
    match: true,
    nPages: Math.max(pdfObjects[0].numPages, pdfObjects[1].numPages),
    pageResults: [],
  }

  for (var i=0; i<result.nPages; i++) {
    let match = false
    let numDiffPixels = null
    let diffImg = null
    const pageImg1 = await getPageImage(pdfObjects[0], i)
    const pageImg2 = await getPageImage(pdfObjects[1], i, pageImg1 && pageImg1.width)

    if (!pageImg1 || !pageImg2) {
      console.error('missing page!', pageImg1, pageImg2)
    }
    else if (pageImg1.width !== pageImg2.width || pageImg2.height !== pageImg2.height) {
      console.error('different sizes!', pageImg1, pageImg2)
    }
    else {
      const diffCanvas = document.createElement('canvas')
      diffImg = diffCanvas.getContext('2d').createImageData(pageImg1.width, pageImg1.height)
      numDiffPixels = pixelmatch(pageImg1.data, pageImg2.data, diffImg.data, diffImg.width, diffImg.height, settings.pixelmatch)

      if (settings.failureThresholdType === 'percent') {
        const numPixels = pageImg1.width * pageImg1.height
        const proportionDifferent = numDiffPixels / numPixels
        match = proportionDifferent <= settings.failureThreshold
      } else {
        match = numDiffPixels <= settings.failureThreshold
      }
    }

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

export default pdfCompare
