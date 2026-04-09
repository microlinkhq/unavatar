'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')

const { getAvatarUrl } = require('../../../src/providers/threads')

test('.getAvatarUrl prepends @ when missing', t => {
  t.is(getAvatarUrl('zuck'), 'https://www.threads.com/@zuck')
})

test('.getAvatarUrl keeps existing @ prefix', t => {
  t.is(getAvatarUrl('@zuck'), 'https://www.threads.com/@zuck')
})

const createHtmlProvider = opts => opts

const threads = require('../../../src/providers/threads')({
  createHtmlProvider,
  getOgImage
})

test('getter extracts og:image from property attribute', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta property="og:image" content="https://scontent.cdninstagram.com/avatar.jpg"/>' +
      '</head></html>'
  )

  t.is(threads.getter($), 'https://scontent.cdninstagram.com/avatar.jpg')
})

test('getter extracts og:image from name attribute', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta name="og:image" content="https://scontent.cdninstagram.com/avatar-name.jpg"/>' +
      '</head></html>'
  )

  t.is(threads.getter($), 'https://scontent.cdninstagram.com/avatar-name.jpg')
})

test('getter returns undefined when og:image is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(threads.getter($), undefined)
})
