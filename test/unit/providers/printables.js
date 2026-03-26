'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/printables')

test('.getAvatarUrl prepends @ when missing', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.printables.com/@kikobeats')
})

test('.getAvatarUrl keeps existing @ prefix', t => {
  t.is(getAvatarUrl('@kikobeats'), 'https://www.printables.com/@kikobeats')
})

const createHtmlProvider = opts => opts
const getOgImage = $ =>
  $('meta[property="og:image"]').attr('content') ||
  $('meta[name="og:image"]').attr('content')

const printables = require('../../../src/providers/printables')({
  createHtmlProvider,
  getOgImage
})

test('getter extracts og:image from name attribute', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta name="og:image" content="https://media.printables.com/media/auth/avatars/cd/thumbs/cover/320x320/jpg/cd02bb1d.jpg"/>' +
      '</head></html>'
  )
  t.is(
    printables.getter($),
    'https://media.printables.com/media/auth/avatars/cd/thumbs/cover/320x320/jpg/cd02bb1d.jpg'
  )
})

test('getter extracts og:image from property attribute', t => {
  const $ = cheerio.load(
    '<html><head>' +
      '<meta property="og:image" content="https://media.printables.com/avatar.jpg"/>' +
      '</head></html>'
  )
  t.is(printables.getter($), 'https://media.printables.com/avatar.jpg')
})

test('getter returns undefined when og:image is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(printables.getter($), undefined)
})
