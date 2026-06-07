'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/strava')

test('.getAvatarUrl builds strava athlete profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.strava.com/athletes/kikobeats')
})

const createHtmlProvider = opts => opts

const strava = require('../../../src/providers/strava')({
  createHtmlProvider,
  getOgImage
})

test('getter extracts og:image from property attribute', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta property="og:image" content="https://dgalywyr863hv.cloudfront.net/pictures/athletes/7201594/2189962/2/full.jpg"/>' +
      '</head></html>'
  )

  t.is(
    strava.getter($),
    'https://dgalywyr863hv.cloudfront.net/pictures/athletes/7201594/2189962/2/full.jpg'
  )
})

test('getter extracts og:image from name attribute', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta name="og:image" content="https://dgalywyr863hv.cloudfront.net/pictures/athletes/7201594/2189962/2/full.jpg"/>' +
      '</head></html>'
  )

  t.is(
    strava.getter($),
    'https://dgalywyr863hv.cloudfront.net/pictures/athletes/7201594/2189962/2/full.jpg'
  )
})

test('getter returns undefined when og:image is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(strava.getter($), undefined)
})
