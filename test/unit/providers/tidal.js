'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/tidal')
const getOgImage = require('../../../src/util/get-og-image')

const NOT_FOUND = Symbol('NOT_FOUND')

const avatarUrl =
  'https://resources.tidal.com/images/3e712fb2/9610/4cab/ac20/fb63cfcaa45f/750x750.jpg'

const load = ogImage =>
  cheerio.load(
    `<html><head><meta property="og:image" content="${ogImage}"></head></html>`
  )

test('.getAvatarUrl defaults to artist profile path', t => {
  t.is(getAvatarUrl('1566'), 'https://tidal.com/artist/1566')
})

test('.getAvatarUrl with explicit album type', t => {
  t.is(getAvatarUrl('album:1765857'), 'https://tidal.com/album/1765857')
})

test('.getAvatarUrl with explicit playlist type', t => {
  t.is(
    getAvatarUrl('playlist:c3c18106-c4f5-4021-bb18-108255c1f450'),
    'https://tidal.com/playlist/c3c18106-c4f5-4021-bb18-108255c1f450'
  )
})

test('.getAvatar returns the og:image artwork', t => {
  const $ = load(avatarUrl)
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), avatarUrl)
})

test('.getAvatar treats the generic share image as a miss', t => {
  const $ = load('https://tidal.com/img/FB_1200x627.png')
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar returns NOT_FOUND when there is no og:image', t => {
  const $ = cheerio.load('<html><head></head></html>')
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), NOT_FOUND)
})
