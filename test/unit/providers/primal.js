'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/primal')

test('.getAvatarUrl builds primal profile URL from username', t => {
  t.is(getAvatarUrl('jack'), 'https://primal.net/jack')
})

const createHtmlProvider = opts => opts

const primal = require('../../../src/providers/primal')({
  createHtmlProvider,
  getOgImage
})

test('getter extracts og:image from property attribute', t => {
  const avatarUrl =
    'https://primal.net/media-cache?u=https%3A%2F%2Fprimaldata.s3.us-east-005.backblazeb2.com%2Fcache%2Fa%2Ffc%2F0d%2Fafc0d68451059f66ed7d08928c57deca0542fb21159b3f2e19d9e4d345df49e4.jpg'
  const $ = cheerio.load(
    '<html><head>' +
      `<meta property="og:image" content="${avatarUrl}"/>` +
      '</head></html>'
  )

  t.is(primal.getter($), avatarUrl)
})

test('getter extracts og:image from name attribute', t => {
  const avatarUrl =
    'https://primal.net/media-cache?u=https%3A%2F%2Fexample.com%2Favatar.jpg'
  const $ = cheerio.load(
    '<html><head>' +
      `<meta name="og:image" content="${avatarUrl}"/>` +
      '</head></html>'
  )

  t.is(primal.getter($), avatarUrl)
})

test('getter returns undefined when og:image is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(primal.getter($), undefined)
})
