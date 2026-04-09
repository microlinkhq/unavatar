'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/snapchat')

test('.getAvatarUrl prepends @ when missing', t => {
  t.is(
    getAvatarUrl('teddysdaytoday'),
    'https://www.snapchat.com/@teddysdaytoday'
  )
})

test('.getAvatarUrl keeps existing @ prefix', t => {
  t.is(
    getAvatarUrl('@teddysdaytoday'),
    'https://www.snapchat.com/@teddysdaytoday'
  )
})

test('.getter extracts og:image from snapchat html markup', t => {
  const html = `
    <html>
      <head>
        <meta property="og:image" content="https://us-east1-aws.api.snapchat.com/web-capture/www.snapchat.com/@teddysdaytoday/preview/square.jpeg?xp_id=1" />
      </head>
    </html>
  `
  const $ = cheerio.load(html)

  const createHtmlProvider = opts => opts

  const snapchat = require('../../../src/providers/snapchat')({
    createHtmlProvider,
    getOgImage
  })

  t.is(
    snapchat.getter($),
    'https://us-east1-aws.api.snapchat.com/web-capture/www.snapchat.com/@teddysdaytoday/preview/square.jpeg?xp_id=1'
  )
})
