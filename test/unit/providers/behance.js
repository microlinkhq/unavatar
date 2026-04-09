'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/behance')

test('.getAvatarUrl builds a Behance profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.behance.net/kikobeats')
})

test('.getter extracts og:image from behance fixture markup', t => {
  const html = `
    <html>
      <head>
        <meta name="twitter:image" content="https://pps.services.adobe.com/api/profile/C3404AEA5C0293B50A495EEF@AdobeID/image/825fca5d-0140-41b5-a880-4826c471e7d1/276" />
        <meta property="og:image" content="https://pps.services.adobe.com/api/profile/C3404AEA5C0293B50A495EEF@AdobeID/image/825fca5d-0140-41b5-a880-4826c471e7d1/276" />
      </head>
    </html>
  `
  const $ = cheerio.load(html)

  const createHtmlProvider = opts => opts

  const behance = require('../../../src/providers/behance')({
    createHtmlProvider,
    getOgImage
  })

  t.is(
    behance.getter($),
    'https://pps.services.adobe.com/api/profile/C3404AEA5C0293B50A495EEF@AdobeID/image/825fca5d-0140-41b5-a880-4826c471e7d1/276'
  )
})
