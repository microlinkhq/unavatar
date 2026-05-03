'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')
const {
  getAvatarUrl,
  getAvatar
} = require('../../../src/providers/thingiverse')

test('.getAvatarUrl returns Thingiverse profile URL', t => {
  t.is(getAvatarUrl('vitaminrad'), 'https://www.thingiverse.com/vitaminrad')
})

const createHtmlProvider = opts => opts

const thingiverse = require('../../../src/providers/thingiverse')({
  createHtmlProvider,
  getOgImage
})

test('getter extracts avatar URL from og:image in Thingiverse markup', t => {
  const html =
    '<html><head>' +
    '<meta property="og:image" content="https://resize.thingiverse.com/?url=https://cdn.thingiverse.com/renders/76/a7/80/22/dc/IMG_0309.jpg&w=292&h=219&fit=contain&cbg=white&n=-1" />' +
    '</head><body></body></html>'
  const $ = cheerio.load(html)

  t.is(
    thingiverse.getter($),
    'https://cdn.thingiverse.com/renders/76/a7/80/22/dc/IMG_0309.jpg'
  )
})

test('getter throws when og:image is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  const error = t.throws(() => thingiverse.getter($))
  t.is(error?.name, 'TypeError')
})

test('.getAvatar returns null when url query parameter is missing', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta property="og:image" content="https://cdn.thingiverse.com/avatar.jpg"/>' +
      '</head></html>'
  )

  t.is(getAvatar({ getOgImage, $ }), null)
})
