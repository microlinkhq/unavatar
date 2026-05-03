'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { NOT_FOUND } = require('../../../src/util/html-provider')
const { getAvatar } = require('../../../src/providers/psnprofiles')

test('getAvatar returns NOT_FOUND when og:image is missing', t => {
  const $ = cheerio.load('<html><title>PSNProfiles</title></html>')

  t.is(
    getAvatar({
      $,
      getOgImage: $ => $('meta[property="og:image"]').attr('content'),
      NOT_FOUND
    }),
    NOT_FOUND
  )
})

test('getAvatar returns og:image when present', t => {
  const $ = cheerio.load(
    '<meta property="og:image" content="https://i.psnprofiles.com/avatar.png" />'
  )

  t.is(
    getAvatar({
      $,
      getOgImage: $ => $('meta[property="og:image"]').attr('content'),
      NOT_FOUND
    }),
    'https://i.psnprofiles.com/avatar.png'
  )
})
