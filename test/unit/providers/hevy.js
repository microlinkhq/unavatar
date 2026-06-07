'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/hevy')

test('.getAvatarUrl builds hevy profile URL from username', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://hevy.com/user/kikobeats')
})

const createHtmlProvider = opts => opts

const hevy = require('../../../src/providers/hevy')({
  createHtmlProvider,
  getOgImage
})

test('getter extracts og:image from property attribute', t => {
  const avatarUrl =
    'https://d2l9nsnmtah87f.cloudfront.net/profile-images/kikobeats-2268a9b2-ba40-4dd0-a509-1debcbc56f46.jpg'
  const $ = cheerio.load(
    '<html><head>' +
      `<meta property="og:image" content="${avatarUrl}"/>` +
      '</head></html>'
  )

  t.is(hevy.getter($), avatarUrl)
})

test('getter extracts og:image from name attribute', t => {
  const avatarUrl =
    'https://d2l9nsnmtah87f.cloudfront.net/profile-images/example.jpg'
  const $ = cheerio.load(
    '<html><head>' +
      `<meta name="og:image" content="${avatarUrl}"/>` +
      '</head></html>'
  )

  t.is(hevy.getter($), avatarUrl)
})

test('getter returns undefined when og:image is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(hevy.getter($), undefined)
})
