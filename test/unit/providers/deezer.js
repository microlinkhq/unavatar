'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/deezer')
const getOgImage = require('../../../src/util/get-og-image')

const NOT_FOUND = Symbol('NOT_FOUND')

const avatarUrl =
  'https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/500x500.jpg'

const load = ogImage =>
  cheerio.load(
    `<html><head><meta property="og:image" content="${ogImage}"></head></html>`
  )

test('.getAvatarUrl defaults to artist profile path', t => {
  t.is(getAvatarUrl('27'), 'https://www.deezer.com/en/artist/27')
})

test('.getAvatarUrl with explicit album type', t => {
  t.is(getAvatarUrl('album:302127'), 'https://www.deezer.com/en/album/302127')
})

test('.getAvatarUrl with explicit playlist type', t => {
  t.is(
    getAvatarUrl('playlist:908622995'),
    'https://www.deezer.com/en/playlist/908622995'
  )
})

test('.getAvatar returns the og:image artwork', t => {
  const $ = load(avatarUrl)
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), avatarUrl)
})

test('.getAvatar treats the empty-hash placeholder as a miss', t => {
  const $ = load('https://cdn-images.dzcdn.net/images/artist//500x500.jpg')
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar returns NOT_FOUND when there is no og:image', t => {
  const $ = cheerio.load('<html><head></head></html>')
  t.is(getAvatar({ $, getOgImage, NOT_FOUND }), NOT_FOUND)
})
