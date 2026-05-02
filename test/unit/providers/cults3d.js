'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')
const { getAvatarUrl } = require('../../../src/providers/cults3d')

test('.getAvatarUrl returns Cults3D profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://cults3d.com/en/users/kikobeats')
})

test('.getAvatarUrl strips @ prefix from input', t => {
  t.is(getAvatarUrl('@kikobeats'), 'https://cults3d.com/en/users/kikobeats')
})

const createHtmlProvider = opts => opts

const cults3d = require('../../../src/providers/cults3d')({
  createHtmlProvider,
  getOgImage
})

test('getter extracts avatar URL from og:image', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta property="og:image" content="https://fbi.cults3d.com/uploaders/123456/avatar/760/profile.jpg" />' +
      '</head></html>'
  )

  t.is(
    cults3d.getter($),
    'https://fbi.cults3d.com/uploaders/123456/avatar/760/profile.jpg'
  )
})

test('getter returns undefined when og:image is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(cults3d.getter($), undefined)
})
